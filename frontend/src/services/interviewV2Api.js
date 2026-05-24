import api from './api'
import { extractApiErrorMessage, isBackendUnreachable, isForceProgressMock } from '../utils/apiErrors'
import {
  abortMockInterviewV2,
  fetchMockInterviewStateV2,
  getMockInterviewV2History,
  sendMockTurn,
  startMockInterviewV2,
} from '../mocks/mockInterviewV2'

/** @returns {boolean} */
export function isForceInterviewMock() {
  const flag = import.meta.env.VITE_FORCE_INTERVIEW_MOCK
  return flag === 'true' || flag === '1' || isForceProgressMock()
}

/** @param {unknown} err @param {string} label */
function logFallback(label, err) {
  if (import.meta.env.DEV) {
    console.warn(`[DulIA] ${label}: entrevista V2 mock`, err)
  }
}

/** @template T
 * @typedef {{ data: T, dataSource: 'api' | 'mock', fallbackDetail?: string }} InterviewV2Result
 */

/**
 * @template T
 * @param {() => Promise<T>} apiCall
 * @param {() => T | Promise<T>} mockCall
 * @param {string} label
 * @returns {Promise<InterviewV2Result<T>>}
 */
async function withInterviewV2Fallback(apiCall, mockCall, label) {
  if (isForceInterviewMock()) {
    return {
      data: await mockCall(),
      dataSource: 'mock',
      fallbackDetail: 'Modo demo — el entrevistador es simulado',
    }
  }
  try {
    return { data: await apiCall(), dataSource: 'api' }
  } catch (err) {
    if (!isBackendUnreachable(err)) throw err
    logFallback(label, err)
    return {
      data: await mockCall(),
      dataSource: 'mock',
      fallbackDetail: extractApiErrorMessage(err, 'Usando entrevistador simulado'),
    }
  }
}

/**
 * @param {string} sessionId
 * @param {string | null} targetSkill
 * @param {string | null} targetRole
 */
export async function startInterviewV2(sessionId, targetSkill, targetRole) {
  return withInterviewV2Fallback(
    async () => {
      const { data } = await api.post('/interview/v2/start', {
        session_id: sessionId,
        target_skill: targetSkill,
        target_role: targetRole,
      })
      return data
    },
    () => startMockInterviewV2(sessionId, targetSkill, targetRole),
    'startInterviewV2',
  )
}

/** @param {string} interviewId @param {string} message */
export async function sendInterviewTurn(interviewId, message) {
  return withInterviewV2Fallback(
    async () => {
      const { data } = await api.post(`/interview/v2/${interviewId}/turn`, { message })
      return data
    },
    () => {
      const result = sendMockTurn(interviewId, message)
      if (!result) throw new Error('Entrevista no encontrada')
      return result
    },
    'sendInterviewTurn',
  )
}

/** @param {string} interviewId */
export async function abortInterview(interviewId) {
  return withInterviewV2Fallback(
    async () => {
      const { data } = await api.post(`/interview/v2/${interviewId}/abort`)
      return data
    },
    () => {
      const result = abortMockInterviewV2(interviewId)
      if (!result) throw new Error('Entrevista no encontrada')
      return result
    },
    'abortInterview',
  )
}

/** @param {string} interviewId */
export async function fetchInterviewState(interviewId) {
  return withInterviewV2Fallback(
    async () => {
      const { data } = await api.get(`/interview/v2/${interviewId}`)
      return data
    },
    () => {
      const state = fetchMockInterviewStateV2(interviewId)
      if (!state) throw new Error('Entrevista no encontrada')
      return state
    },
    'fetchInterviewState',
  )
}

/** @param {string} sessionId */
export async function fetchInterviewV2History(sessionId) {
  return withInterviewV2Fallback(
    async () => {
      const { data } = await api.get(`/interview/v2/history/${sessionId}`)
      return Array.isArray(data) ? data : []
    },
    () => getMockInterviewV2History(sessionId),
    'fetchInterviewV2History',
  )
}
