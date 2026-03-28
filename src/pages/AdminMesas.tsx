import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Mesa } from '../types'

export function AdminMesas() {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [loading, setLoading] = useState(true)

  // Form
  const [showForm, setShowForm] = useState(false)
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null)
  const [mesaNumero, setMesaNumero] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchMesas = useCallback(async () => {
    const { data } = await supabase
      .from('mesas')
      .select('*')
      .order('numero', { ascending: true })
    if (data) setMesas(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMesas()
  }, [fetchMesas])

  const openForm = (mesa?: Mesa) => {
    setError(null)
    if (mesa) {
      setEditingMesa(mesa)
      setMesaNumero(String(mesa.numero))
    } else {
      setEditingMesa(null)
      const nextNum =
        mesas.length > 0 ? Math.max(...mesas.map((m) => m.numero)) + 1 : 1
      setMesaNumero(String(nextNum))
    }
    setShowForm(true)
  }

  const saveMesa = async () => {
    const num = parseInt(mesaNumero)
    if (isNaN(num) || num < 1) {
      setError('Ingresá un número válido')
      return
    }

    // Check duplicate
    const duplicate = mesas.find(
      (m) => m.numero === num && m.id !== editingMesa?.id
    )
    if (duplicate) {
      setError(`Ya existe la mesa ${num}`)
      return
    }

    setSaving(true)

    if (editingMesa) {
      await supabase
        .from('mesas')
        .update({ numero: num })
        .eq('id', editingMesa.id)
    } else {
      await supabase.from('mesas').insert({ numero: num, activa: true })
    }

    setShowForm(false)
    setEditingMesa(null)
    setSaving(false)
    setError(null)
    fetchMesas()
  }

  const toggleActiva = async (mesa: Mesa) => {
    await supabase
      .from('mesas')
      .update({ activa: !mesa.activa })
      .eq('id', mesa.id)
    fetchMesas()
  }

  const deleteMesa = async (id: string) => {
    await supabase.from('mesas').delete().eq('id', id)
    setDeletingId(null)
    fetchMesas()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800">
        <div className="px-4 py-3">
          <span className="text-amber-500 font-bold text-xl tracking-tight">
            pediya
            <span className="text-neutral-500 font-normal text-sm ml-2">
              mesas
            </span>
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-5">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-bold text-2xl hidden lg:block">
            Gestión de Mesas
          </h1>
          <div className="flex items-center gap-3 lg:ml-auto">
            <span className="text-neutral-400 text-sm">
              {mesas.filter((m) => m.activa).length} activa
              {mesas.filter((m) => m.activa).length !== 1 ? 's' : ''} de{' '}
              {mesas.length}
            </span>
            <button
              onClick={() => openForm()}
              className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-semibold text-sm px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              + Nueva mesa
            </button>
          </div>
        </div>

        {/* Mesa grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {mesas.map((mesa) => (
            <div
              key={mesa.id}
              className={`relative bg-neutral-800/50 border rounded-2xl p-5 transition-all ${
                mesa.activa
                  ? 'border-neutral-700/50'
                  : 'border-neutral-700/30 opacity-50'
              }`}
            >
              {/* Número grande */}
              <div className="text-center mb-4">
                <span
                  className={`text-4xl font-black ${
                    mesa.activa ? 'text-amber-400' : 'text-neutral-600'
                  }`}
                >
                  {mesa.numero}
                </span>
                <p className="text-neutral-500 text-xs mt-1">
                  Mesa {mesa.numero}
                </p>
              </div>

              {/* Status badge */}
              <div className="text-center mb-3">
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                    mesa.activa
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-neutral-700/50 text-neutral-500'
                  }`}
                >
                  {mesa.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => openForm(mesa)}
                  className="w-full py-1.5 rounded-lg text-xs font-medium text-neutral-400 bg-neutral-700/50 hover:bg-neutral-700 hover:text-white transition-all cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActiva(mesa)}
                  className={`w-full py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    mesa.activa
                      ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                      : 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
                  }`}
                >
                  {mesa.activa ? 'Desactivar' : 'Activar'}
                </button>
                {deletingId === mesa.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => deleteMesa(mesa.id)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                    >
                      Sí, eliminar
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-neutral-700 hover:bg-neutral-600 text-neutral-300 cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(mesa.id)}
                    className="w-full py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-red-400 bg-neutral-700/30 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}

          {mesas.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-5xl mb-3">🪑</p>
              <p className="text-neutral-400">
                No hay mesas. Creá la primera.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL: Mesa Form ─── */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowForm(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-sm mx-auto animate-slide-up">
            <h3 className="text-white font-bold text-lg mb-4">
              {editingMesa ? 'Editar mesa' : 'Nueva mesa'}
            </h3>
            <input
              type="number"
              value={mesaNumero}
              onChange={(e) => {
                setMesaNumero(e.target.value)
                setError(null)
              }}
              placeholder="Número de mesa"
              min="1"
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && saveMesa()}
            />
            {error && (
              <p className="text-red-400 text-xs mt-2">{error}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-neutral-400 bg-neutral-800 hover:bg-neutral-700 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={saveMesa}
                disabled={!mesaNumero || saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
