import { mockPlan } from '../services/mockPlan'

/**
 * @param {import('../store/useProfileStore').ThirtyDayPlan | null | undefined} plan
 * @returns {{ w: string, title: string, tasks: string[] }[]}
 */
export function planToDisplayWeeks(plan) {
  const source = plan?.semanas?.length ? plan : mockPlan

  return source.semanas.map((semana) => ({
    w: `Semana ${semana.numero}`,
    title: semana.titulo,
    tasks: semana.tareas ?? [],
  }))
}

/**
 * Normaliza respuesta API → shape del store.
 * @param {unknown} data
 * @returns {import('../store/useProfileStore').ThirtyDayPlan | null}
 */
export function normalizePlanOut(data) {
  if (!data || typeof data !== 'object') return null
  const raw = /** @type {Record<string, unknown>} */ (data)
  const semanas = Array.isArray(raw.semanas) ? raw.semanas : null
  if (!semanas?.length) return null

  return {
    session_id: String(raw.session_id ?? ''),
    semanas: semanas.map((item, index) => {
      const semana = /** @type {Record<string, unknown>} */ (item)
      return {
        numero: Number(semana.numero ?? index + 1),
        titulo: String(semana.titulo ?? `Semana ${index + 1}`),
        tareas: Array.isArray(semana.tareas)
          ? semana.tareas.map((t) => String(t))
          : [],
      }
    }),
  }
}
