import { create } from 'zustand'
import {
  addTasksFromWeakSkills,
  finishInterview as finishInterviewApi,
  interviewHistory as interviewHistoryApi,
  startInterview as startInterviewApi,
  submitAnswer as submitAnswerApi,
} from '../services/api'
import { getOrCreateSessionId } from '../utils/session'
import { useProfileStore } from './useProfileStore'

/** @typedef {import('../mocks/mockInterview').ActiveInterviewSession} ActiveInterviewSession */
/** @typedef {import('../mocks/mockInterview').InterviewResult} InterviewResult */
/** @typedef {import('../mocks/mockInterview').InterviewHistoryItem} InterviewHistoryItem */

export const useInterviewStore = create((set, get) => ({
  activeSession: /** @type {ActiveInterviewSession | null} */ (null),
  lastResult: /** @type {InterviewResult | null} */ (null),
  history: /** @type {InterviewHistoryItem[]} */ ([]),
  loading: false,
  submitting: false,
  error: '',

  fetchHistory: async (userId) => {
    set({ loading: true, error: '' })
    try {
      const history = await interviewHistoryApi(userId ?? 'demo-user')
      set({ history, loading: false })
      return history
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'No pudimos cargar el historial.',
      })
      return []
    }
  },

  startInterview: async (skill, role = null) => {
    const sessionId =
      useProfileStore.getState().savedProfile?.session_id ?? getOrCreateSessionId()
    set({ loading: true, error: '', lastResult: null })
    try {
      const activeSession = await startInterviewApi(skill, role, sessionId)
      set({ activeSession, loading: false })
      return activeSession
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'No pudimos iniciar la entrevista.',
      })
      return null
    }
  },

  submitAnswer: async (answer) => {
    const session = get().activeSession
    if (!session) return null

    set({ submitting: true, error: '' })
    try {
      const updated = await submitAnswerApi(session.id, answer)
      set({ activeSession: updated, submitting: false })
      return updated
    } catch (err) {
      set({
        submitting: false,
        error: err instanceof Error ? err.message : 'No pudimos enviar tu respuesta.',
      })
      return null
    }
  },

  finishInterview: async (userId) => {
    const session = get().activeSession
    if (!session) return null

    set({ loading: true, error: '' })
    try {
      const lastResult = await finishInterviewApi(session.id, userId ?? 'demo-user')
      set({
        lastResult,
        activeSession: null,
        loading: false,
      })
      await get().fetchHistory(userId)
      return lastResult
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'No pudimos finalizar la entrevista.',
      })
      return null
    }
  },

  addTasksFromWeakSkills: async (weakSkills, userId) => {
    const { savedProfile, plan } = useProfileStore.getState()
    const sessionId = savedProfile?.session_id ?? getOrCreateSessionId()
    set({ loading: true, error: '' })
    try {
      await addTasksFromWeakSkills(weakSkills, sessionId, plan, savedProfile)
      set({ loading: false })
      return true
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'No pudimos agregar tareas al plan.',
      })
      return false
    } finally {
      void userId
    }
  },

  clearActiveSession: () => set({ activeSession: null }),

  reset: () =>
    set({
      activeSession: null,
      lastResult: null,
      history: [],
      loading: false,
      submitting: false,
      error: '',
    }),
}))
