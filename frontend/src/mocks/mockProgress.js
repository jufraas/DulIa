import { buildMockPlanFromProfile } from '../services/mockPlan.js'
import { planPhaseToDisplay, planToDisplayWeeks } from '../utils/planDisplay.js'
import { computeCurrentDay, resolveNextMilestone } from '../utils/progressDay.js'

/** @typedef {'30' | '60' | '90'} PlanPhase */

/**
 * @typedef {Object} ProgressTask
 * @property {string} id
 * @property {string} label
 * @property {PlanPhase} phase
 * @property {number} week
 * @property {boolean} completed
 * @property {string | null} [completed_at]
 */

/**
 * @typedef {Object} PhaseProgress
 * @property {PlanPhase} phase
 * @property {number} pct
 * @property {boolean} locked
 * @property {number} completed_count
 * @property {number} total_count
 */

/**
 * @typedef {Object} ProgressMilestone
 * @property {number} dia
 * @property {string} logro
 */

/**
 * @typedef {Object} ProgressState
 * @property {string} session_id
 * @property {number} current_day
 * @property {number} global_pct
 * @property {PlanPhase} active_phase
 * @property {ProgressTask[]} tasks
 * @property {PhaseProgress[]} phases
 * @property {ProgressMilestone | null} next_milestone
 * @property {number} unlock_threshold_pct
 * @property {string} [started_at] — mock/offline: inicio del plan (ISO)
 * @property {ProgressMilestone[]} [milestones_catalog] — mock: hitos del plan para recalcular
 */

export const UNLOCK_THRESHOLD_PCT = 80

/** @type {Map<string, ProgressState>} */
const progressBySession = new Map()

/**
 * @param {PlanPhase} phase
 * @param {number} index
 * @param {string} label
 */
export function buildTaskId(phase, index, label) {
  const slug = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40)
  return `p${phase}-t${index}-${slug || 'task'}`
}

/**
 * @param {ProgressTask[]} tasks
 * @param {PlanPhase} phase
 */
export function tasksForPhase(tasks, phase) {
  return tasks.filter((t) => t.phase === phase)
}

/**
 * Resuelve tarea de progreso por fase + label (usado por PlanTimeline).
 * @param {ProgressTask[]} tasks
 * @param {PlanPhase} phase
 * @param {string} label
 */
export function findProgressTaskByLabel(tasks, phase, label) {
  return tasks.find((t) => t.phase === phase && t.label === label) ?? null
}

/**
 * @param {ProgressTask[]} tasks
 * @param {PlanPhase} phase
 */
export function phaseCompletionPct(tasks, phase) {
  const phaseTasks = tasksForPhase(tasks, phase)
  if (!phaseTasks.length) return 0
  const done = phaseTasks.filter((t) => t.completed).length
  return Math.round((done / phaseTasks.length) * 100)
}

/**
 * @param {ProgressTask[]} tasks
 */
export function globalCompletionPct(tasks) {
  if (!tasks.length) return 0
  const done = tasks.filter((t) => t.completed).length
  return Math.round((done / tasks.length) * 100)
}

/**
 * @param {ProgressTask[]} tasks
 * @returns {PlanPhase}
 */
export function resolveActivePhase(tasks) {
  const p30 = phaseCompletionPct(tasks, '30')
  const p60 = phaseCompletionPct(tasks, '60')
  if (p30 < UNLOCK_THRESHOLD_PCT) return '30'
  if (p60 < UNLOCK_THRESHOLD_PCT) return '60'
  return '90'
}

/**
 * @param {ProgressTask[]} tasks
 * @returns {PhaseProgress[]}
 */
export function buildPhaseProgress(tasks) {
  const p30 = phaseCompletionPct(tasks, '30')
  const p60 = phaseCompletionPct(tasks, '60')

  return /** @type {PlanPhase[]} */ (['30', '60', '90']).map((phase) => {
    const phaseTasks = tasksForPhase(tasks, phase)
    const pct = phaseCompletionPct(tasks, phase)
    const locked =
      phase === '60' ? p30 < UNLOCK_THRESHOLD_PCT : phase === '90' ? p60 < UNLOCK_THRESHOLD_PCT : false
    return {
      phase,
      pct,
      locked,
      completed_count: phaseTasks.filter((t) => t.completed).length,
      total_count: phaseTasks.length,
    }
  })
}

/**
 * @param {import('../store/useProfileStore').ActionPlan | null | undefined} plan
 * @param {{ precompleteFirst?: number }} [options]
 * @returns {ProgressTask[]}
 */
export function tasksFromPlan(plan, options = {}) {
  const { precompleteFirst = 2 } = options
  /** @type {ProgressTask[]} */
  const tasks = []
  let index = 0

  for (const week of planToDisplayWeeks(plan)) {
    const weekNum = Number(String(week.w).replace(/\D/g, '')) || index + 1
    for (const label of week.tasks) {
      tasks.push({
        id: buildTaskId('30', index, label),
        label,
        phase: '30',
        week: weekNum,
        completed: index < precompleteFirst,
        completed_at: index < precompleteFirst ? new Date().toISOString() : null,
      })
      index += 1
    }
  }

  const phase60 = planPhaseToDisplay(plan?.fase_60)
  if (phase60) {
    phase60.tasks.forEach((label, i) => {
      tasks.push({
        id: buildTaskId('60', i, label),
        label,
        phase: '60',
        week: 5,
        completed: false,
        completed_at: null,
      })
    })
  }

  const phase90 = planPhaseToDisplay(plan?.fase_90)
  if (phase90) {
    phase90.tasks.forEach((label, i) => {
      tasks.push({
        id: buildTaskId('90', i, label),
        label,
        phase: '90',
        week: 9,
        completed: false,
        completed_at: null,
      })
    })
  }

  return tasks
}

/**
 * Recalcula current_day y next_milestone desde started_at (paridad con GET /progress API).
 * @param {ProgressState} state
 */
function syncProgressDay(state) {
  state.current_day = computeCurrentDay(state.started_at)
  if (state.milestones_catalog?.length) {
    state.next_milestone = resolveNextMilestone(state.milestones_catalog, state.current_day)
  }
  return state
}

/**
 * @param {unknown[]} milestones
 * @returns {ProgressMilestone[]}
 */
function normalizeMilestones(milestones) {
  if (!Array.isArray(milestones)) return []
  return milestones
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const m = /** @type {{ dia?: number, logro?: string }} */ (item)
      return { dia: Number(m.dia ?? 0), logro: String(m.logro ?? '') }
    })
    .filter((m) => m.dia > 0)
}

/**
 * @param {string} sessionId
 * @param {import('../store/useProfileStore').ActionPlan | null | undefined} plan
 * @param {import('../store/useProfileStore').SavedProfile | null | undefined} [profile]
 * @returns {ProgressState}
 */
export function buildMockProgressState(sessionId, plan, profile = null) {
  const resolvedPlan = plan?.semanas?.length ? plan : buildMockPlanFromProfile(profile)
  const tasks = tasksFromPlan(resolvedPlan, { precompleteFirst: 2 })
  const milestones = normalizeMilestones(resolvedPlan.milestones)
  const started_at = new Date().toISOString()
  const current_day = computeCurrentDay(started_at)
  const global_pct = globalCompletionPct(tasks)
  const active_phase = resolveActivePhase(tasks)

  return {
    session_id: sessionId,
    started_at,
    current_day,
    global_pct,
    active_phase,
    tasks,
    phases: buildPhaseProgress(tasks),
    milestones_catalog: milestones,
    next_milestone: resolveNextMilestone(milestones, current_day),
    unlock_threshold_pct: UNLOCK_THRESHOLD_PCT,
  }
}

/**
 * @param {string} sessionId
 * @param {import('../store/useProfileStore').ActionPlan | null | undefined} [plan]
 * @param {import('../store/useProfileStore').SavedProfile | null | undefined} [profile]
 */
export function ensureMockProgress(sessionId, plan = null, profile = null) {
  const existing = progressBySession.get(sessionId)
  if (existing) {
    syncProgressDay(existing)
    progressBySession.set(sessionId, existing)
    return structuredClone(existing)
  }

  const created = buildMockProgressState(sessionId, plan, profile)
  progressBySession.set(sessionId, created)
  return structuredClone(created)
}

/** @param {string} sessionId */
export function getMockProgress(sessionId, plan = null, profile = null) {
  return ensureMockProgress(sessionId, plan, profile)
}

/**
 * @param {string} sessionId
 * @param {import('../store/useProfileStore').ActionPlan | null | undefined} [plan]
 * @param {import('../store/useProfileStore').SavedProfile | null | undefined} [profile]
 */
export function initMockProgress(sessionId, plan = null, profile = null) {
  const created = buildMockProgressState(sessionId, plan, profile)
  progressBySession.set(sessionId, created)
  return structuredClone(created)
}

/**
 * @param {string} sessionId
 * @param {string} taskId
 * @param {boolean} [completed]
 */
export function toggleMockTask(sessionId, taskId, completed) {
  const state = progressBySession.get(sessionId)
  if (!state) return null

  const task = state.tasks.find((t) => t.id === taskId)
  if (!task) return null

  const phaseMeta = state.phases.find((p) => p.phase === task.phase)
  if (phaseMeta?.locked && !task.completed) {
    return structuredClone(state)
  }

  const nextCompleted = completed ?? !task.completed
  task.completed = nextCompleted
  task.completed_at = nextCompleted ? new Date().toISOString() : null

  state.global_pct = globalCompletionPct(state.tasks)
  state.active_phase = resolveActivePhase(state.tasks)
  state.phases = buildPhaseProgress(state.tasks)
  syncProgressDay(state)
  progressBySession.set(sessionId, state)
  return structuredClone(state)
}

/**
 * @param {string} sessionId
 * @param {string[]} weakSkills
 */
export function addMockTasksFromWeakSkills(sessionId, weakSkills) {
  const state = progressBySession.get(sessionId)
  if (!state) return null

  syncProgressDay(state)

  const skills = (weakSkills ?? []).map((s) => String(s).trim()).filter(Boolean)
  skills.forEach((skill, i) => {
    const label = `Practica entrevista técnica: ${skill}`
    state.tasks.push({
      id: buildTaskId('30', state.tasks.length + i, label),
      label,
      phase: '30',
      week: Math.min(4, Math.ceil(state.current_day / 7)),
      completed: false,
      completed_at: null,
    })
  })

  state.global_pct = globalCompletionPct(state.tasks)
  state.phases = buildPhaseProgress(state.tasks)
  syncProgressDay(state)
  progressBySession.set(sessionId, state)
  return structuredClone(state)
}

/** Reset in-memory mocks (tests). */
export function resetMockProgressStore() {
  progressBySession.clear()
}

/**
 * @param {string} [_userId]
 * @param {import('../store/useProfileStore').SavedProfile | null | undefined} [profile]
 */
export function mockHasProfile(_userId, profile = null) {
  return {
    has_profile: Boolean(profile?.session_id ?? profile?.id),
    session_id: profile?.session_id ?? null,
  }
}

/** Demo fallback cuando no hay perfil en cache. */
export function mockHasProfileDemo() {
  return { has_profile: true, session_id: 'demo-session' }
}

/**
 * @param {unknown} data
 * @returns {ProgressState | null}
 */
export function normalizeProgressResponse(data) {
  if (!data || typeof data !== 'object') return null
  const raw = /** @type {Record<string, unknown>} */ (data)
  const tasks = Array.isArray(raw.tasks) ? raw.tasks : []
  if (!tasks.length) return null

  return {
    session_id: String(raw.session_id ?? ''),
    current_day: Math.min(Math.max(Number(raw.current_day ?? 1), 1), 90),
    global_pct: Number(raw.global_pct ?? 0),
    active_phase: /** @type {PlanPhase} */ (raw.active_phase ?? '30'),
    tasks: tasks.map((item, index) => {
      const t = /** @type {Record<string, unknown>} */ (item)
      return {
        id: String(t.id ?? `task-${index}`),
        label: String(t.label ?? ''),
        phase: /** @type {PlanPhase} */ (t.phase ?? '30'),
        week: Number(t.week ?? 1),
        completed: Boolean(t.completed),
        completed_at: t.completed_at ? String(t.completed_at) : null,
      }
    }),
    phases: Array.isArray(raw.phases)
      ? raw.phases.map((item) => {
          const p = /** @type {Record<string, unknown>} */ (item)
          return {
            phase: /** @type {PlanPhase} */ (p.phase ?? '30'),
            pct: Number(p.pct ?? 0),
            locked: Boolean(p.locked),
            completed_count: Number(p.completed_count ?? 0),
            total_count: Number(p.total_count ?? 0),
          }
        })
      : buildPhaseProgress(
          tasks.map((item, index) => {
            const t = /** @type {Record<string, unknown>} */ (item)
            return {
              id: String(t.id ?? `task-${index}`),
              label: String(t.label ?? ''),
              phase: /** @type {PlanPhase} */ (t.phase ?? '30'),
              week: Number(t.week ?? 1),
              completed: Boolean(t.completed),
            }
          }),
        ),
    next_milestone:
      raw.next_milestone && typeof raw.next_milestone === 'object'
        ? {
            dia: Number(
              /** @type {Record<string, unknown>} */ (raw.next_milestone).dia ?? 30,
            ),
            logro: String(
              /** @type {Record<string, unknown>} */ (raw.next_milestone).logro ?? '',
            ),
          }
        : null,
    unlock_threshold_pct: Number(raw.unlock_threshold_pct ?? UNLOCK_THRESHOLD_PCT),
  }
}
