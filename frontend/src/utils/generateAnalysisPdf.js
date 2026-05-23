import { jsPDF } from 'jspdf'
import { savedProfileToDisplayFields } from './formatProfileLabels'
import { formatSalary } from './formatters'

const MARGIN = 20
const PAGE_WIDTH = 210
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const LINE_HEIGHT = 7

const BRAND_DARK = [13, 13, 13]
const BRAND_VIOLET = [124, 58, 237]
const TEXT_PRIMARY = [250, 250, 252]
const TEXT_SECONDARY = [100, 100, 120]

/** @param {string} text @param {number} maxWidth @param {import('jspdf').jsPDF} doc */
function splitLines(text, maxWidth, doc) {
  return doc.splitTextToSize(text, maxWidth)
}

/** @param {import('jspdf').jsPDF} doc @param {number} y @param {string} title */
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
 *   profile: import('../store/useProfileStore').SavedProfile,
 *   jobs?: import('../store/useProfileStore').Job[],
 *   market?: import('../store/useProfileStore').MarketDashboard | null,
 * }} data
 */
export function generateAnalysisPdf({ profile, jobs = [], market = null }) {
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
  doc.text('Coach de carrera con IA · Barranqui-IA 2026', MARGIN, 24)

  y = 48
  doc.setTextColor(51, 65, 85)
  doc.setFontSize(10)
  doc.text(
    `Generado el ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    MARGIN,
    y,
  )
  y += 10

  if (profile.nombre) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...BRAND_DARK)
    doc.text(`Plan de acción — ${profile.nombre}`, MARGIN, y)
    y += 8
    if (profile.ciudad) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...TEXT_SECONDARY)
      doc.text(profile.ciudad, MARGIN, y)
      y += 8
    }
  }

  if (jobs.length > 0) {
    const top = jobs.reduce((a, b) =>
      (a.score_compatibilidad ?? 0) >= (b.score_compatibilidad ?? 0) ? a : b,
    )
    y = sectionTitle(doc, y, 'Mejor match')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(`${top.titulo} — ${top.empresa} (${top.score_compatibilidad}% match)`, MARGIN, y)
    y += 10
  }

  y = sectionTitle(doc, y, 'Vacantes recomendadas')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  jobs.forEach((job) => {
    const line = `• ${job.titulo} (${job.empresa}) — ${job.score_compatibilidad}% — ${formatSalary(job.salario_min, job.salario_max)}`
    const lines = splitLines(line, CONTENT_WIDTH - 4, doc)
    if (y + lines.length * LINE_HEIGHT > 270) {
      doc.addPage()
      y = MARGIN
    }
    doc.text(lines, MARGIN + 2, y)
    y += lines.length * LINE_HEIGHT + 3
  })
  y += 4

  if (market) {
    y = sectionTitle(doc, y, 'Termómetro del mercado')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const marketLines = [
      `Vacantes activas: ${market.total_vacantes_activas ?? '—'}`,
      market.salario_promedio
        ? `Salario promedio: ${formatSalary(market.salario_promedio, undefined)}`
        : null,
    ].filter(Boolean)
    marketLines.forEach((line) => {
      doc.text(String(line), MARGIN, y)
      y += LINE_HEIGHT + 2
    })
    y += 4
  }

  y = sectionTitle(doc, y + 4, 'Tu perfil')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  savedProfileToDisplayFields(profile).forEach(({ label, value }) => {
    const lines = splitLines(`${label}: ${value}`, CONTENT_WIDTH, doc)
    if (y + lines.length * LINE_HEIGHT > 280) {
      doc.addPage()
      y = MARGIN
    }
    doc.text(lines, MARGIN, y)
    y += lines.length * LINE_HEIGHT + 3
  })

  const safeName = (profile.nombre || 'usuario')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
  doc.save(`dulia-plan-${safeName}.pdf`)
}
