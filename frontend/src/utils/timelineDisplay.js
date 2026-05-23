/**
 * @typedef {Object} TimelinePhaseDisplay
 * @property {number} dia
 * @property {string} tipo
 * @property {string} titulo
 * @property {string} descripcion
 * @property {number|null} score
 * @property {number|null} vacantesMatch
 * @property {number|null} habilidades
 * @property {string[]} accionesCompletadas
 */

/**
 * @typedef {Object} TimelineDisplay
 * @property {string|null} inicio
 * @property {TimelinePhaseDisplay[]} fases
 * @property {string|null} proyeccion
 * @property {number|null} tasaCrecimiento
 */

/**
 * @param {unknown} timeline
 * @returns {TimelineDisplay | null}
 */
export function parseTimelineResponse(timeline) {
  if (!timeline || typeof timeline !== 'object') return null

  const root = /** @type {Record<string, unknown>} */ (timeline)
  const proy =
    root.proyeccion && typeof root.proyeccion === 'object'
      ? /** @type {Record<string, unknown>} */ (root.proyeccion)
      : null

  const fases = Array.isArray(root.fases)
    ? root.fases
        .filter((f) => f && typeof f === 'object')
        .map((f) => {
          const phase = /** @type {Record<string, unknown>} */ (f)
          const metricas =
            phase.metricas && typeof phase.metricas === 'object'
              ? /** @type {Record<string, unknown>} */ (phase.metricas)
              : null
          const metricasEsp =
            phase.metricas_esperadas && typeof phase.metricas_esperadas === 'object'
              ? /** @type {Record<string, unknown>} */ (phase.metricas_esperadas)
              : null
          const m = metricasEsp ?? metricas

          return {
            dia: Number(phase.dia ?? 0),
            tipo: String(phase.tipo ?? 'milestone'),
            titulo: String(phase.titulo ?? ''),
            descripcion: String(phase.descripcion ?? ''),
            score: typeof m?.score_promedio === 'number' ? m.score_promedio : null,
            vacantesMatch: typeof m?.vacantes_match === 'number' ? m.vacantes_match : null,
            habilidades: typeof m?.habilidades === 'number' ? m.habilidades : null,
            accionesCompletadas: Array.isArray(phase.acciones_completadas)
              ? phase.acciones_completadas.map(String)
              : [],
          }
        })
        .sort((a, b) => a.dia - b.dia)
    : []

  if (!fases.length) return null

  return {
    inicio: typeof root.inicio === 'string' ? root.inicio : null,
    fases,
    proyeccion: proy && typeof proy.descripcion === 'string' ? proy.descripcion : null,
    tasaCrecimiento:
      proy && typeof proy.tasa_crecimiento_semanal === 'number'
        ? proy.tasa_crecimiento_semanal
        : null,
  }
}
