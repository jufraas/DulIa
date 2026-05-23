import axios from 'axios'
import { mockResponse } from '../Mock_Response.js'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

/**
 * @param {import('../store/useProfileStore').ProfileForm} profile
 */
export async function submitProfile(profile) {
  try {
    const { data } = await api.post('/profile', profile)
    return data
  } catch {
    await new Promise((r) => setTimeout(r, 1200))
    return mockResponse
  }
}

export default api
