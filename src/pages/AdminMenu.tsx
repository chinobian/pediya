import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Categoria, Producto } from '../types'
import { formatPrecio } from '../utils/format'

export function AdminMenu() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')

  // Category form
  const [showCatForm, setShowCatForm] = useState(false)
  const [editingCat, setEditingCat] = useState<Categoria | null>(null)
  const [catNombre, setCatNombre] = useState('')
  const [savingCat, setSavingCat] = useState(false)

  // Product form
  const [showProdForm, setShowProdForm] = useState(false)
  const [editingProd, setEditingProd] = useState<Producto | null>(null)
  const [prodNombre, setProdNombre] = useState('')
  const [prodPrecio, setProdPrecio] = useState('')
  const [prodCategoria, setProdCategoria] = useState('')
  const [savingProd, setSavingProd] = useState(false)

  // Delete confirmation
  const [deletingProdId, setDeletingProdId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const [catRes, prodRes] = await Promise.all([
      supabase.from('categorias').select('*').order('orden', { ascending: true }),
      supabase.from('productos').select('*').order('nombre', { ascending: true }),
    ])
    if (catRes.data) setCategorias(catRes.data)
    if (prodRes.data) setProductos(prodRes.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ─── Category CRUD ──────────────────────────────────

  const openCatForm = (cat?: Categoria) => {
    if (cat) {
      setEditingCat(cat)
      setCatNombre(cat.nombre)
    } else {
      setEditingCat(null)
      setCatNombre('')
    }
    setShowCatForm(true)
  }

  const saveCat = async () => {
    if (!catNombre.trim()) return
    setSavingCat(true)

    if (editingCat) {
      await supabase
        .from('categorias')
        .update({ nombre: catNombre.trim() })
        .eq('id', editingCat.id)
    } else {
      const maxOrden = categorias.length > 0
        ? Math.max(...categorias.map((c) => c.orden))
        : 0
      await supabase.from('categorias').insert({
        nombre: catNombre.trim(),
        orden: maxOrden + 1,
        activa: true,
      })
    }

    setShowCatForm(false)
    setCatNombre('')
    setEditingCat(null)
    setSavingCat(false)
    fetchData()
  }

  const toggleCatActiva = async (cat: Categoria) => {
    await supabase
      .from('categorias')
      .update({ activa: !cat.activa })
      .eq('id', cat.id)
    fetchData()
  }

  const moveCat = async (cat: Categoria, direction: 'up' | 'down') => {
    const idx = categorias.findIndex((c) => c.id === cat.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= categorias.length) return

    const other = categorias[swapIdx]
    await Promise.all([
      supabase.from('categorias').update({ orden: other.orden }).eq('id', cat.id),
      supabase.from('categorias').update({ orden: cat.orden }).eq('id', other.id),
    ])
    fetchData()
  }

  // ─── Product CRUD ──────────────────────────────────

  const openProdForm = (prod?: Producto) => {
    if (prod) {
      setEditingProd(prod)
      setProdNombre(prod.nombre)
      setProdPrecio(String(prod.precio))
      setProdCategoria(prod.categoria_id)
    } else {
      setEditingProd(null)
      setProdNombre('')
      setProdPrecio('')
      setProdCategoria(categorias[0]?.id ?? '')
    }
    setShowProdForm(true)
  }

  const saveProd = async () => {
    if (!prodNombre.trim() || !prodPrecio || !prodCategoria) return
    setSavingProd(true)

    const data = {
      nombre: prodNombre.trim(),
      precio: parseFloat(prodPrecio),
      categoria_id: prodCategoria,
    }

    if (editingProd) {
      await supabase.from('productos').update(data).eq('id', editingProd.id)
    } else {
      await supabase.from('productos').insert({ ...data, disponible: true })
    }

    setShowProdForm(false)
    setEditingProd(null)
    setSavingProd(false)
    fetchData()
  }

  const toggleProdDisponible = async (prod: Producto) => {
    await supabase
      .from('productos')
      .update({ disponible: !prod.disponible })
      .eq('id', prod.id)
    fetchData()
  }

  const deleteProd = async (id: string) => {
    await supabase.from('productos').delete().eq('id', id)
    setDeletingProdId(null)
    fetchData()
  }

  const productosFiltrados =
    filtroCategoria === 'todas'
      ? productos
      : productos.filter((p) => p.categoria_id === filtroCategoria)

  const getCatNombre = (catId: string) =>
    categorias.find((c) => c.id === catId)?.nombre ?? '—'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800">
        <div className="px-4 py-3">
          <span className="text-amber-500 font-bold text-xl tracking-tight">
            pediya
            <span className="text-neutral-500 font-normal text-sm ml-2">
              menú
            </span>
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-5">
        {/* Desktop title */}
        <h1 className="hidden lg:block text-white font-bold text-2xl mb-6">
          Gestión de Menú
        </h1>

        {/* ─── CATEGORÍAS ─── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Categorías</h2>
            <button
              onClick={() => openCatForm()}
              className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-semibold text-sm px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              + Nueva categoría
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {categorias.map((cat, idx) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between bg-neutral-800/50 rounded-xl px-4 py-3 border transition-all ${
                  cat.activa
                    ? 'border-neutral-700/50'
                    : 'border-neutral-700/30 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveCat(cat, 'up')}
                      disabled={idx === 0}
                      className="text-neutral-500 hover:text-white disabled:opacity-20 text-xs cursor-pointer disabled:cursor-default"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveCat(cat, 'down')}
                      disabled={idx === categorias.length - 1}
                      className="text-neutral-500 hover:text-white disabled:opacity-20 text-xs cursor-pointer disabled:cursor-default"
                    >
                      ▼
                    </button>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {cat.nombre}
                    </p>
                    <p className="text-neutral-500 text-xs">
                      {productos.filter((p) => p.categoria_id === cat.id).length}{' '}
                      producto(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openCatForm(cat)}
                    className="text-neutral-400 hover:text-white bg-neutral-700/50 hover:bg-neutral-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => toggleCatActiva(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      cat.activa
                        ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                        : 'bg-neutral-700/50 text-neutral-500 hover:bg-neutral-700'
                    }`}
                  >
                    {cat.activa ? 'Activa' : 'Inactiva'}
                  </button>
                </div>
              </div>
            ))}
            {categorias.length === 0 && (
              <p className="text-neutral-500 text-center py-8">
                No hay categorías. Creá la primera.
              </p>
            )}
          </div>
        </section>

        {/* ─── PRODUCTOS ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Productos</h2>
            <button
              onClick={() => openProdForm()}
              disabled={categorias.length === 0}
              className="bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-40 text-black font-semibold text-sm px-4 py-2 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              + Nuevo producto
            </button>
          </div>

          {/* Filter by category */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setFiltroCategoria('todas')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filtroCategoria === 'todas'
                  ? 'bg-amber-500 text-black'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFiltroCategoria(cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filtroCategoria === cat.id
                    ? 'bg-amber-500 text-black'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {productosFiltrados.map((prod) => (
              <div
                key={prod.id}
                className={`flex items-center justify-between bg-neutral-800/50 rounded-xl px-4 py-3 border transition-all ${
                  prod.disponible
                    ? 'border-neutral-700/50'
                    : 'border-neutral-700/30 opacity-50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium text-sm truncate">
                    {prod.nombre}
                  </p>
                  <p className="text-neutral-500 text-xs">
                    {getCatNombre(prod.categoria_id)} ·{' '}
                    <span className="text-amber-400">
                      {formatPrecio(prod.precio)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => openProdForm(prod)}
                    className="text-neutral-400 hover:text-white bg-neutral-700/50 hover:bg-neutral-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => toggleProdDisponible(prod)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      prod.disponible
                        ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                        : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                    }`}
                  >
                    {prod.disponible ? 'Disponible' : 'No disponible'}
                  </button>
                  {deletingProdId === prod.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteProd(prod.id)}
                        className="bg-red-600 hover:bg-red-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setDeletingProdId(null)}
                        className="bg-neutral-700 hover:bg-neutral-600 text-neutral-300 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingProdId(prod.id)}
                      className="text-neutral-500 hover:text-red-400 bg-neutral-700/50 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
            {productosFiltrados.length === 0 && (
              <p className="text-neutral-500 text-center py-8">
                No hay productos{filtroCategoria !== 'todas' ? ' en esta categoría' : ''}.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* ─── MODAL: Category Form ─── */}
      {showCatForm && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowCatForm(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-md mx-auto animate-slide-up">
            <h3 className="text-white font-bold text-lg mb-4">
              {editingCat ? 'Editar categoría' : 'Nueva categoría'}
            </h3>
            <input
              type="text"
              value={catNombre}
              onChange={(e) => setCatNombre(e.target.value)}
              placeholder="Nombre de la categoría"
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && saveCat()}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCatForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-neutral-400 bg-neutral-800 hover:bg-neutral-700 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={saveCat}
                disabled={!catNombre.trim() || savingCat}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {savingCat ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ─── MODAL: Product Form ─── */}
      {showProdForm && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowProdForm(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-md mx-auto animate-slide-up">
            <h3 className="text-white font-bold text-lg mb-4">
              {editingProd ? 'Editar producto' : 'Nuevo producto'}
            </h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={prodNombre}
                onChange={(e) => setProdNombre(e.target.value)}
                placeholder="Nombre del producto"
                className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                autoFocus
              />
              <input
                type="number"
                value={prodPrecio}
                onChange={(e) => setProdPrecio(e.target.value)}
                placeholder="Precio (ej: 2500)"
                step="0.01"
                min="0"
                className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
              <select
                value={prodCategoria}
                onChange={(e) => setProdCategoria(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Seleccionar categoría
                </option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowProdForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-neutral-400 bg-neutral-800 hover:bg-neutral-700 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={saveProd}
                disabled={
                  !prodNombre.trim() || !prodPrecio || !prodCategoria || savingProd
                }
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {savingProd ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
