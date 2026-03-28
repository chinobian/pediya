import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export type MesaActiveStatus =
  | { type: 'idle' }
  | { type: 'pedido_pendiente' }
  | { type: 'accion_pendiente'; accion: 'llamar_mozo' | 'pedir_cuenta' }

export function useMesaStatus(mesaId: string | undefined) {
  const [status, setStatus] = useState<MesaActiveStatus>({ type: 'idle' })

  const refresh = useCallback(async () => {
    if (!mesaId) return

    // Check pending orders
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('id')
      .eq('mesa_id', mesaId)
      .in('estado', ['pendiente', 'listo'])
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

  useEffect(() => {
    refresh()
  }, [refresh])

  // Listen for realtime changes to re-check status
  useEffect(() => {
    if (!mesaId) return

    const channel = supabase
      .channel(`mesa-status-${mesaId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos', filter: `mesa_id=eq.${mesaId}` },
        () => refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'acciones_mesa', filter: `mesa_id=eq.${mesaId}` },
        () => refresh()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mesaId, refresh])

  return { status, refresh }
}
