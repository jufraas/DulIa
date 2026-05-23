import axios from 'axios'
import { mockResponse } from '../Mock_Response.js'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL,
  timeout: 15000,
})

/**
 * @param {import('../store/useProfileStore').ProfileForm} profile
 * @param {File | null} [cvFile]
 * @returns {Promise<import('../store/useProfileStore').AnalysisResult>}
 */
export async function submitProfile(profile, cvFile = null) {
  try {
    if (cvFile) {
      const formData = new FormData()
      formData.append('profile', JSON.stringify(profile))
      formData.append('cv', cvFile, cvFile.name)

      const { data } = await api.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    }

    const { data } = await api.post('/profile', profile, {
      headers: { 'Content-Type': 'application/json' },
    })
    return data
  } catch {
    await new Promise((r) => setTimeout(r, 1200))
    return {
      ...mockResponse,
      cv_parsed: Boolean(cvFile),
    }
  }
}

export default api
