import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import AnalysisPdfDocument from '../components/pdf/AnalysisPdfDocument'

const PAGE_BG_RGB = [13, 13, 13]
const CAPTURE_SCALE = 2
const BLOCK_GAP_MM = 3
const PAGE_MARGIN_MM = 10

/** @param {import('jspdf').jsPDF} pdf */
function fillPageBackground(pdf) {
  const w = pdf.internal.pageSize.getWidth()
  const h = pdf.internal.pageSize.getHeight()
  pdf.setFillColor(...PAGE_BG_RGB)
  pdf.rect(0, 0, w, h, 'F')
}

/**
 * @param {HTMLCanvasElement} source
 * @param {number} srcY
 * @param {number} sliceHeightPx
 */
function sliceCanvas(source, srcY, sliceHeightPx) {
  const slice = document.createElement('canvas')
  slice.width = source.width
  slice.height = sliceHeightPx
  const ctx = slice.getContext('2d')
  if (!ctx) throw new Error('No se pudo preparar el lienzo del PDF.')
  ctx.drawImage(source, 0, srcY, source.width, sliceHeightPx, 0, 0, source.width, sliceHeightPx)
  return slice
}

/**
 * @param {import('jspdf').jsPDF} pdf
 * @param {{ yMm: number, pageOpen: boolean }} layout
 */
function openFreshPage(pdf, layout) {
  if (layout.pageOpen) pdf.addPage()
  fillPageBackground(pdf)
  layout.yMm = PAGE_MARGIN_MM
  layout.pageOpen = true
}

/**
 * @param {import('jspdf').jsPDF} pdf
 * @param {HTMLCanvasElement} canvas
 * @param {{ yMm: number, pageOpen: boolean }} layout
 */
function placeBlockCanvas(pdf, canvas, layout) {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const contentBottom = pageHeight - PAGE_MARGIN_MM
  const imgWidthMm = pageWidth
  const pxToMm = imgWidthMm / canvas.width
  const totalHeightMm = canvas.height * pxToMm

  if (!layout.pageOpen) openFreshPage(pdf, layout)

  if (layout.yMm + totalHeightMm > contentBottom && layout.yMm > PAGE_MARGIN_MM) {
    openFreshPage(pdf, layout)
  }

  let srcY = 0
  let remainingPx = canvas.height

  while (remainingPx > 0) {
    const availableMm = contentBottom - layout.yMm
    const availablePx = Math.floor(availableMm / pxToMm)

    if (availablePx < 8) {
      openFreshPage(pdf, layout)
      continue
    }

    const slicePx = Math.min(remainingPx, availablePx)
    const slice = sliceCanvas(canvas, srcY, slicePx)
    const sliceHeightMm = slicePx * pxToMm
    const imgData = slice.toDataURL('image/png')

    pdf.addImage(imgData, 'PNG', 0, layout.yMm, imgWidthMm, sliceHeightMm)

    srcY += slicePx
    remainingPx -= slicePx
    layout.yMm += sliceHeightMm

    if (remainingPx > 0) {
      openFreshPage(pdf, layout)
    }
  }

  layout.yMm += BLOCK_GAP_MM
}

/**
 * @param {import('jspdf').jsPDF} pdf
 * @param {HTMLElement[]} blocks
 * @param {string} filename
 */
async function buildPdfFromBlocks(pdf, blocks, filename) {
  const layout = { yMm: PAGE_MARGIN_MM, pageOpen: false }

  for (const block of blocks) {
    const canvas = await html2canvas(block, {
      scale: CAPTURE_SCALE,
      backgroundColor: '#0D0D0D',
      useCORS: true,
      logging: false,
      width: block.offsetWidth,
      height: block.offsetHeight,
    })

    if (canvas.width === 0 || canvas.height === 0) continue

    placeBlockCanvas(pdf, canvas, layout)
  }

  pdf.save(filename)
}

/**
 * Monta el documento React off-screen, captura por secciones y guarda PDF multipágina.
 * @param {{
 *   profile: import('../store/useProfileStore').SavedProfile,
 *   jobs?: import('../store/useProfileStore').Job[],
 *   market?: import('../store/useProfileStore').MarketDashboard | null,
 *   analysis?: unknown,
 *   plan?: import('../store/useProfileStore').ActionPlan | null,
 *   radar?: import('./radarApi').RadarChartData | null,
 * }} data
 */
export async function generateAnalysisPdf(data) {
  const container = document.createElement('div')
  container.setAttribute('aria-hidden', 'true')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.zIndex = '-1'
  container.style.pointerEvents = 'none'
  document.body.appendChild(container)

  const root = createRoot(container)

  try {
    flushSync(() => {
      root.render(<AnalysisPdfDocument {...data} />)
    })

    await document.fonts.ready
    await new Promise((resolve) => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(resolve))
    })

    const target = container.firstElementChild
    if (!target || !(target instanceof HTMLElement)) {
      throw new Error('No se pudo renderizar el documento PDF.')
    }

    const blocks = [...target.querySelectorAll('[data-pdf-block]')].filter(
      (el) => el instanceof HTMLElement,
    )

    if (blocks.length === 0) {
      throw new Error('El documento PDF no tiene secciones para exportar.')
    }

    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })

    const safeName = (data.profile.nombre || 'usuario')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .toLowerCase()

    await buildPdfFromBlocks(pdf, blocks, `dulia-plan-${safeName}.pdf`)
  } finally {
    root.unmount()
    container.remove()
  }
}
