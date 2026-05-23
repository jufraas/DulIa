import { jsPDF } from 'jspdf'
import { profileToDisplayFields } from './formatProfileLabels'

const MARGIN = 20
const PAGE_WIDTH = 210
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const LINE_HEIGHT = 7

const BRAND_DARK = [13, 13, 13]
const BRAND_VIOLET = [124, 58, 237]
const BRAND_MAGENTA = [236, 72, 153]
const TEXT_PRIMARY = [250, 250, 252]
const TEXT_SECONDARY = [100, 100, 120]

/**
 * @param {string} text
 * @param {number} maxWidth
 * @param {import('jspdf').jsPDF} doc
 */
function splitLines(text, maxWidth, doc) {
  return doc.splitTextToSize(text, maxWidth)
}

/**
 * @param {import('jspdf').jsPDF} doc
 * @param {number} y
 * @param {string} title
 * @returns {number}
 */
function sectionTitle(doc, y, title) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...BRAND_DARK)
  doc.text(title, MARGIN, y)
  doc.setDrawColor(...BRAND_VIOLET)
  doc.setLineWidth(0.4)
  doc.line(MARGIN, y + 2, PAGE_WIDTH - MARGIN, y + 2)
  return y + 10
}

/**
 * @param {{
 *   profile?: import('../store/useProfileStore').ProfileForm | null,
 *   result: import('../store/useProfileStore').AnalysisResult,
 *   cvFileName?: string | null,
 * }} data
 */
export function generateAnalysisPdf({ profile, result, cvFileName = null }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MARGIN

  doc.setFillColor(...BRAND_DARK)
  doc.rect(0, 0, PAGE_WIDTH, 36, 'F')

  doc.setTextColor(...TEXT_PRIMARY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('DulIA', MARGIN, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...TEXT_SECONDARY)
  doc.text('Coach de carrera con IA · Barranqui-IA 2026 · Colombia', MARGIN, 24)

  y = 48
  doc.setTextColor(51, 65, 85)
  doc.setFontSize(10)
  const dateStr = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  doc.text(`Generado el ${dateStr}`, MARGIN, y)
  y += 10

  if (profile?.name) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...BRAND_DARK)
    doc.text(`Plan de acción — ${profile.name}`, MARGIN, y)
    y += 8
    if (profile.city) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...TEXT_SECONDARY)
      doc.text(profile.city, MARGIN, y)
      y += 8
    }
  }

  if (cvFileName || result.cv_parsed) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...BRAND_MAGENTA)
    doc.text(
      result.cv_parsed
        ? `CV analizado: ${cvFileName || 'archivo adjunto'}`
        : `CV adjunto: ${cvFileName}`,
      MARGIN,
      y,
    )
    y += 8
  }

  y = sectionTitle(doc, y, 'Perfil sugerido por IA')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(30, 41, 59)
  const profileLines = splitLines(result.profile, CONTENT_WIDTH - 40, doc)
  doc.text(profileLines, MARGIN, y)
  y += profileLines.length * LINE_HEIGHT + 2

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND_MAGENTA)
  doc.text(
    `Score: ${result.score}/100`,
    PAGE_WIDTH - MARGIN - 35,
    y - profileLines.length * LINE_HEIGHT,
  )
  y += 6

  y = sectionTitle(doc, y, 'Oportunidades laborales reales')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  result.opportunities.forEach((item) => {
    const lines = splitLines(`• ${item}`, CONTENT_WIDTH - 4, doc)
    if (y + lines.length * LINE_HEIGHT > 270) {
      doc.addPage()
      y = MARGIN
    }
    doc.text(lines, MARGIN + 2, y)
    y += lines.length * LINE_HEIGHT + 3
  })
  y += 4

  y = sectionTitle(doc, y, 'Tu plan de 30 días')
  result.roadmap.forEach((step, i) => {
    const lines = splitLines(`${i + 1}. ${step}`, CONTENT_WIDTH - 8, doc)
    if (y + lines.length * LINE_HEIGHT > 270) {
      doc.addPage()
      y = MARGIN
    }
    doc.text(lines, MARGIN + 4, y)
    y += lines.length * LINE_HEIGHT + 4
  })

  if (profile) {
    if (y > 220) {
      doc.addPage()
      y = MARGIN
    }
    y = sectionTitle(doc, y + 4, 'Tu perfil (datos enviados)')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)

    profileToDisplayFields(profile).forEach(({ label, value }) => {
      const lines = splitLines(`${label}: ${value}`, CONTENT_WIDTH, doc)
      if (y + lines.length * LINE_HEIGHT > 280) {
        doc.addPage()
        y = MARGIN
      }
      doc.text(lines, MARGIN, y)
      y += lines.length * LINE_HEIGHT + 3
    })
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...TEXT_SECONDARY)
    doc.text(
      'DulIA — coach de carrera con IA para jóvenes colombianos · Sin sesión · Pág. ' +
        `${i}/${pageCount}`,
      MARGIN,
      290,
    )
  }

  const safeName = (profile?.name || 'usuario')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
  doc.save(`dulia-plan-${safeName}.pdf`)
}
