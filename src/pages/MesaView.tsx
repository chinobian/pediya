import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Mesa, Categoria, Producto } from '../types'
import { useCart } from '../hooks/useCart'
import { MenuSection } from '../components/MenuSection'
import { Cart } from '../components/Cart'
import { ActionButtons } from '../components/ActionButtons'

export function MesaView() {
  const { numero } = useParams<{ numero: string }>()
  const [mesa, setMesa] = useState<Mesa | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [orderSent, setOrderSent] = useState(false)

  const { items, addItem, removeItem, clearCart, totalItems, totalPrecio } =
    useCart()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      const { data: mesaData, error: mesaError } = await supabase
        .from('mesas')
        .select('*')
        .eq('numero', Number(numero))
        .eq('activa', true)
        .single()

      if (mesaError || !mesaData) {
        setError('Mesa no encontrada o inactiva')
        setLoading(false)
        return
      }

      setMesa(mesaData)

      const [catRes, prodRes] = await Promise.all([
        supabase
          .from('categorias')
          .select('*')
          .eq('activa', true)
          .order('orden', { ascending: true }),
        supabase.from('productos').select('*').eq('disponible', true),
      ])

      if (catRes.data) setCategorias(catRes.data)
      if (prodRes.data) setProductos(prodRes.data)

      setLoading(false)
    }

    fetchData()
  }, [numero])

  const handleConfirm = async () => {
    if (!mesa || items.length === 0) return

    setConfirming(true)

    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        mesa_id: mesa.id,
        estado: 'pendiente',
        total: totalPrecio,
      })
      .select('id')
      .single()

    if (pedidoError || !pedido) {
      setConfirming(false)
      return
    }

    const pedidoItems = items.map((item) => ({
      pedido_id: pedido.id,
      producto_id: item.producto.id,
      cantidad: item.cantidad,
      precio_unitario: item.producto.precio,
    }))

    await supabase.from('pedido_items').insert(pedidoItems)

    clearCart()
    setConfirming(false)
    setOrderSent(true)
    setTimeout(() => setOrderSent(false), 4000)
  }

  const handleAddFromCart = (productoId: string) => {
    const producto = productos.find((p) => p.id === productoId)
    if (producto) addItem(producto)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-4xl mb-4">😕</p>
          <h1 className="text-xl font-bold text-white mb-2">{error}</h1>
          <p className="text-neutral-400 text-sm">
            Verificá el número de mesa o consultá con el personal.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-amber-500 font-bold text-lg tracking-tight">
              pediya
            </span>
            <span className="text-neutral-600 text-lg font-light">|</span>
            <img
              src="/garage-logo.svg"
              alt="Garage Craft Haus"
              className="h-7"
            />
          </div>
          <span className="bg-neutral-800 text-white text-sm font-semibold px-3 py-1 rounded-full">
            Mesa {numero}
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5">
        {/* Action Buttons */}
        <div className="mb-6">
          <ActionButtons mesaId={mesa!.id} />
        </div>

        {/* Menu */}
        {categorias.map((cat) => (
          <MenuSection
            key={cat.id}
            categoria={cat}
            productos={productos.filter((p) => p.categoria_id === cat.id)}
            cartItems={items}
            onAdd={addItem}
            onRemove={removeItem}
          />
        ))}
      </main>

      {/* Order sent confirmation */}
      {orderSent && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg animate-fade-in">
          Pedido enviado con éxito!
        </div>
      )}

      {/* Cart */}
      <Cart
        items={items}
        totalItems={totalItems}
        totalPrecio={totalPrecio}
        onAdd={handleAddFromCart}
        onRemove={removeItem}
        onConfirm={handleConfirm}
        confirming={confirming}
      />
    </div>
  )
}
