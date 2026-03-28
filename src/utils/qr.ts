import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

/**
 * Generate a QR data URL for a given mesa URL.
 */
export async function generateQRDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 512,
    margin: 0,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  })
}

/**
 * Draw a single QR card onto a canvas and return as data URL.
 * White card with border, QR in center, "Mesa N" label, and "pediya" branding.
 */
export async function renderQRCard(
  mesaNumero: number,
  baseUrl: string,
  size: number = 600
): Promise<string> {
  const url = `${baseUrl}/mesa/${mesaNumero}`
  const qrDataUrl = await generateQRDataUrl(url)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size + 120
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Border
  ctx.strokeStyle = '#222222'
  ctx.lineWidth = 4
  const r = 16
  roundRect(ctx, 2, 2, canvas.width - 4, canvas.height - 4, r)
  ctx.stroke()

  // Inner decorative border
  ctx.strokeStyle = '#e5e5e5'
  ctx.lineWidth = 1.5
  roundRect(ctx, 16, 16, canvas.width - 32, canvas.height - 32, r - 4)
  ctx.stroke()

  // QR code
  const qrImg = await loadImage(qrDataUrl)
  const qrPad = 60
  const qrSize = size - qrPad * 2
  ctx.drawImage(qrImg, qrPad, 40, qrSize, qrSize)

  // "pediya" branding top
  ctx.fillStyle = '#999999'
  ctx.font = '600 14px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('pediya', size / 2, 28)

  // "Mesa N" label
  ctx.fillStyle = '#111111'
  ctx.font = '700 36px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`Mesa ${mesaNumero}`, size / 2, size + 50)

  // Small URL below
  ctx.fillStyle = '#888888'
  ctx.font = '400 13px system-ui, sans-serif'
  ctx.fillText(url, size / 2, size + 80)

  return canvas.toDataURL('image/png')
}

/**
 * Generate a PDF with all QR codes in a 2x4 grid on A4 pages.
 */
export async function generateQRPdf(
  mesas: { numero: number }[],
  baseUrl: string
): Promise<void> {
  const pdf = new jsPDF('portrait', 'mm', 'a4')
  const pageW = 210
  const pageH = 297
  const cols = 2
  const rows = 4
  const perPage = cols * rows

  const marginX = 15
  const marginY = 12
  const gapX = 8
  const gapY = 6
  const cardW = (pageW - marginX * 2 - gapX * (cols - 1)) / cols
  const cardH = (pageH - marginY * 2 - gapY * (rows - 1)) / rows

  const sorted = [...mesas].sort((a, b) => a.numero - b.numero)

  for (let i = 0; i < sorted.length; i++) {
    const pageIdx = Math.floor(i / perPage)
    const posInPage = i % perPage

    if (posInPage === 0 && pageIdx > 0) {
      pdf.addPage()
    }

    const col = posInPage % cols
    const row = Math.floor(posInPage / cols)

    const x = marginX + col * (cardW + gapX)
    const y = marginY + row * (cardH + gapY)

    const imgDataUrl = await renderQRCard(sorted[i].numero, baseUrl, 512)
    pdf.addImage(imgDataUrl, 'PNG', x, y, cardW, cardH)
  }

  pdf.save('pediya-qr-mesas.pdf')
}

// ─── Helpers ──────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
