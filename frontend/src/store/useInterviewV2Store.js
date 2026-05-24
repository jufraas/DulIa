import { create } from 'zustand'
import {
  abortInterview,
  fetchInterviewState,
  fetchInterviewV2History,
  sendInterviewTurn,
  startInterviewV2,
} from '../services/interviewV2Api'
import { addTasksFromWeakSkills } from '../services/api'
import { mapStageProgress, mapSummaryToDisplay, turnsToMessages } from '../utils/interviewV2Display'
import { getOrCreateSessionId } from '../utils/session'
import { useProfileStore } from './useProfileStore'
import { useProgressStore } from './useProgressStore'

const STORAGE_KEY = 'dulia_interview_v2_id'

/** @typedef {import('../mocks/mockInterviewV2').InterviewPersona} InterviewPersona */
/** @typedef {import('../mocks/mockInterviewV2').ChatMessage} ChatMessage */
/** @typedef {'api' | 'mock'} DataSource */

function persistInterviewId(id) {
  if (id) localStorage.setItem(STORAGE_KEY, id)
  else localStorage.removeItem(STORAGE_KEY)
}

export const useInterviewV2Store = create((set, get) => ({
  interviewId: null,
  persona: /** @type {InterviewPersona | null} */ (null),
  messages: /** @type {ChatMessage[]} */ ([]),
  stage: 'rapport',
  stageProgress: mapStageProgress('rapport'),
  completedStages: /** @type {string[]} */ ([]),
  targetSkill: null,
  targetRole: null,
  finished: false,
  summary: null,
  summaryDisplay: null,
  sending: false,
  starting: false,
  loading: false,
  error: '',
  dataSource: /** @type {DataSource} */ ('api'),
  dataSourceDetail: '',
  history: /** @type {Array<Record<string, unknown>>} */ ([]),
  stageTransitionPending: false,
  stageTransitionMessage: '',

  fetchHistory: async () => {
    const sessionId =
      useProfileStore.getState().savedProfile?.session_id ?? getOrCreateSessionId()
    set({ loading: true, error: '' })
    try {
      const result = await fetchInterviewV2History(sessionId)
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

  hydrate: async () => {
    const savedId = localStorage.getItem(STORAGE_KEY)
    if (!savedId) return false
    try {
      const result = await fetchInterviewState(savedId)
      const state = result.data
      if (state.status === 'aborted') {
        persistInterviewId(null)
        return false
      }
      const messages = turnsToMessages(state.turns)
      const finished = state.status === 'completed' || state.stage === 'finalizada'
      set({
        interviewId: savedId,
        persona: state.persona ?? null,
        messages,
        stage: state.stage ?? 'rapport',
        stageProgress: mapStageProgress(state.stage ?? 'rapport'),
        targetSkill: state.target_skill ?? null,
        targetRole: state.target_role ?? null,
        finished,
        summary: state.summary ?? null,
        summaryDisplay: state.summary
          ? mapSummaryToDisplay(state.summary, state.target_skill ?? undefined)
          : null,
        dataSource: result.dataSource,
        dataSourceDetail: result.fallbackDetail ?? '',
      })
      return true
    } catch {
      persistInterviewId(null)
      return false
    }
  },

  start: async (targetSkill, targetRole = null) => {
    const sessionId =
      useProfileStore.getState().savedProfile?.session_id ?? getOrCreateSessionId()
    set({
      starting: true,
      error: '',
      finished: false,
      summary: null,
      summaryDisplay: null,
      messages: [],
      completedStages: [],
    })
    try {
      const result = await startInterviewV2(sessionId, targetSkill, targetRole)
      const data = result.data
      const opening = {
        role: 'interviewer',
        text: data.opening_message,
        stage: data.stage ?? 'rapport',
        t: new Date().toISOString(),
      }
      persistInterviewId(data.interview_id)
      set({
        interviewId: data.interview_id,
        persona: data.persona,
        messages: [opening],
        stage: data.stage ?? 'rapport',
        stageProgress: mapStageProgress(data.stage ?? 'rapport'),
        targetSkill,
        targetRole,
        starting: false,
        dataSource: result.dataSource,
        dataSourceDetail: result.fallbackDetail ?? '',
      })
      return true
    } catch (err) {
      set({
        starting: false,
        error: err instanceof Error ? err.message : 'No pudimos iniciar la entrevista.',
      })
      return false
    }
  },

  sendMessage: async (message) => {
    const { interviewId, persona, stageTransitionPending } = get()
    if (!interviewId || stageTransitionPending) return false

    const trimmed = message.trim()
    if (!trimmed) return false

    const candidateMsg = {
      role: 'candidate',
      text: trimmed,
      stage: get().stage,
      t: new Date().toISOString(),
    }
    set((s) => ({
      messages: [...s.messages, candidateMsg],
      sending: true,
      error: '',
    }))

    try {
      const result = await sendInterviewTurn(interviewId, trimmed)
      const data = result.data

      const applyTurn = () => {
        const interviewerMsg = {
          role: 'interviewer',
          text: data.reply,
          stage: data.stage,
          t: new Date().toISOString(),
        }
        const completedStages = data.stage_advance
          ? [...get().completedStages, data.stage_advance.from_stage]
          : get().completedStages

        set({
          messages: [...get().messages, interviewerMsg],
          stage: data.stage,
          stageProgress: mapStageProgress(data.stage, completedStages),
          completedStages,
          sending: false,
          stageTransitionPending: false,
          stageTransitionMessage: '',
          dataSource: result.dataSource,
          dataSourceDetail: result.fallbackDetail ?? get().dataSourceDetail,
        })

        if (data.finished && data.summary) {
          persistInterviewId(null)
          set({
            finished: true,
            summary: data.summary,
            summaryDisplay: mapSummaryToDisplay(
              data.summary,
              get().targetSkill ?? undefined,
            ),
          })
          void get().fetchHistory()
        }
      }

      if (data.stage_advance) {
        const name = persona?.nombre?.split(' ')[0] ?? 'La entrevistadora'
        set({
          stageTransitionPending: true,
          stageTransitionMessage: `${name} está pensando en la siguiente sección…`,
          sending: true,
        })
        await new Promise((r) => setTimeout(r, 1500))
      }

      applyTurn()
      return true
    } catch (err) {
      set({
        sending: false,
        stageTransitionPending: false,
        error: err instanceof Error ? err.message : 'No pudimos enviar tu mensaje.',
      })
      return false
    }
  },

  abort: async () => {
    const { interviewId } = get()
    if (!interviewId) return false
    try {
      await abortInterview(interviewId)
      persistInterviewId(null)
      get().reset()
      return true
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'No pudimos pausar la entrevista.',
      })
      return false
    }
  },

  loadSummaryFromHistory: async (interviewId) => {
    set({ loading: true, error: '' })
    try {
      const result = await fetchInterviewState(interviewId)
      const state = result.data
      if (!state.summary) {
        set({ loading: false, error: 'Esta entrevista no tiene resumen disponible.' })
        return false
      }
      set({
        summary: state.summary,
        summaryDisplay: mapSummaryToDisplay(
          state.summary,
          state.target_skill ?? undefined,
        ),
        persona: state.persona ?? null,
        finished: true,
        loading: false,
      })
      return true
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'No pudimos cargar el resumen.',
      })
      return false
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

  reset: () => {
    persistInterviewId(null)
    set({
      interviewId: null,
      persona: null,
      messages: [],
      stage: 'rapport',
      stageProgress: mapStageProgress('rapport'),
      completedStages: [],
      targetSkill: null,
      targetRole: null,
      finished: false,
      summary: null,
      summaryDisplay: null,
      sending: false,
      starting: false,
      error: '',
      stageTransitionPending: false,
      stageTransitionMessage: '',
    })
  },
}))
