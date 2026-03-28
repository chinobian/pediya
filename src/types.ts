export interface Mesa {
  id: string
  numero: number
  activa: boolean
}

export interface Categoria {
  id: string
  nombre: string
  orden: number
  activa: boolean
}

export interface Producto {
  id: string
  nombre: string
  precio: number
  categoria_id: string
  disponible: boolean
}

export interface CartItem {
  producto: Producto
  cantidad: number
}

export interface Pedido {
  id: string
  mesa_id: string
  estado: string
  total: number
  created_at: string
}

export interface PedidoConDetalle extends Pedido {
  mesa?: Mesa
  items: PedidoItemConProducto[]
}

export interface PedidoItem {
  id: string
  pedido_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
}

export interface PedidoItemConProducto extends PedidoItem {
  producto?: Producto
}

export interface AccionMesa {
  id: string
  mesa_id: string
  tipo: 'llamar_mozo' | 'pedir_cuenta'
  atendida: boolean
  created_at: string
  mesa?: Mesa
}
