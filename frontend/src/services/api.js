import axios from 'axios'
import { mockJobs, mockMarket } from './mockData'
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
    if (axios.isAxiosError(err) && err.response?.data?.detail) {
      throw new Error(String(err.response.data.detail))
    }
    throw new Error('No pudimos guardar tu perfil. Intenta de nuevo.')
  }
}

/**
 * @param {string} [sessionId]
 * @returns {Promise<import('../store/useProfileStore').SavedProfile>}
 */
export async function getProfile(sessionId = getOrCreateSessionId()) {
  const { data } = await api.get(`/profile/${sessionId}`)
  return data
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
