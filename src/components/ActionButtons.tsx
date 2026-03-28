import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  mesaId: string
  disabled?: boolean
  onAction?: () => void
}

const COOLDOWN_MS = 30_000

export function ActionButtons({ mesaId, disabled, onAction }: Props) {
  const [mozoCooldown, setMozoCooldown] = useState(false)
  const [cuentaCooldown, setCuentaCooldown] = useState(false)
  const [mozoFeedback, setMozoFeedback] = useState(false)
  const [cuentaFeedback, setCuentaFeedback] = useState(false)

  const handleAccion = useCallback(
    async (tipo: 'llamar_mozo' | 'pedir_cuenta') => {
      const setCooldown =
        tipo === 'llamar_mozo' ? setMozoCooldown : setCuentaCooldown
      const setFeedback =
        tipo === 'llamar_mozo' ? setMozoFeedback : setCuentaFeedback

      setCooldown(true)
      setFeedback(true)

      await supabase.from('acciones_mesa').insert({ mesa_id: mesaId, tipo })

      onAction?.()

      setTimeout(() => setFeedback(false), 2000)
      setTimeout(() => setCooldown(false), COOLDOWN_MS)
    },
    [mesaId, onAction]
  )

  return (
    <div className="flex gap-3">
      <button
        disabled={disabled || mozoCooldown}
        onClick={() => handleAccion('llamar_mozo')}
        className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer disabled:cursor-not-allowed border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
      >
        {mozoFeedback ? 'Mozo notificado!' : 'Llamar al mozo'}
      </button>
      <button
        disabled={disabled || cuentaCooldown}
        onClick={() => handleAccion('pedir_cuenta')}
        className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer disabled:cursor-not-allowed border border-neutral-600 text-neutral-300 hover:bg-neutral-700/50 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
      >
        {cuentaFeedback ? 'Cuenta pedida!' : 'Pedir la cuenta'}
      </button>
    </div>
  )
}
