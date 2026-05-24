/** @typedef {'rapport' | 'tecnica' | 'behavioral' | 'cierre' | 'finalizada'} InterviewStage */

/** @typedef {Object} InterviewPersona
 * @property {string} nombre
 * @property {string} rol_entrevistador
 * @property {string} sector
 * @property {string} estilo
 * @property {string} [saludo_inicial]
 */

/** @typedef {Object} ChatMessage
 * @property {'interviewer' | 'candidate'} role
 * @property {string} text
 * @property {InterviewStage} stage
 * @property {string} t
 */

/** @typedef {Object} StageBreakdown
 * @property {string} stage
 * @property {number} score
 * @property {string[]} strengths
 * @property {string[]} gaps
 * @property {string[]} key_moments
 */

/** @typedef {Object} InterviewSummaryV2
 * @property {number} global_score
 * @property {string[]} weak_skills
 * @property {StageBreakdown[]} stages
 * @property {string} feedback_general
 * @property {string[]} proximos_pasos
 */

export const INTERVIEW_V2_STAGES = ['rapport', 'tecnica', 'behavioral', 'cierre']

export const MOCK_PERSONA = {
  nombre: 'Andrea Restrepo',
  rol_entrevistador: 'Lead frontend',
  sector: 'tecnologia',
  estilo: 'cercana, exigente con ejemplos concretos',
  saludo_inicial:
    'Hola, soy Andrea, lead de frontend en una fintech local. Antes de entrar al detalle técnico, cuéntame: ¿qué te motivó a postular a este rol?',
}

/** @type {Map<string, Record<string, unknown>>} */
const sessions = new Map()

/** @type {Map<string, Array<Record<string, unknown>>>} */
const historyBySession = new Map()

let idCounter = 1

/** @param {InterviewStage} stage */
function nextStage(stage) {
  const idx = INTERVIEW_V2_STAGES.indexOf(stage)
  if (idx < 0 || idx >= INTERVIEW_V2_STAGES.length - 1) return 'finalizada'
  return INTERVIEW_V2_STAGES[idx + 1]
}

/** @param {InterviewStage} stage @param {number} turnsInStage */
function interviewerReply(stage, turnsInStage, skill) {
  const replies = {
    rapport: [
      'Gracias por compartir. ¿Qué proyecto reciente te hizo sentir más orgulloso?',
      'Perfecto, eso me da contexto. Pasemos a la parte técnica.',
    ],
    tecnica: [
      `Interesante. ¿Cómo manejas el estado compartido en ${skill}? Dame un ejemplo concreto.`,
      '¿Qué harías si un componente re-renderiza demasiado? ¿Cómo lo diagnosticarías?',
      'Bien. Profundicemos: ¿cuándo usarías Context API vs un store como Zustand?',
    ],
    behavioral: [
      'Cuéntame una situación difícil en equipo. ¿Qué hiciste tú específicamente?',
      '¿Cómo manejaste el feedback cuando algo no salió como esperabas?',
    ],
    cierre: [
      'Gracias por la conversación. ¿Tienes alguna pregunta para mí sobre el rol o el equipo?',
      'Genial conversar contigo. Te comparto el resumen ahora.',
    ],
  }
  const list = replies[stage] ?? replies.rapport
  return list[Math.min(turnsInStage, list.length - 1)]
}

/** @param {InterviewStage} stage */
function miniScore(stage) {
  const base = { rapport: 78, tecnica: 70, behavioral: 72, cierre: 80 }
  return base[stage] ?? 65
}

/** @param {InterviewStage} stage @param {string[]} keyMoments */
function stageBreakdown(stage, keyMoments) {
  const templates = {
    rapport: {
      strengths: ['claridad al presentarse', 'motivación genuina'],
      gaps: [],
    },
    tecnica: {
      strengths: ['conoce conceptos base', 'da ejemplos concretos'],
      gaps: ['podría profundizar en state management compartido'],
    },
    behavioral: {
      strengths: ['estructura la respuesta', 'menciona aprendizajes'],
      gaps: ['falta cuantificar el impacto (STAR)'],
    },
    cierre: {
      strengths: ['muestra interés genuino'],
      gaps: [],
    },
  }
  const t = templates[stage] ?? templates.rapport
  return {
    stage,
    score: miniScore(stage),
    strengths: t.strengths,
    gaps: t.gaps,
    key_moments: keyMoments.slice(0, 2),
  }
}

/** @param {Record<string, unknown>} session */
function buildSummary(session) {
  const skill = String(session.target_skill ?? 'React')
  const candidateTurns = /** @type {ChatMessage[]} */ (session.turns ?? []).filter(
    (t) => t.role === 'candidate',
  )
  const moments = candidateTurns.map((t) => t.text).filter(Boolean)
  const stageScores = /** @type {Record<string, number>} */ (session.stage_scores ?? {})

  const stages = INTERVIEW_V2_STAGES.map((s) =>
    stageBreakdown(s, moments.filter((_, i) => i % 2 === 0)),
  ).map((item) => ({
    ...item,
    score: stageScores[item.stage] ?? item.score,
  }))

  const global_score = Math.round(
    stages.reduce((sum, s) => sum + s.score, 0) / Math.max(stages.length, 1),
  )

  return {
    global_score,
    weak_skills: global_score >= 75 ? [] : [`${skill} — profundizar`, 'comunicar trade-offs'],
    stages,
    feedback_general: `Mostraste buena base en ${skill} y actitud positiva. Tu próximo salto es reforzar state management compartido y preparar ejemplos STAR con métricas.`,
    proximos_pasos: [
      'Practica un mini-proyecto con Zustand o Context API',
      'Prepara 2 historias STAR para entrevistas behavioral',
      'Explica un concepto técnico a alguien no técnico (método Feynman)',
    ],
  }
}

/** @param {InterviewStage} current @param {string[]} completed */
export function buildStageProgress(current, completed = []) {
  return INTERVIEW_V2_STAGES.map((stage) => {
    if (completed.includes(stage)) return { stage, status: 'done' }
    if (stage === current) return { stage, status: 'doing' }
    return { stage, status: 'pending' }
  })
}

/**
 * @param {string} sessionId
 * @param {string | null} targetSkill
 * @param {string | null} targetRole
 */
export function startMockInterviewV2(sessionId, targetSkill, targetRole) {
  const interviewId = `mock-v2-${idCounter++}`
  const opening = MOCK_PERSONA.saludo_inicial
  const now = new Date().toISOString()
  const openingMsg = {
    role: 'interviewer',
    text: opening,
    stage: 'rapport',
    t: now,
  }

  const session = {
    interview_id: interviewId,
    session_id: sessionId,
    target_skill: targetSkill ?? 'React',
    target_role: targetRole,
    persona: { ...MOCK_PERSONA },
    stage: 'rapport',
    turns: [openingMsg],
    turns_in_stage: 1,
    total_turns: 1,
    stage_scores: {},
    completed_stages: [],
    status: 'in_progress',
    summary: null,
    max_turns: 10,
    opening_message: opening,
  }

  sessions.set(interviewId, session)
  return {
    interview_id: interviewId,
    persona: session.persona,
    opening_message: opening,
    stage: 'rapport',
    max_turns: 10,
  }
}

/**
 * @param {string} interviewId
 * @param {string} message
 */
export function sendMockTurn(interviewId, message) {
  const session = sessions.get(interviewId)
  if (!session) return null
  if (session.status !== 'in_progress') {
    throw new Error('Entrevista ya finalizada')
  }

  const now = new Date().toISOString()
  const stage = /** @type {InterviewStage} */ (session.stage)
  const candidateMsg = {
    role: 'candidate',
    text: message.trim(),
    stage,
    t: now,
  }
  /** @type {ChatMessage[]} */
  const turns = [...(session.turns ?? []), candidateMsg]

  let turnsInStage = Number(session.turns_in_stage ?? 1) + 1
  let totalTurns = Number(session.total_turns ?? 1) + 1
  let currentStage = stage
  /** @type {Record<string, unknown> | null} */
  let stageAdvance = null
  let finished = false
  /** @type {InterviewSummaryV2 | null} */
  let summary = null

  const shouldAdvance =
    (stage === 'rapport' && turnsInStage >= 3) ||
    (stage === 'tecnica' && turnsInStage >= 4) ||
    (stage === 'behavioral' && turnsInStage >= 3) ||
    (stage === 'cierre' && turnsInStage >= 2)

  if (shouldAdvance && stage !== 'cierre') {
    const completed = [...(session.completed_stages ?? []), stage]
    const toStage = nextStage(stage)
    session.stage_scores = { ...(session.stage_scores ?? {}), [stage]: miniScore(stage) }
    stageAdvance = {
      from_stage: stage,
      to_stage: toStage,
      mini_score: miniScore(stage),
      objectives_met: ['objetivo_demo'],
      gaps: [],
    }
    session.completed_stages = completed
    currentStage = toStage === 'finalizada' ? 'cierre' : toStage
    turnsInStage = 1
  }

  if (stage === 'cierre' && turnsInStage >= 2) {
    session.stage_scores = { ...(session.stage_scores ?? {}), cierre: miniScore('cierre') }
    stageAdvance = {
      from_stage: 'cierre',
      to_stage: 'finalizada',
      mini_score: miniScore('cierre'),
      objectives_met: ['cierre_completo'],
      gaps: [],
    }
    currentStage = 'finalizada'
    finished = true
    summary = buildSummary({ ...session, turns })
    session.status = 'completed'
    session.summary = summary

    const hist = historyBySession.get(session.session_id) ?? []
    hist.unshift({
      id: interviewId,
      skill: session.target_skill,
      score: summary.global_score,
      finished_at: now,
      role: session.target_role,
      version: 2,
    })
    historyBySession.set(session.session_id, hist.slice(0, 10))
  }

  const replyText = finished
    ? 'Gracias por conversar conmigo. Aquí tienes tu resumen.'
    : interviewerReply(currentStage === 'finalizada' ? 'cierre' : currentStage, turnsInStage - 1, session.target_skill)

  const replyMsg = {
    role: 'interviewer',
    text: replyText,
    stage: finished ? 'finalizada' : currentStage,
    t: new Date().toISOString(),
  }

  session.stage = finished ? 'finalizada' : currentStage
  session.turns = [...turns, replyMsg]
  session.turns_in_stage = turnsInStage
  session.total_turns = totalTurns + 1
  sessions.set(interviewId, session)

  return {
    reply: replyText,
    stage: session.stage,
    stage_advance: stageAdvance,
    turns_in_stage: turnsInStage,
    total_turns: session.total_turns,
    finished,
    summary,
  }
}

/** @param {string} interviewId */
export function abortMockInterviewV2(interviewId) {
  const session = sessions.get(interviewId)
  if (!session) return null
  session.status = 'aborted'
  sessions.set(interviewId, session)
  return { aborted: true, interview_id: interviewId }
}

/** @param {string} interviewId */
export function fetchMockInterviewStateV2(interviewId) {
  const session = sessions.get(interviewId)
  if (!session) return null
  return {
    interview_id: interviewId,
    persona: session.persona,
    stage: session.stage,
    turns: session.turns,
    stage_state: { turns_in_stage: session.turns_in_stage },
    summary: session.summary,
    status: session.status,
    target_skill: session.target_skill,
    target_role: session.target_role,
  }
}

/** @param {string} sessionId */
export function getMockInterviewV2History(sessionId) {
  return structuredClone(historyBySession.get(sessionId) ?? [])
}

export function resetMockInterviewV2Store() {
  sessions.clear()
  historyBySession.clear()
  idCounter = 1
}
