import { useState } from 'react'
import type { CartItem } from '../types'
import { formatPrecio } from '../utils/format'

interface Props {
  items: CartItem[]
  totalItems: number
  totalPrecio: number
  onAdd: (productoId: string) => void
  onRemove: (productoId: string) => void
  onConfirm: () => void
  confirming: boolean
  disabled?: boolean
}

export function Cart({
  items,
  totalItems,
  totalPrecio,
  onAdd,
  onRemove,
  onConfirm,
  confirming,
  disabled,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  if (totalItems === 0) return null

  return (
    <>
      {expanded && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setExpanded(false)}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50">
        {expanded && (
          <div className="bg-neutral-900 border-t border-neutral-700 rounded-t-2xl max-h-[60vh] overflow-y-auto mx-auto max-w-lg animate-slide-up">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Tu pedido</h3>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-neutral-400 hover:text-white text-2xl leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div
                    key={item.producto.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">
                        {item.producto.nombre}
                      </p>
                      <p className="text-neutral-400 text-xs">
                        {formatPrecio(item.producto.precio)} c/u
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={() => onRemove(item.producto.id)}
                        className="w-7 h-7 rounded-md bg-neutral-700 hover:bg-neutral-600 text-white font-bold text-sm flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-white text-sm w-5 text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => onAdd(item.producto.id)}
                        className="w-7 h-7 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-amber-400 font-semibold text-sm ml-3 w-24 text-right">
                      {formatPrecio(item.producto.precio * item.cantidad)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-700 mt-4 pt-4 flex items-center justify-between">
                <span className="text-neutral-400 text-sm">Total</span>
                <span className="text-white font-bold text-lg">
                  {formatPrecio(totalPrecio)}
                </span>
              </div>

              <button
                onClick={onConfirm}
                disabled={confirming || disabled}
                className="w-full mt-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 text-black font-bold py-3.5 rounded-xl text-base transition-all duration-150 cursor-pointer disabled:cursor-not-allowed"
              >
                {disabled
                  ? 'Esperá a que te atiendan'
                  : confirming
                    ? 'Enviando...'
                    : 'Confirmar pedido'}
              </button>
            </div>
          </div>
        )}

        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold py-4 px-6 flex items-center justify-between text-base transition-all duration-150 cursor-pointer max-w-lg mx-auto rounded-t-2xl"
          >
            <span className="flex items-center gap-2">
              <span className="bg-black/20 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                {totalItems}
              </span>
              Ver pedido
            </span>
            <span>{formatPrecio(totalPrecio)}</span>
          </button>
        )}
      </div>
    </>
  )
}
