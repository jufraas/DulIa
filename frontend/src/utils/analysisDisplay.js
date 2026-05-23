/**
 * Normaliza la respuesta de POST /profile/{id}/analyze para la UI.
 *
 * @typedef {Object} AnalysisInsightItem
 * @property {string} label
 * @property {string} text
 *
 * @typedef {Object} AnalysisOpportunity
 * @property {string} sector
 * @property {string} razon
 * @property {string} accion
 *
 * @typedef {Object} AnalysisInsights
 * @property {number|null} overall
 * @property {string|null} descripcion
 * @property {string|null} comparativa
 * @property {AnalysisInsightItem[]} fortalezas
 * @property {AnalysisInsightItem[]} debilidades
 * @property {string[]} recomendaciones
 * @property {AnalysisOpportunity[]} oportunidades
 */

/**
 * @param {unknown} analysis
 * @returns {AnalysisInsights | null}
 */
export function parseAnalysisResponse(analysis) {
  if (!analysis || typeof analysis !== 'object') return null

  const root = /** @type {Record<string, unknown>} */ (analysis)
  const analisis = /** @type {Record<string, unknown>} */ (
    root.analisis && typeof root.analisis === 'object' ? root.analisis : root
  )

  const np =
    analisis.nivel_preparacion && typeof analisis.nivel_preparacion === 'object'
      ? /** @type {Record<string, unknown>} */ (analisis.nivel_preparacion)
      : {}

  /** @param {unknown} list @param {(item: Record<string, unknown>) => AnalysisInsightItem} mapFn */
  const mapList = (list, mapFn) =>
    Array.isArray(list)
      ? list
          .slice(0, 3)
          .filter((item) => item && typeof item === 'object')
          .map((item) => mapFn(/** @type {Record<string, unknown>} */ (item)))
      : []

  return {
    overall: typeof np.overall === 'number' ? np.overall : null,
    descripcion: typeof np.descripcion === 'string' ? np.descripcion : null,
    comparativa: typeof np.comparativa === 'string' ? np.comparativa : null,
    fortalezas: mapList(analisis.fortalezas, (f) => ({
      label: String(f.area ?? 'Fortaleza'),
      text: String(f.descripcion ?? f.area ?? ''),
    })),
    debilidades: mapList(analisis.debilidades, (d) => ({
      label: String(d.area ?? 'A mejorar'),
      text: String(d.descripcion ?? d.area ?? ''),
    })).slice(0, 2),
    recomendaciones: Array.isArray(analisis.recomendaciones)
      ? analisis.recomendaciones.filter((r) => typeof r === 'string').slice(0, 3)
      : [],
    oportunidades: Array.isArray(analisis.oportunidades)
      ? analisis.oportunidades
          .slice(0, 1)
          .filter((o) => o && typeof o === 'object')
          .map((o) => {
            const opp = /** @type {Record<string, unknown>} */ (o)
            return {
              sector: String(opp.sector ?? ''),
              razon: String(opp.razon ?? ''),
              accion: String(opp.accion_inmediata ?? ''),
            }
          })
      : [],
  }
}

/**
 * @param {{
 *   insights?: AnalysisInsights | null,
 *   jobs?: import('../store/useProfileStore').Job[],
 *   radar?: import('../utils/radarApi').RadarChartData | null,
 * }} params
 */
export function resolveEmployabilityScore({ insights, jobs = [], radar }) {
  if (insights?.overall != null) return insights.overall
  if (jobs.length > 0) {
    return Math.max(...jobs.map((j) => j.score_compatibilidad ?? 0))
  }
  if (radar?.usuario?.preparacion != null) return radar.usuario.preparacion
  return 0
}
