/** @typedef {Object} InterviewQuestion
 * @property {number} index
 * @property {string} text
 * @property {number} total
 */

/**
 * @typedef {Object} InterviewFeedbackItem
 * @property {number} question_index
 * @property {string} question
 * @property {string} answer
 * @property {string} feedback
 * @property {number} score
 */

/**
 * @typedef {Object} ActiveInterviewSession
 * @property {string} id
 * @property {string} session_id
 * @property {string} skill
 * @property {string | null} role
 * @property {InterviewQuestion} current_question
 * @property {number} answers_count
 * @property {'active' | 'finished'} status
 */

/**
 * @typedef {Object} InterviewResult
 * @property {string} id
 * @property {string} skill
 * @property {number} score
 * @property {InterviewFeedbackItem[]} feedback
 * @property {string[]} weak_skills
 * @property {string} finished_at
 */

/**
 * @typedef {Object} InterviewHistoryItem
 * @property {string} id
 * @property {string} skill
 * @property {number} score
 * @property {string} finished_at
 * @property {string | null} role
 */

const MOCK_QUESTIONS = [
  'Cuéntame sobre un proyecto reciente donde usaste {skill}. ¿Qué problema resolviste?',
  '¿Cómo explicarías {skill} a alguien que no es técnico?',
  'Describe una situación difícil trabajando en equipo relacionada con {skill}.',
  '¿Qué herramientas o recursos usas para mantenerte al día en {skill}?',
  'Si tuvieras una semana para mejorar en {skill}, ¿qué harías primero?',
]

/** @type {Map<string, ActiveInterviewSession & { answers: string[] }>} */
const activeSessions = new Map()

/** @type {Map<string, InterviewHistoryItem[]>} */
const historyByUser = new Map()

let sessionCounter = 1

/**
 * @param {string} skill
 * @param {number} index
 */
function questionText(skill, index) {
  const template = MOCK_QUESTIONS[index] ?? MOCK_QUESTIONS[0]
  return template.replace(/\{skill\}/g, skill)
}

/**
 * @param {string} sessionId
 * @param {string} skill
 * @param {string | null} [role]
 */
export function startMockInterview(sessionId, skill, role = null) {
  const id = `mock-interview-${sessionCounter++}`
  const session = {
    id,
    session_id: sessionId,
    skill,
    role: role ?? null,
    current_question: {
      index: 1,
      text: questionText(skill, 0),
      total: MOCK_QUESTIONS.length,
    },
    answers_count: 0,
    status: /** @type {'active'} */ ('active'),
    answers: [],
  }
  activeSessions.set(id, session)
  return structuredClone(session)
}

/**
 * @param {string} interviewId
 * @param {string} answer
 */
export function submitMockAnswer(interviewId, answer) {
  const session = activeSessions.get(interviewId)
  if (!session || session.status !== 'active') return null

  session.answers.push(answer.trim())
  session.answers_count = session.answers.length

  if (session.answers_count >= MOCK_QUESTIONS.length) {
    return structuredClone(session)
  }

  session.current_question = {
    index: session.answers_count + 1,
    text: questionText(session.skill, session.answers_count),
    total: MOCK_QUESTIONS.length,
  }
  activeSessions.set(interviewId, session)
  return structuredClone(session)
}

/**
 * @param {string} interviewId
 * @param {string} [userId]
 */
export function finishMockInterview(interviewId, userId = 'demo-user') {
  const session = activeSessions.get(interviewId)
  if (!session) return null

  /** @type {InterviewFeedbackItem[]} */
  const feedback = session.answers.map((answer, index) => ({
    question_index: index + 1,
    question: questionText(session.skill, index),
    answer,
    feedback:
      answer.length >= 80
        ? 'Buena estructura. Podrías añadir una métrica concreta del impacto.'
        : 'Respuesta breve. Amplía con un ejemplo real y un resultado medible.',
    score: answer.length >= 80 ? 78 + (index % 3) * 4 : 52 + (index % 4) * 5,
  }))

  const score =
    feedback.length > 0
      ? Math.round(feedback.reduce((sum, item) => sum + item.score, 0) / feedback.length)
      : 60

  const weak_skills =
    score >= 75
      ? []
      : [`${session.skill} — profundizar`, 'Comunicación de impacto']

  const result = {
    id: session.id,
    skill: session.skill,
    score,
    feedback,
    weak_skills,
    finished_at: new Date().toISOString(),
  }

  session.status = 'finished'
  activeSessions.set(interviewId, session)

  const history = historyByUser.get(userId) ?? []
  history.unshift({
    id: session.id,
    skill: session.skill,
    score,
    finished_at: result.finished_at,
    role: session.role,
  })
  historyByUser.set(userId, history.slice(0, 10))

  return result
}

/** @param {string} [userId] */
export function getMockInterviewHistory(userId = 'demo-user') {
  return structuredClone(historyByUser.get(userId) ?? [])
}

export function resetMockInterviewStore() {
  activeSessions.clear()
  historyByUser.clear()
  sessionCounter = 1
}

/**
 * @param {unknown} data
 * @returns {ActiveInterviewSession | null}
 */
export function normalizeInterviewSession(data) {
  if (!data || typeof data !== 'object') return null
  const raw = /** @type {Record<string, unknown>} */ (data)
  const q = raw.current_question
  if (!q || typeof q !== 'object') return null
  const question = /** @type {Record<string, unknown>} */ (q)

  return {
    id: String(raw.id ?? ''),
    session_id: String(raw.session_id ?? ''),
    skill: String(raw.skill ?? ''),
    role: raw.role ? String(raw.role) : null,
    current_question: {
      index: Number(question.index ?? 1),
      text: String(question.text ?? ''),
      total: Number(question.total ?? 5),
    },
    answers_count: Number(raw.answers_count ?? 0),
    status: raw.status === 'finished' ? 'finished' : 'active',
  }
}
