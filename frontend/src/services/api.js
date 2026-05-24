import axios from 'axios'
import { mockCoachChatResponse } from './mockCoachChat'
import { MOCK_CV_PREFILL, normalizeCvParseResponse } from './mockCvPrefill'
import {
  buildMockJobsFromProfile,
  buildMockMarketFromProfile,
  buildMockRadarFromProfile,
  buildMockAnalysisFromProfile,
  buildMockTimelineFromProfile,
  fillResultsFallbacks,
} from './mockResultsBundle'
import { buildMockPlanFromProfile } from './mockPlan'
import { buildMockProfileFromPayload } from './mockProfileFromPayload'
import { normalizeActionPlanOut } from '../utils/planDisplay'
import { parseRadarApiResponse } from '../utils/radarApi'
import { getOrCreateSessionId } from '../utils/session'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
})

/** @param {unknown} err */
function logOfflineFallback(label, err) {
  if (import.meta.env.DEV) {
    console.warn(`[DulIA] ${label}: usando datos mock locales`, err)
  }
}

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
    const { data } = await api.post('/profile', payload, { timeout: 120000 })
    return data
  } catch (err) {
    logOfflineFallback('createProfile', err)
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
    logOfflineFallback('getProfile', err)
    return null
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
    return normalizeCvParseResponse(data)
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 400) {
      throw new Error(String(err.response.data?.detail ?? 'Archivo inválido'), { cause: err })
    }
    if (axios.isAxiosError(err) && err.response?.status === 422) {
      throw new Error(String(err.response.data?.detail ?? 'No pudimos leer el PDF'), { cause: err })
    }
    logOfflineFallback('parseCvPdf', err)
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
    const { data } = await api.post(
      '/coach/chat',
      {
        session_id: sessionId,
        mensaje,
      },
      { timeout: 60000 },
    )
    return data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      throw new Error('Completa el onboarding antes de usar el coach.', { cause: err })
    }
    if (axios.isAxiosError(err) && err.response?.status === 429) {
      throw new Error('Demasiadas preguntas seguidas. Espera un minuto e intenta de nuevo.', {
        cause: err,
      })
    }
    if (axios.isAxiosError(err) && err.response?.data?.detail) {
      throw new Error(String(err.response.data.detail), { cause: err })
    }
    // Solo mock offline si el backend no responde (red) o está en modo mock explícito
    const unreachable =
      axios.isAxiosError(err) &&
      (!err.response || err.code === 'ECONNABORTED' || err.message.includes('Network Error'))
    if (unreachable) {
      const health = await fetchHealth().catch(() => ({ mock: true }))
      if (health.mock) {
        logOfflineFallback('postCoachChat', err)
        return mockCoachChatResponse(mensaje)
      }
    }
    logOfflineFallback('postCoachChat', err)
    throw err instanceof Error ? err : new Error('No pudimos contactar al coach.')
  }
}

/**
 * @param {string} [sessionId]
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 * @returns {Promise<unknown>}
 */
export async function postProfileAnalyze(
  sessionId = getOrCreateSessionId(),
  profile = null,
) {
  try {
    const { data } = await api.post(`/profile/${sessionId}/analyze`, {}, { timeout: 120000 })
    return data
  } catch (err) {
    logOfflineFallback('postProfileAnalyze', err)
    return buildMockAnalysisFromProfile(profile)
  }
}

/**
 * @param {string} [sessionId]
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 * @returns {Promise<import('../store/useProfileStore').ActionPlan>}
 */
export async function postActionPlan(
  sessionId = getOrCreateSessionId(),
  profile = null,
) {
  try {
    const { data } = await api.post(`/profile/${sessionId}/action-plan`, {}, { timeout: 120000 })
    const normalized = normalizeActionPlanOut(data)
    if (!normalized) throw new Error('Respuesta de action-plan inválida')
    return normalized
  } catch (err) {
    logOfflineFallback('postActionPlan', err)
    return buildMockPlanFromProfile(profile)
  }
}

/**
 * @param {string} [sessionId]
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 * @param {import('../store/useProfileStore').Job[]} [jobs]
 * @returns {Promise<import('../utils/radarApi').RadarChartData>}
 */
export async function getRadarData(
  sessionId = getOrCreateSessionId(),
  profile = null,
  jobs = [],
) {
  try {
    const { data } = await api.get(`/profile/${sessionId}/radar-data`)
    const parsed = parseRadarApiResponse(data)
    if (!parsed) throw new Error('Respuesta radar inválida')
    return parsed
  } catch (err) {
    logOfflineFallback('getRadarData', err)
    return buildMockRadarFromProfile(profile, jobs)
  }
}

/**
 * @param {string} [sessionId]
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 * @param {import('../store/useProfileStore').ActionPlan | null} [plan]
 * @param {import('../store/useProfileStore').Job[]} [jobs]
 * @returns {Promise<unknown>}
 */
export async function getTimelineData(
  sessionId = getOrCreateSessionId(),
  profile = null,
  plan = null,
  jobs = [],
) {
  try {
    const { data } = await api.get(`/profile/${sessionId}/timeline-data`)
    return data?.timeline ?? data ?? null
  } catch (err) {
    logOfflineFallback('getTimelineData', err)
    return buildMockTimelineFromProfile(profile, plan, jobs)
  }
}

/**
 * Secuencia Plan 2 tras POST /profile. Si el backend/BD falla, rellena mocks al perfil.
 * @param {string} sessionId
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 */
export async function loadResultsBundle(sessionId, profile = null) {
  const city = profile?.ciudad

  const analysis = await postProfileAnalyze(sessionId, profile)

  const jobs = await getRecommendedJobs(sessionId, profile)
  const market = await getMarketDashboard(city ? { city } : {}, profile)
  const plan = await postActionPlan(sessionId, profile)
  const radar = await getRadarData(sessionId, profile, jobs)
  const timeline = await getTimelineData(sessionId, profile, plan, jobs)

  if (!profile) {
    return { jobs, market, plan, radar, timeline, analysis }
  }

  return fillResultsFallbacks(
    { jobs, market, plan, radar, timeline, analysis },
    profile,
  )
}

/**
 * @deprecated Usar postActionPlan / loadResultsBundle.
 * @param {string} [sessionId]
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 */
export async function getPlan(
  sessionId = getOrCreateSessionId(),
  profile = null,
) {
  return postActionPlan(sessionId, profile)
}

/**
 * @param {string} [sessionId]
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 * @returns {Promise<import('../store/useProfileStore').Job[]>}
 */
export async function getRecommendedJobs(
  sessionId = getOrCreateSessionId(),
  profile = null,
) {
  try {
    const { data } = await api.get(`/jobs/recommended/${sessionId}`)
    return Array.isArray(data) && data.length ? data : buildMockJobsFromProfile(profile)
  } catch (err) {
    logOfflineFallback('getRecommendedJobs', err)
    return buildMockJobsFromProfile(profile)
  }
}

/**
 * @param {{ city?: string, sector?: string }} [filters]
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 * @returns {Promise<import('../store/useProfileStore').MarketDashboard>}
 */
export async function getMarketDashboard(filters = {}, profile = null) {
  try {
    const { data } = await api.get('/market/dashboard', { params: filters })
    return data
  } catch (err) {
    logOfflineFallback('getMarketDashboard', err)
    return buildMockMarketFromProfile({ ...profile, ciudad: filters.city ?? profile?.ciudad })
  }
}

/**
 * Vincula el perfil coach anónimo (session_id) al usuario autenticado (user_id).
 * @param {string} sessionId
 * @param {string} userId
 * @returns {Promise<{ linked: boolean, profile_id: string, already_linked?: boolean }>}
 */
export async function linkSession(sessionId, userId) {
  const { data } = await api.post('/auth/link-session', {
    session_id: sessionId,
    user_id: userId,
  })
  return data
}

export default api
