/**
 * @param {{
 *   profile?: import('../store/useProfileStore').SavedProfile | null,
 *   topScore?: number,
 *   topJob?: import('../store/useProfileStore').Job | null,
 *   insights?: import('../utils/analysisDisplay').AnalysisInsights | null,
 * }} ctx
 */
export function buildCoachStarterSuggestions({ topScore, topJob }) {
  /** @type {string[]} */
  const items = []

  if (topScore != null && topScore > 0) {
    items.push(`¿Cómo subo mi score de ${topScore}?`)
  }
  if (topJob?.titulo) {
    const short = topJob.titulo.length > 42 ? `${topJob.titulo.slice(0, 39)}…` : topJob.titulo
    items.push(`¿Cómo aplico a ${short}?`)
  } else {
    items.push('¿Qué vacantes me convienen más?')
  }
  items.push('¿Qué hago esta semana del plan?')

  return items.slice(0, 3)
}

/**
 * @param {{
 *   profile?: import('../store/useProfileStore').SavedProfile | null,
 *   topScore?: number,
 *   topJob?: import('../store/useProfileStore').Job | null,
 *   insights?: import('../utils/analysisDisplay').AnalysisInsights | null,
 * }} ctx
 */
export function buildCoachWelcomeMessage({ profile, topScore, topJob, insights }) {
  const name = profile?.nombre?.split(' ')[0] ?? 'parcero'
  const scorePart =
    topScore != null && topScore > 0 ? ` Vi un score de ${topScore} sobre 100.` : ''
  const jobPart = topJob?.titulo ? ` Tu mejor match por ahora es ${topJob.titulo}.` : ''
  const tip =
    insights?.recomendaciones?.[0] ??
    'Pregúntame lo que no entiendas del análisis, el plan o las vacantes.'

  return `Hola ${name}, ya revisé tu perfil.${scorePart}${jobPart} ${tip}`
}
