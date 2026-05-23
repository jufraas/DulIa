import { jsPDF } from 'jspdf'
import { parseAnalysisResponse, resolveEmployabilityScore } from './analysisDisplay'
import { savedProfileToDisplayFields } from './formatProfileLabels'
import { formatSalary } from './formatters'
import { planToDisplayWeeks } from './planDisplay'
import { RADAR_DIMENSION_KEYS, RADAR_DIMENSION_LABELS } from './radarApi'

const MARGIN = 20
const PAGE_WIDTH = 210
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const LINE_HEIGHT = 7
const PAGE_BOTTOM = 275

const BRAND_DARK = [13, 13, 13]
const BRAND_VIOLET = [124, 58, 237]
const TEXT_PRIMARY = [250, 250, 252]
const TEXT_SECONDARY = [100, 100, 120]

/** @param {string} text @param {number} maxWidth @param {import('jspdf').jsPDF} doc */
function splitLines(text, maxWidth, doc) {
  return doc.splitTextToSize(text, maxWidth)
}

/** @param {import('jspdf').jsPDF} doc @param {number} y @param {number} needed */
function ensureSpace(doc, y, needed) {
  if (y + needed > PAGE_BOTTOM) {
    doc.addPage()
    return MARGIN
  }
  return y
}

/** @param {import('jspdf').jsPDF} doc @param {number} y @param {string} title */
function sectionTitle(doc, y, title) {
  y = ensureSpace(doc, y, 14)
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
 * @param {import('jspdf').jsPDF} doc
 * @param {number} y
 * @param {string[]} lines
 * @param {number} [indent]
 */
function writeLines(doc, y, lines, indent = 0) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)

  for (const line of lines) {
    const wrapped = splitLines(line, CONTENT_WIDTH - indent, doc)
    y = ensureSpace(doc, y, wrapped.length * LINE_HEIGHT + 2)
    doc.text(wrapped, MARGIN + indent, y)
    y += wrapped.length * LINE_HEIGHT + 3
  }
  return y
}

/**
 * @param {{
 *   profile: import('../store/useProfileStore').SavedProfile,
 *   jobs?: import('../store/useProfileStore').Job[],
 *   market?: import('../store/useProfileStore').MarketDashboard | null,
 *   analysis?: unknown,
 *   plan?: import('../store/useProfileStore').ActionPlan | null,
 *   radar?: import('./radarApi').RadarChartData | null,
 * }} data
 */
export function generateAnalysisPdf({
  profile,
  jobs = [],
  market = null,
  analysis = null,
  plan = null,
  radar = null,
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MARGIN
  const insights = parseAnalysisResponse(analysis)
  const score = resolveEmployabilityScore({ insights, jobs, radar })

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

  y = sectionTitle(doc, y, 'Score de empleabilidad')
  y = writeLines(doc, y, [
    `Tu score: ${score}/100`,
    insights?.comparativa ? insights.comparativa : null,
    insights?.descripcion ? insights.descripcion : null,
  ].filter((line) => line != null))

  if (insights && (insights.fortalezas.length || insights.recomendaciones.length)) {
    y = sectionTitle(doc, y, 'Análisis DulIA')
    /** @type {string[]} */
    const analysisLines = []
    insights.fortalezas.forEach((f) => {
      analysisLines.push(`+ ${f.label}: ${f.text}`)
    })
    insights.debilidades.forEach((d) => {
      analysisLines.push(`→ ${d.label}: ${d.text}`)
    })
    insights.recomendaciones.forEach((r) => {
      analysisLines.push(`• ${r}`)
    })
    y = writeLines(doc, y, analysisLines)
  }

  const weeks = planToDisplayWeeks(plan)
  if (weeks.length || plan?.resumen_ejecutivo) {
    y = sectionTitle(doc, y, 'Plan de 30 días')
    if (plan?.resumen_ejecutivo) {
      y = writeLines(doc, y, [plan.resumen_ejecutivo])
    }
    weeks.forEach((week) => {
      y = writeLines(doc, y, [`${week.w} — ${week.title}`], 0)
      week.tasks.forEach((task) => {
        y = writeLines(doc, y, [`  ○ ${task}`], 0)
      })
      y += 2
    })
  }

  if (radar?.usuario && radar?.mercado) {
    y = sectionTitle(doc, y, 'Match radar (tú vs mercado)')
    for (const key of RADAR_DIMENSION_KEYS) {
      const label = RADAR_DIMENSION_LABELS[key]?.name ?? key
      const you = radar.usuario[key]
      const marketVal = radar.mercado[key]
      if (you == null && marketVal == null) continue
      y = writeLines(doc, y, [
        `${label}: tú ${you ?? '—'} · mercado ${marketVal ?? '—'}`,
      ])
    }
    y += 2
  }

  if (jobs.length > 0) {
    const top = jobs.reduce((a, b) =>
      (a.score_compatibilidad ?? 0) >= (b.score_compatibilidad ?? 0) ? a : b,
    )
    y = sectionTitle(doc, y, 'Mejor match')
    y = writeLines(doc, y, [
      `${top.titulo} — ${top.empresa} (${top.score_compatibilidad}% match)`,
    ])
  }

  y = sectionTitle(doc, y, 'Vacantes recomendadas')
  jobs.forEach((job) => {
    const urlPart = job.url && job.semaforo !== 'red' ? ` · ${job.url}` : ''
    const line = `• ${job.titulo} (${job.empresa}) — ${job.score_compatibilidad}% — ${formatSalary(job.salario_min, job.salario_max)}${urlPart}`
    y = writeLines(doc, y, [line], 2)
  })
  y += 4

  if (market) {
    y = sectionTitle(doc, y, 'Termómetro del mercado')
    /** @type {string[]} */
    const marketLines = [
      `Vacantes activas: ${market.total_vacantes_activas ?? '—'}`,
      market.salario_promedio
        ? `Salario promedio: ${formatSalary(market.salario_promedio, undefined)}`
        : null,
      market.crecimiento_semanal_pct != null
        ? `Crecimiento semanal: ${market.crecimiento_semanal_pct}%`
        : null,
    ].filter((line) => line != null)
    y = writeLines(doc, y, marketLines)
    y += 4
  }

  y = sectionTitle(doc, y + 4, 'Tu perfil')
  savedProfileToDisplayFields(profile).forEach(({ label, value }) => {
    y = writeLines(doc, y, [`${label}: ${value}`])
  })

  const safeName = (profile.nombre || 'usuario')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
  doc.save(`dulia-plan-${safeName}.pdf`)
}
