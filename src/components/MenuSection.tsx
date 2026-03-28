import type { Categoria, Producto, CartItem } from '../types'
import { ProductCard } from './ProductCard'

interface Props {
  categoria: Categoria
  productos: Producto[]
  cartItems: CartItem[]
  onAdd: (producto: Producto) => void
  onRemove: (productoId: string) => void
}

export function MenuSection({
  categoria,
  productos,
  cartItems,
  onAdd,
  onRemove,
}: Props) {
  if (productos.length === 0) return null

  return (
    <section className="mb-6">
      <h2 className="text-amber-400/80 text-xs font-bold uppercase tracking-widest mb-3 px-1">
        {categoria.nombre}
      </h2>
      <div className="flex flex-col gap-2">
        {productos.map((producto) => (
          <ProductCard
            key={producto.id}
            producto={producto}
            cartItem={cartItems.find((i) => i.producto.id === producto.id)}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  )
}
