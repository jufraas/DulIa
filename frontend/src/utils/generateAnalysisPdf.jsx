import { flushSync } from 'react'
import { createRoot } from 'react-dom/client'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import AnalysisPdfDocument from '../components/pdf/AnalysisPdfDocument'

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} filename
 */
function saveCanvasAsPdf(canvas, filename) {
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  const imgData = canvas.toDataURL('image/jpeg', 0.92)

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position -= pageHeight
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}

/**
 * Monta el documento React off-screen, captura con html2canvas y guarda PDF.
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

    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: '#0D0D0D',
      useCORS: true,
      logging: false,
    })

    const safeName = (data.profile.nombre || 'usuario')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .toLowerCase()

    saveCanvasAsPdf(canvas, `dulia-plan-${safeName}.pdf`)
  } finally {
    root.unmount()
    container.remove()
  }
}
