/** Labels amigables para jobs.source en GET /market/dashboard */
export const MARKET_SOURCE_LABELS = {
  getonbrd: 'Get on Board',
  remotive: 'Remotive',
  mock: 'Demo',
}

/** Labels para por_modalidad (siempre remoto | presencial | hibrido) */
export const MARKET_MODALITY_LABELS = {
  remoto: 'Remoto',
  presencial: 'Presencial',
  hibrido: 'Híbrido',
}

const MODALITY_ORDER = ['remoto', 'presencial', 'hibrido']

/**
 * @param {import('../store/useProfileStore').MarketDashboard['por_modalidad'] | undefined | null} porModalidad
 */
export function getModalityEntries(porModalidad) {
  if (!porModalidad) return []
  return MODALITY_ORDER.map((key) => ({
    key,
    label: MARKET_MODALITY_LABELS[key] ?? key,
    count: porModalidad[key] ?? 0,
  }))
}

/**
 * Copy producto: locales (Get on Board) + remoto internacional (Remotive).
 * @param {import('../store/useProfileStore').MarketDashboard['por_fuente'] | undefined | null} porFuente
 * @returns {string | null}
 */
export function formatMarketSourceSummary(porFuente) {
  if (!porFuente) return null

  const parts = []
  const local = porFuente.getonbrd ?? 0
  const remote = porFuente.remotive ?? 0

  if (local > 0) {
    parts.push(`${local.toLocaleString('es-CO')} vacantes locales`)
  }
  if (remote > 0) {
    parts.push(`${remote.toLocaleString('es-CO')} remoto internacional`)
  }

  return parts.length > 0 ? parts.join(' · ') : null
}

/**
 * Detalle por fuente con nombre legible.
 * @param {import('../store/useProfileStore').MarketDashboard['por_fuente'] | undefined | null} porFuente
 */
export function getSourceEntries(porFuente) {
  if (!porFuente) return []

  return Object.entries(porFuente)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([key, count]) => ({
      key,
      label: MARKET_SOURCE_LABELS[key] ?? key,
      count,
    }))
}
