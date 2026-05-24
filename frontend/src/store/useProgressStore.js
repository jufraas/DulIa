import { create } from 'zustand'
import { getProgress, initProgress as initProgressApi, toggleTask as toggleTaskApi } from '../services/api'
import {
  buildPhaseProgress,
  globalCompletionPct,
  resolveActivePhase,
} from '../mocks/mockProgress'
import { getOrCreateSessionId } from '../utils/session'
import { useProfileStore } from './useProfileStore'

/** @typedef {import('../mocks/mockProgress').ProgressState} ProgressState */
/** @typedef {import('../mocks/mockProgress').ProgressTask} ProgressTask */
/** @typedef {'week' | 'pending' | 'completed'} TaskFilter */

/**
 * @param {ProgressTask[]} tasks
 * @param {TaskFilter} filter
 * @param {number} currentDay
 */
export function filterProgressTasks(tasks, filter, currentDay = 1) {
  const currentWeek = Math.max(1, Math.ceil(currentDay / 7))
  switch (filter) {
    case 'week':
      return tasks.filter((t) => t.week === currentWeek && !t.completed)
    case 'completed':
      return tasks.filter((t) => t.completed)
    case 'pending':
    default:
      return tasks.filter((t) => !t.completed)
  }
}

export const useProgressStore = create((set, get) => ({
  progress: /** @type {ProgressState | null} */ (null),
  taskFilter: /** @type {TaskFilter} */ ('pending'),
  loading: false,
  togglingTaskId: /** @type {string | null} */ (null),
  error: '',

  setTaskFilter: (taskFilter) => set({ taskFilter }),

  fetchProgress: async (sessionId = getOrCreateSessionId()) => {
    const { savedProfile, plan } = useProfileStore.getState()
    set({ loading: true, error: '' })
    try {
      const progress = await getProgress(sessionId, plan, savedProfile)
      set({ progress, loading: false })
      return progress
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'No pudimos cargar tu progreso.',
      })
      return null
    }
  },

  initProgress: async (sessionId = getOrCreateSessionId()) => {
    const { savedProfile, plan } = useProfileStore.getState()
    set({ loading: true, error: '' })
    try {
      const progress = await initProgressApi(sessionId, plan, savedProfile)
      set({ progress, loading: false })
      return progress
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'No pudimos iniciar tu progreso.',
      })
      return null
    }
  },

  toggleTask: async (taskId) => {
    const previous = get().progress
    if (!previous) return null

    const task = previous.tasks.find((t) => t.id === taskId)
    if (!task) return null

    const phaseMeta = previous.phases.find((p) => p.phase === task.phase)
    if (phaseMeta?.locked && !task.completed) {
      set({ error: `Completa ${previous.unlock_threshold_pct}% de la fase anterior para desbloquear.` })
      return null
    }

    const optimisticTasks = previous.tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            completed: !t.completed,
            completed_at: !t.completed ? new Date().toISOString() : null,
          }
        : t,
    )

    set({
      togglingTaskId: taskId,
      error: '',
      progress: {
        ...previous,
        tasks: optimisticTasks,
        global_pct: globalCompletionPct(optimisticTasks),
        active_phase: resolveActivePhase(optimisticTasks),
        phases: buildPhaseProgress(optimisticTasks),
      },
    })

    const { savedProfile, plan } = useProfileStore.getState()
    const sessionId = savedProfile?.session_id ?? getOrCreateSessionId()

    try {
      const progress = await toggleTaskApi(
        taskId,
        !task.completed,
        sessionId,
        plan,
        savedProfile,
      )
      set({ progress, togglingTaskId: null })
      return progress
    } catch (err) {
      set({
        progress: previous,
        togglingTaskId: null,
        error: err instanceof Error ? err.message : 'No pudimos actualizar la tarea.',
      })
      return null
    }
  },

  reset: () =>
    set({
      progress: null,
      taskFilter: 'pending',
      loading: false,
      togglingTaskId: null,
      error: '',
    }),
}))
