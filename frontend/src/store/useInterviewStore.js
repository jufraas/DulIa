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
import { useProgressStore } from './useProgressStore'

/** @typedef {import('../mocks/mockInterview').ActiveInterviewSession} ActiveInterviewSession */
/** @typedef {import('../mocks/mockInterview').InterviewResult} InterviewResult */
/** @typedef {import('../mocks/mockInterview').InterviewHistoryItem} InterviewHistoryItem */
/** @typedef {'api' | 'mock'} InterviewDataSource */

export const useInterviewStore = create((set, get) => ({
  activeSession: /** @type {ActiveInterviewSession | null} */ (null),
  lastResult: /** @type {InterviewResult | null} */ (null),
  history: /** @type {InterviewHistoryItem[]} */ ([]),
  loading: false,
  submitting: false,
  error: '',
  dataSource: /** @type {InterviewDataSource} */ ('api'),
  dataSourceDetail: '',

  fetchHistory: async () => {
    const sessionId =
      useProfileStore.getState().savedProfile?.session_id ?? getOrCreateSessionId()
    set({ loading: true, error: '' })
    try {
      const result = await interviewHistoryApi(sessionId)
      set({
        history: result.data,
        dataSource: result.dataSource,
        dataSourceDetail: result.fallbackDetail ?? '',
        loading: false,
      })
      return result.data
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
      const result = await startInterviewApi(skill, role, sessionId)
      set({
        activeSession: result.data,
        dataSource: result.dataSource,
        dataSourceDetail: result.fallbackDetail ?? '',
        loading: false,
      })
      return result.data
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
      const result = await submitAnswerApi(session.id, answer)
      set({
        activeSession: result.data,
        dataSource: result.dataSource,
        dataSourceDetail: result.fallbackDetail ?? '',
        submitting: false,
      })
      return result.data
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
      const result = await finishInterviewApi(session.id, userId ?? 'demo-user')
      set({
        lastResult: result.data,
        activeSession: null,
        dataSource: result.dataSource,
        dataSourceDetail: result.fallbackDetail ?? '',
        loading: false,
      })
      await get().fetchHistory()
      return result.data
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'No pudimos finalizar la entrevista.',
      })
      return null
    }
  },

  addTasksFromWeakSkills: async (weakSkills) => {
    const { savedProfile, plan } = useProfileStore.getState()
    const sessionId = savedProfile?.session_id ?? getOrCreateSessionId()
    set({ loading: true, error: '' })
    try {
      const result = await addTasksFromWeakSkills(weakSkills, sessionId, plan, savedProfile)
      useProgressStore.setState({
        progress: result.data,
        dataSource: result.dataSource,
        dataSourceDetail: result.fallbackDetail ?? '',
      })
      set({ loading: false })
      return true
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'No pudimos agregar tareas al plan.',
      })
      return false
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
      dataSource: 'api',
      dataSourceDetail: '',
    }),
}))
