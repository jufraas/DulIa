import axios from 'axios'
import { mockCoachChatResponse } from './mockCoachChat'
import { mockJobs, mockMarket } from './mockData'
import { buildMockPlanFromProfile, mockPlan } from './mockPlan'
import { buildMockProfileFromPayload } from './mockProfileFromPayload'
import { MOCK_CV_PREFILL } from './mockCvPrefill'
import { normalizePlanOut } from '../utils/planDisplay'
import { getOrCreateSessionId } from '../utils/session'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/** @returns {Promise<{ mock: boolean }>} */
export async function fetchHealth() {
  try {
    const { data } = await api.get('/health')
    return { mock: data.mock_data === 'true' || data.mock_data === true }
  } catch {
    return { mock: true }
  }
}

/**
 * @param {import('../utils/buildProfilePayload').ProfileApiPayload} payload
 * @returns {Promise<import('../store/useProfileStore').SavedProfile>}
 */
export async function createProfile(payload) {
  try {
    const { data } = await api.post('/profile', payload)
    return data
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[DulIA] createProfile: usando perfil mock local', err)
    }
    return buildMockProfileFromPayload(payload)
  }
}

/**
 * @param {string} [sessionId]
 * @returns {Promise<import('../store/useProfileStore').SavedProfile | null>}
 */
export async function getProfile(sessionId = getOrCreateSessionId()) {
  try {
    const { data } = await api.get(`/profile/${sessionId}`)
    return data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null
    throw err
  }
}

/**
 * @param {File} file
 * @returns {Promise<import('../services/mockCvPrefill').MOCK_CV_PREFILL extends infer T ? T : never>}
 */
export async function parseCvPdf(file) {
  const formData = new FormData()
  formData.append('cv', file)
  try {
    const { data } = await api.post('/profile/parse-cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    })
    return data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 400) {
      throw new Error(String(err.response.data?.detail ?? 'Archivo inválido'), { cause: err })
    }
    if (axios.isAxiosError(err) && err.response?.status === 422) {
      throw new Error(String(err.response.data?.detail ?? 'No pudimos leer el PDF'), { cause: err })
    }
    if (import.meta.env.DEV) {
      console.warn('[DulIA] parseCvPdf: usando prefill mock local', err)
    }
    return MOCK_CV_PREFILL
  }
}

/**
 * @param {string} mensaje
 * @param {string} [sessionId]
 * @returns {Promise<import('../store/useProfileStore').CoachChatResponse>}
 */
export async function postCoachChat(mensaje, sessionId = getOrCreateSessionId()) {
  try {
    const { data } = await api.post('/coach/chat', {
      session_id: sessionId,
      mensaje,
    })
    return data
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[DulIA] postCoachChat: usando respuesta mock local', err)
    }
    return mockCoachChatResponse(mensaje)
  }
}

/**
 * @param {string} [sessionId]
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 * @returns {Promise<import('../store/useProfileStore').ThirtyDayPlan>}
 */
export async function getPlan(
  sessionId = getOrCreateSessionId(),
  profile = null,
) {
  try {
    const { data } = await api.get(`/plan/${sessionId}`)
    const normalized = normalizePlanOut(data)
    if (normalized) return normalized
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[DulIA] getPlan: usando plan mock local', err)
    }
  }

  return profile ? buildMockPlanFromProfile(profile) : mockPlan
}

/**
 * @param {string} [sessionId]
 * @returns {Promise<import('../store/useProfileStore').Job[]>}
 */
export async function getRecommendedJobs(sessionId = getOrCreateSessionId()) {
  try {
    const { data } = await api.get(`/jobs/recommended/${sessionId}`)
    return Array.isArray(data) ? data : []
  } catch {
    return mockJobs
  }
}

/**
 * @param {{ city?: string, sector?: string }} [filters]
 * @returns {Promise<import('../store/useProfileStore').MarketDashboard>}
 */
export async function getMarketDashboard(filters = {}) {
  try {
    const { data } = await api.get('/market/dashboard', { params: filters })
    return data
  } catch {
    return { ...mockMarket, ciudad_filtro: filters.city ?? mockMarket.ciudad_filtro }
  }
}

export default api
