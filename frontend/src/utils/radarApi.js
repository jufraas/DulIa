/** @typedef {Record<string, number>} RadarScores */

/**
 * @typedef {Object} RadarChartData
 * @property {RadarScores} usuario
 * @property {RadarScores} mercado
 * @property {Record<string, string>} [descriptions]
 */

export const RADAR_DIMENSION_KEYS = [
  'habilidades_tecnicas',
  'experiencia',
  'educacion',
  'ubicacion_modalidad',
  'preparacion',
]

/** @type {Record<string, { name: string, sub: string }>} */
export const RADAR_DIMENSION_LABELS = {
  habilidades_tecnicas: { name: 'Habilidades técnicas', sub: 'Stack + demanda' },
  experiencia: { name: 'Experiencia', sub: 'Años · proyectos' },
  educacion: { name: 'Educación', sub: 'Estudios + certs' },
  ubicacion_modalidad: { name: 'Ubicación / Modalidad', sub: 'Ciudad · modalidad' },
  preparacion: { name: 'Preparación', sub: 'Madurez profesional' },
}

/**
 * @param {unknown} payload Respuesta GET /profile/{id}/radar-data
 * @returns {RadarChartData | null}
 */
export function parseRadarApiResponse(payload) {
  if (!payload || typeof payload !== 'object') return null
  const radar = /** @type {{ radar?: Record<string, unknown> }} */ (payload).radar
  if (!radar?.usuario || !radar?.mercado_promedio) return null

  /** @type {RadarScores} */
  const usuario = {}
  /** @type {RadarScores} */
  const mercado = {}

  for (const key of RADAR_DIMENSION_KEYS) {
    const userVal = /** @type {Record<string, number>} */ (radar.usuario)[key]
    const marketVal = /** @type {Record<string, number>} */ (radar.mercado_promedio)[key]
    if (typeof userVal === 'number') usuario[key] = userVal
    if (typeof marketVal === 'number') mercado[key] = marketVal
  }

  if (!Object.keys(usuario).length) return null

  return {
    usuario,
    mercado,
    descriptions:
      typeof radar.descripcion_dimensiones === 'object' && radar.descripcion_dimensiones
        ? /** @type {Record<string, string>} */ (radar.descripcion_dimensiones)
        : undefined,
  }
}

/**
 * @param {RadarChartData | null} radar
 * @returns {{ key: string, name: string, sub: string }[]}
 */
export function radarAxesFromApi(radar) {
  if (!radar) return []
  return RADAR_DIMENSION_KEYS.filter((key) => key in radar.usuario).map((key) => ({
    key,
    name: RADAR_DIMENSION_LABELS[key]?.name ?? key,
    sub: RADAR_DIMENSION_LABELS[key]?.sub ?? '',
  }))
}
