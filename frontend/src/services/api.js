import axios from 'axios'
import { mockCoachChatResponse } from './mockCoachChat'
import { MOCK_CV_PREFILL, normalizeCvParseResponse } from './mockCvPrefill'
import {
  buildMockJobsFromProfile,
  buildMockMarketFromProfile,
  buildMockRadarFromProfile,
  buildMockAnalysisFromProfile,
  buildMockTimelineFromProfile,
} from './mockResultsBundle'
import { buildMockPlanFromProfile } from './mockPlan'
import { buildMockProfileFromPayload } from './mockProfileFromPayload'
import { normalizeActionPlanOut } from '../utils/planDisplay'
import { parseRadarApiResponse } from '../utils/radarApi'
import { getOrCreateSessionId } from '../utils/session'
import { extractApiErrorMessage, isBackendUnreachable, isForceProgressMock } from '../utils/apiErrors'
import {
  addMockTasksFromWeakSkills,
  ensureMockProgress,
  getMockProgress,
  initMockProgress,
  normalizeProgressResponse,
  toggleMockTask,
} from '../mocks/mockProgress'
import {
  finishMockInterview,
  getMockInterviewHistory,
  startMockInterview,
  submitMockAnswer,
} from '../mocks/mockInterview'

/** Estado local de entrevistas API (B5) — el backend no devuelve sesión completa en cada answer. */
/** @type {Map<string, { sessionId: string, skill: string, role: string | null, questions: Array<{ texto?: string }>, answersCount: number, feedback: Array<{ question_index: number, question: string, answer: string, feedback: string, score: number }> }>} */
const apiInterviewRuntime = new Map()

/** @param {string} interviewId */
function buildApiInterviewSession(interviewId) {
  const rt = apiInterviewRuntime.get(interviewId)
  if (!rt) return null
  const total = rt.questions.length || 5
  const idx = Math.min(rt.answersCount, total - 1)
  const current = rt.questions[idx]
  return {
    id: interviewId,
    session_id: rt.sessionId,
    skill: rt.skill,
    role: rt.role,
    current_question: {
      index: rt.answersCount + 1,
      text: String(current?.texto ?? current?.text ?? ''),
      total,
    },
    answers_count: rt.answersCount,
    status: rt.answersCount >= total ? /** @type {'finished'} */ ('finished') : /** @type {'active'} */ ('active'),
  }
}

/** @param {unknown} items */
function normalizeInterviewHistoryItems(items) {
  if (!Array.isArray(items)) return []
  return items.map((item) => {
    const row = /** @type {Record<string, unknown>} */ (item)
    return {
      id: String(row.id ?? ''),
      skill: String(row.target_skill ?? row.skill ?? ''),
      score: Number(row.global_score ?? row.score ?? 0),
      finished_at: String(row.completed_at ?? row.created_at ?? row.finished_at ?? ''),
      role: row.target_role != null ? String(row.target_role) : row.role != null ? String(row.role) : null,
    }
  })
}

/** @param {unknown} data @param {string} interviewId */
function normalizeInterviewFinish(data, interviewId) {
  const raw = /** @type {Record<string, unknown>} */ (data ?? {})
  const rt = apiInterviewRuntime.get(interviewId)
  const result = {
    id: String(raw.interview_id ?? interviewId),
    skill: rt?.skill ?? '',
    score: Number(raw.global_score ?? raw.score ?? 0),
    feedback: rt?.feedback ?? [],
    weak_skills: Array.isArray(raw.weak_skills) ? raw.weak_skills.map(String) : [],
    finished_at: new Date().toISOString(),
  }
  apiInterviewRuntime.delete(interviewId)
  return result
}

const baseURL = import.meta.env.VITE_API_URL || '/api'

/** @param {number} ms */
function uploadAbortSignal(ms) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms)
  }
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}

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

/** @template T
 * @typedef {{ data: T, dataSource: 'api' | 'mock', fallbackDetail?: string }} ProgressApiResult
 */

/**
 * @template T
 * @param {() => Promise<T>} apiCall
 * @param {() => T | Promise<T>} mockCall
 * @param {string} label
 * @param {string} [forcedMockReason]
 * @returns {Promise<ProgressApiResult<T>>}
 */
async function withProgressFallback(apiCall, mockCall, label, forcedMockReason) {
  if (isForceProgressMock()) {
    const data = await mockCall()
    return {
      data,
      dataSource: 'mock',
      fallbackDetail: forcedMockReason ?? 'Modo demo forzado (VITE_FORCE_PROGRESS_MOCK)',
    }
  }

  try {
    const data = await apiCall()
    return { data, dataSource: 'api' }
  } catch (err) {
    if (!isBackendUnreachable(err)) throw err
    logOfflineFallback(label, err)
    const data = await mockCall()
    return {
      data,
      dataSource: 'mock',
      fallbackDetail: extractApiErrorMessage(err, 'Usando datos locales'),
    }
  }
}

/**
 * Mock solo si el backend no responde (red). Errores HTTP se propagan.
 * @template T
 * @param {() => Promise<T>} apiCall
 * @param {() => T | Promise<T>} mockCall
 * @param {string} label
 */
async function withOfflineMockFallback(apiCall, mockCall, label) {
  try {
    return await apiCall()
  } catch (err) {
    if (!isBackendUnreachable(err)) throw err
    logOfflineFallback(label, err)
    return mockCall()
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
    if (!isBackendUnreachable(err)) throw err
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
 * @returns {Promise<ReturnType<typeof normalizeCvParseResponse>>}
 */
export async function parseCvPdf(file) {
  const formData = new FormData()
  formData.append('cv', file)

  try {
    // fetch nativo: el browser pone boundary correcto (axios + default JSON rompe uploads)
    const response = await fetch(`${baseURL}/profile/parse-cv`, {
      method: 'POST',
      body: formData,
      signal: uploadAbortSignal(60000),
    })

    const data = await response.json().catch(() => ({}))
    const detail =
      typeof data?.detail === 'string'
        ? data.detail
        : Array.isArray(data?.detail)
          ? data.detail.map((/** @type {{ msg?: string }} */ d) => d.msg).filter(Boolean).join('. ')
          : null

    if (response.status === 400) {
      throw new Error(detail ?? 'Archivo inválido')
    }
    if (response.status === 422) {
      throw new Error(detail ?? 'No pudimos leer el PDF')
    }
    if (response.status === 429) {
      throw new Error('Demasiadas solicitudes a la IA. Espera un minuto e intenta de nuevo.')
    }
    if (!response.ok) {
      throw new Error(detail ?? `Error al subir el CV (${response.status})`)
    }

    const normalized = normalizeCvParseResponse(data)
    if (
      !normalized.parsed &&
      Object.keys(normalized.prefill ?? {}).length === 0
    ) {
      throw new Error(normalized.message ?? 'No detectamos datos en tu CV. Prueba otro PDF.')
    }
    return normalized
  } catch (err) {
    const isTimeout =
      err instanceof Error &&
      (err.name === 'TimeoutError' || err.name === 'AbortError' || err.name === 'AbortSignal')
    if (isTimeout) {
      throw new Error('La lectura del CV tardó demasiado. Intenta de nuevo.', { cause: err })
    }
    if (err instanceof TypeError) {
      throw new Error(
        'No pudimos enviar tu CV al servidor. Verifica que el backend esté en marcha (uvicorn :8000) y recarga la página.',
        { cause: err },
      )
    }
    if (err instanceof Error) {
      throw err
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
/**
 * @param {string} mensaje
 * @param {string} [sessionId]
 * @param {{ role: 'usuario' | 'coach', texto: string }[]} [historial]
 */
export async function postCoachChat(mensaje, sessionId = getOrCreateSessionId(), historial = []) {
  try {
    const { data } = await api.post(
      '/coach/chat',
      {
        session_id: sessionId,
        mensaje,
        historial,
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
  return withOfflineMockFallback(
    async () => {
      const { data } = await api.post(`/profile/${sessionId}/analyze`, {}, { timeout: 120000 })
      return data
    },
    () => buildMockAnalysisFromProfile(profile),
    'postProfileAnalyze',
  )
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
  return withOfflineMockFallback(
    async () => {
      const { data } = await api.post(`/profile/${sessionId}/action-plan`, {}, { timeout: 120000 })
      const normalized = normalizeActionPlanOut(data)
      if (!normalized) throw new Error('Respuesta de action-plan inválida')
      return normalized
    },
    () => buildMockPlanFromProfile(profile),
    'postActionPlan',
  )
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
  return withOfflineMockFallback(
    async () => {
      const { data } = await api.get(`/profile/${sessionId}/radar-data`)
      const parsed = parseRadarApiResponse(data)
      if (!parsed) throw new Error('Respuesta radar inválida')
      return parsed
    },
    () => buildMockRadarFromProfile(profile, jobs),
    'getRadarData',
  )
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
  return withOfflineMockFallback(
    async () => {
      const { data } = await api.get(`/profile/${sessionId}/timeline-data`)
      return data?.timeline ?? data ?? null
    },
    () => buildMockTimelineFromProfile(profile, plan, jobs),
    'getTimelineData',
  )
}

/**
 * Secuencia Plan 2 tras POST /profile. Cada endpoint usa mock solo si el backend no responde.
 * @param {string} sessionId
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 */
export async function loadResultsBundle(sessionId, profile = null) {
  const city = profile?.ciudad

  const analysis = await postProfileAnalyze(sessionId, profile)
  const jobs = await getRecommendedJobs(sessionId, profile)
  const market = await getMarketDashboard(city ? { city } : {}, profile, sessionId)
  const plan = await postActionPlan(sessionId, profile)
  const radar = await getRadarData(sessionId, profile, jobs)
  const timeline = await getTimelineData(sessionId, profile, plan, jobs)

  return { jobs, market, plan, radar, timeline, analysis }
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
  return withOfflineMockFallback(
    async () => {
      const { data } = await api.get(`/jobs/recommended/${sessionId}`)
      return Array.isArray(data) ? data : []
    },
    () => buildMockJobsFromProfile(profile),
    'getRecommendedJobs',
  )
}

/**
 * @param {{ city?: string, sector?: string }} [filters]
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 * @param {string | null} [sessionId]
 * @returns {Promise<import('../store/useProfileStore').MarketDashboard>}
 */
export async function getMarketDashboard(filters = {}, profile = null, sessionId = null) {
  return withOfflineMockFallback(
    async () => {
      if (sessionId) {
        const { data } = await api.get(`/market/dashboard/${sessionId}`)
        return data
      }
      const { data } = await api.get('/market/dashboard', { params: filters })
      return data
    },
    () => buildMockMarketFromProfile({ ...profile, ciudad: filters.city ?? profile?.ciudad }),
    'getMarketDashboard',
  )
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

/**
 * @param {string} userId
 * @returns {Promise<{ has_profile: boolean, session_id?: string | null }>}
 */
export async function hasProfile(userId) {
  try {
    const { data } = await api.get('/user/has-profile', { params: { user_id: userId } })
    return {
      has_profile: Boolean(data?.has_profile),
      session_id: data?.session_id ?? null,
    }
  } catch (err) {
    if (!isBackendUnreachable(err)) throw err
    logOfflineFallback('hasProfile', err)
    return { has_profile: false, session_id: null }
  }
}

/**
 * @param {string} [sessionId]
 * @param {import('../store/useProfileStore').ActionPlan | null} [plan]
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 * @returns {Promise<ProgressApiResult<import('../mocks/mockProgress').ProgressState>>}
 */
export async function getProgress(
  sessionId = getOrCreateSessionId(),
  plan = null,
  profile = null,
) {
  if (isForceProgressMock()) {
    const data = getMockProgress(sessionId, plan, profile)
    return {
      data,
      dataSource: 'mock',
      fallbackDetail: 'Modo demo forzado (VITE_FORCE_PROGRESS_MOCK)',
    }
  }

  try {
    const { data } = await api.get(`/progress/${sessionId}`)
    const normalized = normalizeProgressResponse(data)
    if (!normalized) throw new Error('Respuesta de progreso inválida')
    return { data: normalized, dataSource: 'api' }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return { data: null, dataSource: 'api' }
    }
    if (!isBackendUnreachable(err)) throw err
    logOfflineFallback('getProgress', err)
    return {
      data: getMockProgress(sessionId, plan, profile),
      dataSource: 'mock',
      fallbackDetail: extractApiErrorMessage(err, 'Usando datos locales'),
    }
  }
}

/**
 * @param {string} taskId
 * @param {boolean} [completed]
 * @param {string} [sessionId]
 * @param {import('../store/useProfileStore').ActionPlan | null} [plan]
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 * @returns {Promise<ProgressApiResult<import('../mocks/mockProgress').ProgressState>>}
 */
export async function toggleTask(
  taskId,
  completed,
  sessionId = getOrCreateSessionId(),
  plan = null,
  profile = null,
) {
  return withProgressFallback(
    async () => {
      const { data } = await api.patch('/progress/task', {
        session_id: sessionId,
        task_id: taskId,
        completed,
      })
      const normalized = normalizeProgressResponse(data)
      if (!normalized) throw new Error('Respuesta toggle inválida')
      return normalized
    },
    () => {
      ensureMockProgress(sessionId, plan, profile)
      const updated = toggleMockTask(sessionId, taskId, completed)
      if (!updated) throw new Error('Tarea no encontrada')
      return updated
    },
    'toggleTask',
  )
}

/**
 * @param {string} [sessionId]
 * @param {import('../store/useProfileStore').ActionPlan | null} [plan]
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 * @returns {Promise<ProgressApiResult<import('../mocks/mockProgress').ProgressState>>}
 */
export async function initProgress(
  sessionId = getOrCreateSessionId(),
  plan = null,
  profile = null,
) {
  return withProgressFallback(
    async () => {
      const { data } = await api.post('/progress/init', { session_id: sessionId })
      const normalized = normalizeProgressResponse(data)
      if (!normalized) throw new Error('Respuesta init progreso inválida')
      return normalized
    },
    () => initMockProgress(sessionId, plan, profile),
    'initProgress',
  )
}

/**
 * @param {string} skill
 * @param {string | null} [role]
 * @param {string} [sessionId]
 * @returns {Promise<ProgressApiResult<import('../mocks/mockInterview').ActiveInterviewSession>>}
 */
export async function startInterview(skill, role = null, sessionId = getOrCreateSessionId()) {
  return withProgressFallback(
    async () => {
      const { data } = await api.post('/interview/start', {
        session_id: sessionId,
        target_skill: skill,
        target_role: role,
      })
      const raw = /** @type {Record<string, unknown>} */ (data ?? {})
      const interviewId = String(raw.interview_id ?? raw.id ?? '')
      const questions = Array.isArray(raw.questions) ? raw.questions : []
      if (!interviewId || questions.length === 0) {
        throw new Error('Respuesta entrevista inválida')
      }
      apiInterviewRuntime.set(interviewId, {
        sessionId,
        skill,
        role: role ?? null,
        questions,
        answersCount: 0,
        feedback: [],
      })
      const normalized = buildApiInterviewSession(interviewId)
      if (!normalized) throw new Error('Respuesta entrevista inválida')
      const questionTexts = questions.map((q) =>
        String(/** @type {{ texto?: string, text?: string }} */ (q).texto ?? q.text ?? ''),
      )
      return { ...normalized, question_texts: questionTexts }
    },
    () => startMockInterview(sessionId, skill, role),
    'startInterview',
  )
}

/**
 * @param {string} interviewId
 * @param {string} answer
 * @returns {Promise<ProgressApiResult<import('../mocks/mockInterview').ActiveInterviewSession>>}
 */
export async function submitAnswer(interviewId, answer) {
  return withProgressFallback(
    async () => {
      const rt = apiInterviewRuntime.get(interviewId)
      if (!rt) throw new Error('Sesión de entrevista no encontrada')
      const question_idx = rt.answersCount
      const { data } = await api.post(`/interview/${interviewId}/answer`, {
        question_idx,
        answer,
      })
      const evalRow = /** @type {Record<string, unknown>} */ (data ?? {})
      const questionText = String(rt.questions[question_idx]?.texto ?? rt.questions[question_idx]?.text ?? '')
      rt.feedback.push({
        question_index: question_idx + 1,
        question: questionText,
        answer,
        feedback: String(evalRow.feedback ?? ''),
        score: Number(evalRow.score ?? 0),
      })
      rt.answersCount += 1
      const normalized = buildApiInterviewSession(interviewId)
      if (!normalized) throw new Error('Respuesta parcial inválida')
      return normalized
    },
    () => {
      const updated = submitMockAnswer(interviewId, answer)
      if (!updated) throw new Error('Sesión de entrevista no encontrada')
      return updated
    },
    'submitAnswer',
  )
}

/**
 * @param {string} interviewId
 * @param {string} [userId]
 * @returns {Promise<ProgressApiResult<import('../mocks/mockInterview').InterviewResult>>}
 */
export async function finishInterview(interviewId, userId = 'demo-user') {
  return withProgressFallback(
    async () => {
      const { data } = await api.post(`/interview/${interviewId}/finish`)
      return normalizeInterviewFinish(data, interviewId)
    },
    () => {
      const result = finishMockInterview(interviewId, userId)
      if (!result) throw new Error('No pudimos cerrar la entrevista')
      return result
    },
    'finishInterview',
  )
}

/**
 * @param {string} [sessionId]
 * @returns {Promise<ProgressApiResult<import('../mocks/mockInterview').InterviewHistoryItem[]>>}
 */
export async function interviewHistory(sessionId = getOrCreateSessionId()) {
  return withProgressFallback(
    async () => {
      const { data } = await api.get(`/interview/history/${sessionId}`)
      return normalizeInterviewHistoryItems(data)
    },
    () => getMockInterviewHistory(sessionId),
    'interviewHistory',
  )
}

/**
 * @param {string[]} weakSkills
 * @param {string} [sessionId]
 * @param {import('../store/useProfileStore').ActionPlan | null} [plan]
 * @param {import('../store/useProfileStore').SavedProfile | null} [profile]
 * @returns {Promise<ProgressApiResult<import('../mocks/mockProgress').ProgressState>>}
 */
export async function addTasksFromWeakSkills(
  weakSkills,
  sessionId = getOrCreateSessionId(),
  plan = null,
  profile = null,
) {
  return withProgressFallback(
    async () => {
      const { data } = await api.post('/progress/add-from-skills', {
        session_id: sessionId,
        weak_skills: weakSkills,
      })
      const normalized = normalizeProgressResponse(data)
      if (!normalized) throw new Error('Respuesta add-from-skills inválida')
      return normalized
    },
    () => {
      ensureMockProgress(sessionId, plan, profile)
      const updated = addMockTasksFromWeakSkills(sessionId, weakSkills)
      if (!updated) throw new Error('Progreso no inicializado')
      return updated
    },
    'addTasksFromWeakSkills',
  )
}

export default api
