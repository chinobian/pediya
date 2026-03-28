import type { Producto, CartItem } from '../types'
import { formatPrecio } from '../utils/format'

interface Props {
  producto: Producto
  cartItem?: CartItem
  onAdd: (producto: Producto) => void
  onRemove: (productoId: string) => void
}

export function ProductCard({ producto, cartItem, onAdd, onRemove }: Props) {
  const cantidad = cartItem?.cantidad ?? 0

  return (
    <div className="flex items-center justify-between bg-neutral-800/50 rounded-xl px-4 py-3 transition-all duration-200">
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">
          {producto.nombre}
        </p>
        <p className="text-amber-400 text-sm font-semibold mt-0.5">
          {formatPrecio(producto.precio)}
        </p>
      </div>

      {cantidad === 0 ? (
        <button
          onClick={() => onAdd(producto)}
          className="ml-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold text-sm px-4 py-2 rounded-lg transition-all duration-150 shrink-0 cursor-pointer"
        >
          Agregar
        </button>
      ) : (
        <div className="ml-3 flex items-center gap-2 shrink-0">
          <button
            onClick={() => onRemove(producto.id)}
            className="w-8 h-8 rounded-lg bg-neutral-700 hover:bg-neutral-600 active:scale-95 text-white font-bold text-lg flex items-center justify-center transition-all duration-150 cursor-pointer"
          >
            -
          </button>
          <span className="text-white font-semibold text-sm w-6 text-center">
            {cantidad}
          </span>
          <button
            onClick={() => onAdd(producto)}
            className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold text-lg flex items-center justify-center transition-all duration-150 cursor-pointer"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}
