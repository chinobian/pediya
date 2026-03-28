import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export type MesaActiveStatus =
  | { type: 'idle' }
  | { type: 'pedido_pendiente' }
  | { type: 'accion_pendiente'; accion: 'llamar_mozo' | 'pedir_cuenta' }

const POLL_INTERVAL_MS = 5_000

export function useMesaStatus(mesaId: string | undefined) {
  const [status, setStatus] = useState<MesaActiveStatus>({ type: 'idle' })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async () => {
    if (!mesaId) return

    // Check pending orders (only 'pendiente' — 'listo' means already dispatched)
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('id')
      .eq('mesa_id', mesaId)
      .eq('estado', 'pendiente')
      .limit(1)

    if (pedidos && pedidos.length > 0) {
      setStatus({ type: 'pedido_pendiente' })
      return
    }

    // Check unattended actions
    const { data: acciones } = await supabase
      .from('acciones_mesa')
      .select('tipo')
      .eq('mesa_id', mesaId)
      .eq('atendida', false)
      .limit(1)

    if (acciones && acciones.length > 0) {
      setStatus({
        type: 'accion_pendiente',
        accion: acciones[0].tipo as 'llamar_mozo' | 'pedir_cuenta',
      })
      return
    }

    setStatus({ type: 'idle' })
  }, [mesaId])

  // Initial fetch
  useEffect(() => {
    refresh()
  }, [refresh])

  // Realtime + polling fallback
  useEffect(() => {
    if (!mesaId) return

    // Realtime
    const channel = supabase
      .channel(`mesa-status-${mesaId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        (payload) => {
          const row = (payload.new || payload.old) as any
          if (row?.mesa_id === mesaId) refresh()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'acciones_mesa' },
        (payload) => {
          const row = (payload.new || payload.old) as any
          if (row?.mesa_id === mesaId) refresh()
        }
      )
      .subscribe()

    // Polling as fallback in case realtime misses events
    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS)

    return () => {
      supabase.removeChannel(channel)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [mesaId, refresh])

  return { status, refresh }
}
