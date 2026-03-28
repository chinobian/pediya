import { useState } from 'react'
import { useAdminData } from '../hooks/useAdminData'
import { PedidoCard } from '../components/PedidoCard'
import { AccionAlert } from '../components/AccionAlert'

type Tab = 'pendientes' | 'listos'

export function AdminView() {
  const {
    pendientes,
    listos,
    acciones,
    loading,
    newPedidoIds,
    marcarListo,
    atenderAccion,
  } = useAdminData()

  const [activeTab, setActiveTab] = useState<Tab>('pendientes')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const pendientesContent = (
    <div className="flex flex-col gap-4">
      {pendientes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🍽️</p>
          <p className="text-neutral-400 text-lg">No hay pedidos pendientes</p>
        </div>
      ) : (
        pendientes.map((p) => (
          <PedidoCard
            key={p.id}
            pedido={p}
            isNew={newPedidoIds.has(p.id)}
            onMarcarListo={marcarListo}
          />
        ))
      )}
    </div>
  )

  const listosContent = (
    <div className="flex flex-col gap-4">
      {listos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">✅</p>
          <p className="text-neutral-400 text-lg">No hay pedidos listos</p>
        </div>
      ) : (
        listos.map((p) => <PedidoCard key={p.id} pedido={p} />)
      )}
    </div>
  )

  return (
    <div>
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-amber-500 font-bold text-xl tracking-tight">
            pediya
            <span className="text-neutral-500 font-normal text-sm ml-2">
              admin
            </span>
          </span>
          <div className="flex items-center gap-3">
            {acciones.length > 0 && (
              <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full">
                {acciones.length}
              </span>
            )}
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">
              {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-5">
        {/* Desktop page title */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <h1 className="text-white font-bold text-2xl">Pedidos</h1>
          <div className="flex items-center gap-3">
            {acciones.length > 0 && (
              <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full">
                {acciones.length} alerta{acciones.length !== 1 ? 's' : ''}
              </span>
            )}
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">
              {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Acciones de mesa */}
        {acciones.length > 0 && (
          <section className="mb-6">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Alertas de mesas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {acciones.map((a) => (
                <AccionAlert
                  key={a.id}
                  accion={a}
                  onAtender={atenderAccion}
                />
              ))}
            </div>
          </section>
        )}

        {/* Mobile tabs */}
        <div className="lg:hidden mb-5">
          <div className="flex bg-neutral-800/50 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveTab('pendientes')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'pendientes'
                  ? 'bg-amber-500 text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Pendientes
              {pendientes.length > 0 && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                    activeTab === 'pendientes'
                      ? 'bg-black/20 text-black'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {pendientes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('listos')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'listos'
                  ? 'bg-green-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Listos
              {listos.length > 0 && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                    activeTab === 'listos'
                      ? 'bg-white/20 text-white'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {listos.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile content */}
        <div className="lg:hidden">
          {activeTab === 'pendientes' ? pendientesContent : listosContent}
        </div>

        {/* Desktop two-column layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
          <div>
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              Pedidos pendientes
              {pendientes.length > 0 && (
                <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">
                  {pendientes.length}
                </span>
              )}
            </h2>
            {pendientesContent}
          </div>
          <div>
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              Pedidos listos
              {listos.length > 0 && (
                <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full">
                  {listos.length}
                </span>
              )}
            </h2>
            {listosContent}
          </div>
        </div>
      </div>
    </div>
  )
}
