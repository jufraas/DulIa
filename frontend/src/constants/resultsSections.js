/** @typedef {{ id: string, label: string }} ResultsSectionDef */

/** @type {ResultsSectionDef[]} */
export const RESULTS_SECTIONS = [
  { id: 'resultados-analisis', label: 'Tu análisis' },
  { id: 'resultados-mercado', label: 'Mercado' },
  { id: 'resultados-oportunidades-plan', label: 'Oportunidades' },
  { id: 'resultados-radar', label: 'Radar match' },
  { id: 'resultados-timeline', label: 'Timeline' },
  { id: 'resultados-pdf', label: 'Descargar PDF' },
]

export const RESULTS_SECTION_IDS = RESULTS_SECTIONS.map((s) => s.id)
