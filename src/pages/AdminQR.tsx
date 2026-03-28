import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Mesa } from '../types'
import { renderQRCard, generateQRPdf } from '../utils/qr'

function getBaseUrl(): string {
  return window.location.origin
}

export function AdminQR() {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [loading, setLoading] = useState(true)
  const [qrImages, setQrImages] = useState<Record<number, string>>({})
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [dominio, setDominio] = useState(getBaseUrl)

  const fetchMesas = useCallback(async () => {
    const { data } = await supabase
      .from('mesas')
      .select('*')
      .eq('activa', true)
      .order('numero', { ascending: true })
    if (data) setMesas(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMesas()
  }, [fetchMesas])

  // Generate QR images for all mesas
  useEffect(() => {
    async function genAll() {
      const result: Record<number, string> = {}
      for (const mesa of mesas) {
        result[mesa.numero] = await renderQRCard(mesa.numero, dominio, 400)
      }
      setQrImages(result)
    }
    if (mesas.length > 0) genAll()
  }, [mesas, dominio])

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true)
    try {
      await generateQRPdf(
        mesas.map((m) => ({ numero: m.numero })),
        dominio
      )
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handleDownloadSingle = (mesaNumero: number) => {
    const img = qrImages[mesaNumero]
    if (!img) return
    const link = document.createElement('a')
    link.download = `pediya-mesa-${mesaNumero}.png`
    link.href = img
    link.click()
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
        <div className="px-4 py-2.5 flex items-center gap-3">
          <span className="text-amber-500 font-bold text-xl tracking-tight">
            pediya
          </span>
          <span className="text-neutral-600 text-lg font-light">|</span>
          <img src="/garage-logo.svg" alt="Garage Craft Haus" className="h-5 opacity-70" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-5">
        {/* Desktop title */}
        <h1 className="hidden lg:block text-white font-bold text-2xl mb-6">
          Códigos QR
        </h1>

        {/* Controls */}
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label className="text-neutral-400 text-xs font-medium block mb-1.5">
                Dominio base
              </label>
              <input
                type="text"
                value={dominio}
                onChange={(e) => setDominio(e.target.value.replace(/\/+$/, ''))}
                placeholder="https://tudominio.com"
                className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
              <p className="text-neutral-500 text-xs mt-1">
                Los QR apuntarán a: {dominio}/mesa/N
              </p>
            </div>
            <button
              onClick={handleDownloadPdf}
              disabled={mesas.length === 0 || generatingPdf}
              className="bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-40 text-black font-semibold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              {generatingPdf ? 'Generando PDF...' : 'Descargar todos como PDF'}
            </button>
          </div>
        </div>

        {/* QR Grid */}
        {mesas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">🪑</p>
            <p className="text-neutral-400 text-lg">
              No hay mesas activas
            </p>
            <p className="text-neutral-500 text-sm mt-1">
              Activá mesas desde la sección Mesas para generar sus QR.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mesas.map((mesa) => (
              <div
                key={mesa.id}
                className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl p-5 flex flex-col items-center transition-all hover:border-neutral-600"
              >
                {/* QR Preview */}
                <div className="bg-white rounded-xl p-1 mb-4 shadow-lg shadow-black/20">
                  {qrImages[mesa.numero] ? (
                    <img
                      src={qrImages[mesa.numero]}
                      alt={`QR Mesa ${mesa.numero}`}
                      className="w-56 h-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <p className="text-white font-bold text-lg mb-0.5">
                  Mesa {mesa.numero}
                </p>
                <p className="text-neutral-500 text-xs font-mono mb-4 break-all text-center">
                  {dominio}/mesa/{mesa.numero}
                </p>

                {/* Download single */}
                <button
                  onClick={() => handleDownloadSingle(mesa.numero)}
                  disabled={!qrImages[mesa.numero]}
                  className="w-full py-2 rounded-xl text-sm font-medium text-neutral-300 bg-neutral-700/50 hover:bg-neutral-700 hover:text-white disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  Descargar PNG
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
