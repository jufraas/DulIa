const MAX_PLAN_DAY = 90

/**
 * Día del plan alineado al backend: día 1 el primer día, +1 por día calendario, tope 90.
 * @param {string | Date | null | undefined} startedAt ISO o Date de inicio del plan
 * @param {Date} [now= new Date()]
 * @returns {number}
 */
export function computeCurrentDay(startedAt, now = new Date()) {
  if (!startedAt) return 1

  const start = startedAt instanceof Date ? startedAt : new Date(startedAt)
  if (Number.isNaN(start.getTime())) return 1

  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const elapsedDays = Math.floor((nowUtc - startUtc) / 86_400_000)

  return Math.min(Math.max(elapsedDays + 1, 1), MAX_PLAN_DAY)
}

/**
 * Primer hito cuyo día es estrictamente mayor al día actual del plan.
 * @param {Array<{ dia?: number, logro?: string }>} milestones
 * @param {number} currentDay
 * @returns {{ dia: number, logro: string } | null}
 */
export function resolveNextMilestone(milestones, currentDay) {
  if (!Array.isArray(milestones)) return null

  const sorted = [...milestones].sort((a, b) => Number(a.dia ?? 0) - Number(b.dia ?? 0))
  for (const item of sorted) {
    const dia = Number(item.dia ?? 0)
    if (dia > currentDay) {
      return { dia, logro: String(item.logro ?? '') }
    }
  }
  return null
}
