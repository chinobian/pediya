import type { AccionMesa } from '../types'

interface Props {
  accion: AccionMesa
  onAtender: (accionId: string) => void
}

export function AccionAlert({ accion, onAtender }: Props) {
  const mesaNumero = accion.mesa?.numero ?? '?'
  const esMozo = accion.tipo === 'llamar_mozo'

  return (
    <div
      className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-all duration-300 ${
        esMozo
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-blue-500/10 border-blue-500/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg ${
            esMozo ? 'bg-amber-500 text-black' : 'bg-blue-500 text-white'
          }`}
        >
          {mesaNumero}
        </span>
        <div>
          <p className="text-white font-semibold text-sm">
            Mesa {mesaNumero}
          </p>
          <p
            className={`text-xs font-medium ${
              esMozo ? 'text-amber-400' : 'text-blue-400'
            }`}
          >
            {esMozo ? 'Llama al mozo' : 'Pide la cuenta'}
          </p>
        </div>
      </div>
      <button
        onClick={() => onAtender(accion.id)}
        className="text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 active:scale-95 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer"
      >
        Atender
      </button>
    </div>
  )
}
