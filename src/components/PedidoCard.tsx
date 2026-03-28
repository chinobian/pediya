import type { PedidoConDetalle } from '../types'
import { formatPrecio } from '../utils/format'

interface Props {
  pedido: PedidoConDetalle
  isNew?: boolean
  onMarcarListo?: (pedidoId: string) => void
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  return `Hace ${diffH}h ${diffMin % 60}m`
}

export function PedidoCard({ pedido, isNew, onMarcarListo }: Props) {
  const mesaNumero = pedido.mesa?.numero ?? '?'

  return (
    <div
      className={`bg-neutral-800/70 border rounded-2xl p-5 transition-all duration-500 ${
        isNew
          ? 'border-amber-500 ring-2 ring-amber-500/30 animate-highlight'
          : 'border-neutral-700/50'
      }`}
    >
      {/* Header: mesa + time */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="bg-amber-500 text-black font-black text-2xl w-14 h-14 rounded-xl flex items-center justify-center shrink-0">
            {mesaNumero}
          </span>
          <div>
            <p className="text-white font-bold text-lg leading-tight">
              Mesa {mesaNumero}
            </p>
            <p className="text-neutral-400 text-xs mt-0.5">
              {timeAgo(pedido.created_at)}
            </p>
          </div>
        </div>
        {pedido.estado === 'listo' && (
          <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">
            Listo
          </span>
        )}
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-4">
        {pedido.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-neutral-200">
              <span className="text-amber-400 font-bold mr-1.5">
                {item.cantidad}x
              </span>
              {item.producto?.nombre ?? 'Producto'}
            </span>
            <span className="text-neutral-400 text-xs ml-2 shrink-0">
              {formatPrecio(item.precio_unitario * item.cantidad)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer: total + action */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-700/50">
        <span className="text-white font-bold text-base">
          {formatPrecio(pedido.total)}
        </span>
        {onMarcarListo && (
          <button
            onClick={() => onMarcarListo(pedido.id)}
            className="bg-green-600 hover:bg-green-500 active:scale-95 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-150 cursor-pointer"
          >
            Marcar como Listo
          </button>
        )}
      </div>
    </div>
  )
}
