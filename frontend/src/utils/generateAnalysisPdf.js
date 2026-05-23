import { jsPDF } from 'jspdf'

const MARGIN = 20
const PAGE_WIDTH = 210
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const LINE_HEIGHT = 7

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
  doc.setTextColor(15, 23, 42)
  doc.text(title, MARGIN, y)
  doc.setDrawColor(6, 182, 212)
  doc.setLineWidth(0.4)
  doc.line(MARGIN, y + 2, PAGE_WIDTH - MARGIN, y + 2)
  return y + 10
}

/**
 * @param {{
 *   profile?: { name?: string, city?: string, education?: string, skills?: string, interests?: string } | null,
 *   result: { profile: string, score: number, opportunities: string[], roadmap: string[] },
 * }} data
 */
export function generateAnalysisPdf({ profile, result }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MARGIN

  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, PAGE_WIDTH, 36, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('DulIA', MARGIN, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(148, 163, 184)
  doc.text('Coach de carrera con IA · Barranqui-IA 2026', MARGIN, 24)

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
    doc.setTextColor(15, 23, 42)
    doc.text(`Plan de acción — ${profile.name}`, MARGIN, y)
    y += 8
    if (profile.city) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(profile.city, MARGIN, y)
      y += 8
    }
  }

  y = sectionTitle(doc, y, 'Perfil sugerido')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(30, 41, 59)
  const profileLines = splitLines(result.profile, CONTENT_WIDTH - 40, doc)
  doc.text(profileLines, MARGIN, y)
  y += profileLines.length * LINE_HEIGHT + 2

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(6, 182, 212)
  doc.text(`Encaje: ${result.score}%`, PAGE_WIDTH - MARGIN - 35, y - profileLines.length * LINE_HEIGHT)
  y += 6

  y = sectionTitle(doc, y, 'Oportunidades para ti')
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

  y = sectionTitle(doc, y, 'Tu roadmap')
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
    if (y > 230) {
      doc.addPage()
      y = MARGIN
    }
    y = sectionTitle(doc, y + 4, 'Tu perfil (resumen)')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    /** @type {[string, string | boolean | undefined][]} */
    const fields = [
      ['Situación', profile.current_situation],
      ['Estudios', profile.education],
      ['Nivel', profile.education_level],
      ['Experiencia', profile.has_experience ? profile.experience_summary || 'Sí' : 'Primera experiencia'],
      ['Habilidades', profile.skills],
      ['Habilidades blandas', profile.soft_skills],
      ['Intereses', profile.interests],
      ['Modalidad', profile.work_mode],
      ['Busca', profile.opportunity_type],
      ['Disponibilidad', profile.availability],
      ['Herramientas', profile.tools],
    ]
    fields.forEach(([label, value]) => {
      if (!value) return
      const text = typeof value === 'boolean' ? String(value) : value
      const lines = splitLines(`${label}: ${text}`, CONTENT_WIDTH, doc)
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
    doc.setTextColor(148, 163, 184)
    doc.text(
      `DulIA — oportunidades laborales reales para jóvenes colombianos · Pág. ${i}/${pageCount}`,
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
