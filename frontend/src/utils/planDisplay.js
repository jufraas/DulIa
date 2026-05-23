/**
 * Normaliza POST /profile/{id}/action-plan → shape del store para ThirtyDayPlan.
 * @param {unknown} data
 * @returns {import('../store/useProfileStore').ActionPlan | null}
 */
export function normalizeActionPlanOut(data) {
  if (!data || typeof data !== 'object') return null
  const raw = /** @type {Record<string, unknown>} */ (data)
  const plan = raw.plan
  if (!plan || typeof plan !== 'object') return null

  const planObj = /** @type {Record<string, unknown>} */ (plan)
  const fase30 = planObj.fase_30
  if (!fase30 || typeof fase30 !== 'object') return null

  const fase = /** @type {Record<string, unknown>} */ (fase30)
  const acciones = Array.isArray(fase.acciones) ? fase.acciones : []

  /** @type {Map<number, string[]>} */
  const byWeek = new Map()
  for (const item of acciones) {
    if (!item || typeof item !== 'object') continue
    const accion = /** @type {Record<string, unknown>} */ (item)
    const semana = Number(accion.semana ?? 1)
    const tarea = String(accion.tarea ?? '').trim()
    if (!tarea) continue
    const list = byWeek.get(semana) ?? []
    list.push(tarea)
    byWeek.set(semana, list)
  }

  const semanas = [...byWeek.entries()]
    .sort(([a], [b]) => a - b)
    .map(([numero, tareas]) => ({
      numero,
      titulo:
        numero === 1 && fase.titulo
          ? String(fase.titulo)
          : `Semana ${numero}`,
      tareas,
    }))

  if (!semanas.length) return null

  return {
    session_id: String(raw.session_id ?? ''),
    semanas,
    resumen_ejecutivo: planObj.resumen_ejecutivo
      ? String(planObj.resumen_ejecutivo)
      : undefined,
    fase_60: planObj.fase_60,
    fase_90: planObj.fase_90,
    milestones: Array.isArray(planObj.milestones) ? planObj.milestones : undefined,
    recursos_recomendados: Array.isArray(planObj.recursos_recomendados)
      ? planObj.recursos_recomendados
      : undefined,
  }
}

/**
 * @param {import('../store/useProfileStore').ActionPlan | null | undefined} plan
 * @returns {{ w: string, title: string, tasks: string[] }[]}
 */
export function planToDisplayWeeks(plan) {
  if (!plan?.semanas?.length) return []

  return plan.semanas.map((semana) => ({
    w: `Semana ${semana.numero}`,
    title: semana.titulo,
    tasks: semana.tareas ?? [],
  }))
}

/**
 * @deprecated Legacy GET /plan/{id} — mantener solo por compatibilidad de caché antiguo.
 * @param {unknown} data
 * @returns {import('../store/useProfileStore').ActionPlan | null}
 */
export function normalizeLegacyPlanOut(data) {
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
