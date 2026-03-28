import { useReducer, useCallback } from 'react'
import type { CartItem, Producto } from '../types'

type CartAction =
  | { type: 'ADD'; producto: Producto }
  | { type: 'REMOVE'; productoId: string }
  | { type: 'CLEAR' }

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find((i) => i.producto.id === action.producto.id)
      if (existing) {
        return state.map((i) =>
          i.producto.id === action.producto.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      }
      return [...state, { producto: action.producto, cantidad: 1 }]
    }
    case 'REMOVE': {
      const existing = state.find((i) => i.producto.id === action.productoId)
      if (!existing) return state
      if (existing.cantidad === 1) {
        return state.filter((i) => i.producto.id !== action.productoId)
      }
      return state.map((i) =>
        i.producto.id === action.productoId
          ? { ...i, cantidad: i.cantidad - 1 }
          : i
      )
    }
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function useCart() {
  const [items, dispatch] = useReducer(cartReducer, [])

  const addItem = useCallback(
    (producto: Producto) => dispatch({ type: 'ADD', producto }),
    []
  )

  const removeItem = useCallback(
    (productoId: string) => dispatch({ type: 'REMOVE', productoId }),
    []
  )

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0)
  const totalPrecio = items.reduce(
    (sum, i) => sum + i.producto.precio * i.cantidad,
    0
  )

  return { items, addItem, removeItem, clearCart, totalItems, totalPrecio }
}
