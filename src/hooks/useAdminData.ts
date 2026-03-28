import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type {
  Mesa,
  Producto,
  PedidoConDetalle,
  PedidoItem,
  AccionMesa,
} from '../types'

export function useAdminData() {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [pendientes, setPendientes] = useState<PedidoConDetalle[]>([])
  const [listos, setListos] = useState<PedidoConDetalle[]>([])
  const [acciones, setAcciones] = useState<AccionMesa[]>([])
  const [loading, setLoading] = useState(true)
  const [newPedidoIds, setNewPedidoIds] = useState<Set<string>>(new Set())

  const mesasRef = useRef<Mesa[]>([])
  const productosRef = useRef<Producto[]>([])

  const getMesa = useCallback(
    (mesaId: string) => mesasRef.current.find((m) => m.id === mesaId),
    []
  )

  const getProducto = useCallback(
    (productoId: string) =>
      productosRef.current.find((p) => p.id === productoId),
    []
  )

  const enrichPedido = useCallback(
    async (pedidoId: string, mesaId: string): Promise<PedidoConDetalle | null> => {
      const { data: pedido } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single()

      if (!pedido) return null

      const { data: items } = await supabase
        .from('pedido_items')
        .select('*')
        .eq('pedido_id', pedidoId)

      return {
        ...pedido,
        mesa: getMesa(mesaId || pedido.mesa_id),
        items: (items || []).map((item: PedidoItem) => ({
          ...item,
          producto: getProducto(item.producto_id),
        })),
      }
    },
    [getMesa, getProducto]
  )

  // Initial fetch
  useEffect(() => {
    async function fetchAll() {
      setLoading(true)

      const [mesasRes, productosRes, pedidosRes, accionesRes] =
        await Promise.all([
          supabase.from('mesas').select('*'),
          supabase.from('productos').select('*'),
          supabase
            .from('pedidos')
            .select('*')
            .in('estado', ['pendiente', 'listo'])
            .order('created_at', { ascending: false }),
          supabase
            .from('acciones_mesa')
            .select('*')
            .eq('atendida', false)
            .order('created_at', { ascending: false }),
        ])

      const fetchedMesas = mesasRes.data || []
      const fetchedProductos = productosRes.data || []
      setMesas(fetchedMesas)
      setProductos(fetchedProductos)
      mesasRef.current = fetchedMesas
      productosRef.current = fetchedProductos

      const pedidos = pedidosRes.data || []

      // Fetch items for all pedidos
      const pedidoIds = pedidos.map((p) => p.id)
      const { data: allItems } = await supabase
        .from('pedido_items')
        .select('*')
        .in('pedido_id', pedidoIds)

      const itemsByPedido = (allItems || []).reduce(
        (acc: Record<string, PedidoItem[]>, item: PedidoItem) => {
          if (!acc[item.pedido_id]) acc[item.pedido_id] = []
          acc[item.pedido_id].push(item)
          return acc
        },
        {}
      )

      const enrichedPedidos: PedidoConDetalle[] = pedidos.map((p) => ({
        ...p,
        mesa: fetchedMesas.find((m) => m.id === p.mesa_id),
        items: (itemsByPedido[p.id] || []).map((item: PedidoItem) => ({
          ...item,
          producto: fetchedProductos.find((pr) => pr.id === item.producto_id),
        })),
      }))

      setPendientes(enrichedPedidos.filter((p) => p.estado === 'pendiente'))
      setListos(enrichedPedidos.filter((p) => p.estado === 'listo'))

      const enrichedAcciones: AccionMesa[] = (accionesRes.data || []).map(
        (a: AccionMesa) => ({
          ...a,
          mesa: fetchedMesas.find((m) => m.id === a.mesa_id),
        })
      )
      setAcciones(enrichedAcciones)

      setLoading(false)
    }

    fetchAll()
  }, [])

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        async (payload) => {
          const newPedido = payload.new as any
          const enriched = await enrichPedido(newPedido.id, newPedido.mesa_id)
          if (enriched && enriched.estado === 'pendiente') {
            setPendientes((prev) => [enriched, ...prev])
            setNewPedidoIds((prev) => new Set(prev).add(enriched.id))
            setTimeout(() => {
              setNewPedidoIds((prev) => {
                const next = new Set(prev)
                next.delete(enriched.id)
                return next
              })
            }, 3000)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos' },
        async (payload) => {
          const updated = payload.new as any
          if (updated.estado === 'listo') {
            setPendientes((prev) => prev.filter((p) => p.id !== updated.id))
            const enriched = await enrichPedido(updated.id, updated.mesa_id)
            if (enriched) {
              setListos((prev) => [enriched, ...prev])
            }
          } else if (updated.estado === 'entregado' || updated.estado === 'cancelado') {
            setPendientes((prev) => prev.filter((p) => p.id !== updated.id))
            setListos((prev) => prev.filter((p) => p.id !== updated.id))
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'acciones_mesa' },
        (payload) => {
          const nueva = payload.new as AccionMesa
          setAcciones((prev) => [
            { ...nueva, mesa: mesasRef.current.find((m) => m.id === nueva.mesa_id) },
            ...prev,
          ])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'acciones_mesa' },
        (payload) => {
          const updated = payload.new as AccionMesa
          if (updated.atendida) {
            setAcciones((prev) => prev.filter((a) => a.id !== updated.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enrichPedido])

  const marcarListo = useCallback(async (pedidoId: string) => {
    await supabase
      .from('pedidos')
      .update({ estado: 'listo' })
      .eq('id', pedidoId)
  }, [])

  const atenderAccion = useCallback(async (accionId: string) => {
    await supabase
      .from('acciones_mesa')
      .update({ atendida: true })
      .eq('id', accionId)
  }, [])

  return {
    mesas,
    productos,
    pendientes,
    listos,
    acciones,
    loading,
    newPedidoIds,
    marcarListo,
    atenderAccion,
  }
}
