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
export const MOCK_QUESTIONS = {
  React: [
    '¿Cuál es la diferencia entre useEffect y useLayoutEffect? Explica un caso de uso concreto para cada uno.',
    'Explica el concepto de "lifting state up". ¿Cuándo preferirías usar Context API o Zustand en lugar de elevar estado?',
    '¿Qué son los React Hooks? Nombra las 3 reglas principales que debes seguir al usarlos y por qué existen.',
    '¿Cómo detectarías y solucionarías re-renders innecesarios en un componente? Menciona al menos 3 técnicas.',
    'Describe el ciclo de vida de un componente funcional con Hooks: montaje, actualización y desmontaje.',
  ],
  Python: [
    'Explica la diferencia entre listas, tuplas, sets y diccionarios. ¿Cuándo usarías cada estructura y por qué?',
    '¿Qué son los decoradores en Python? Escribe mentalmente un decorador que mida el tiempo de ejecución de una función.',
    'Describe cómo manejarías excepciones. ¿Cuál es la diferencia entre except Exception y except BaseException? ¿Cuándo usar finally?',
    '¿Cómo funciona la gestión de memoria en Python? Explica el garbage collector, reference counting y el GIL.',
    '¿Qué es una list comprehension? ¿Cuándo la usarías vs un bucle for? ¿Qué es una generator expression y cuándo es más eficiente?',
  ],
  SQL: [
    '¿Cuál es la diferencia entre INNER JOIN, LEFT JOIN, RIGHT JOIN y FULL OUTER JOIN? Da un ejemplo real para cada uno.',
    'Explica los índices en bases de datos. ¿Cuándo mejoran el rendimiento y cuándo lo perjudican? ¿Qué es un índice compuesto?',
    '¿Qué son las window functions como ROW_NUMBER, RANK, DENSE_RANK y LAG/LEAD? Describe un caso de uso real.',
    'Escribe mentalmente una consulta para encontrar el segundo salario más alto en una tabla "empleados" (id, nombre, salario). Explica tu enfoque.',
    '¿Cuál es la diferencia entre WHERE y HAVING? ¿En qué orden se ejecutan las cláusulas SQL?',
  ],
  Excel: [
    '¿Cómo usarías VLOOKUP o INDEX/MATCH para cruzar datos entre dos tablas? ¿Por qué muchos prefieren INDEX/MATCH?',
    'Explica la diferencia entre referencia absoluta ($A$1), relativa (A1) y mixta ($A1 o A$1). ¿Cuándo necesitas cada tipo?',
    '¿Qué son las tablas dinámicas? Describe cómo analizarías ventas por región y mes. ¿Qué campos pondrías en filas, columnas y valores?',
    'Describe cómo usarías SUMIF, COUNTIF, AVERAGEIF y sus variantes con múltiples criterios. Da un ejemplo.',
    '¿Cómo protegerías datos sensibles en Excel? Menciona opciones de seguridad, validación de datos y auditoría de fórmulas.',
  ],
  'Power BI': [
    '¿Cuál es la diferencia entre medidas (measures) y columnas calculadas en DAX? ¿Cómo afectan el rendimiento?',
    'Explica el modelo estrella (star schema) y por qué es importante. ¿Cuál es la diferencia con un snowflake schema?',
    '¿Cómo usarías la función CALCULATE de DAX? Explica el contexto de filtro y cómo CALCULATE lo modifica.',
    'Describe el proceso de transformación de datos en Power Query. ¿Qué pasos realizarías al importar Excel con formato inconsistente?',
    '¿Cómo crearías un reporte con múltiples páginas que compartan filtros? Explica segmentadores sincronizados vs filtros de informe.',
  ],
}

export const MOCK_INTERVIEW_RESULT = {
  score: 74,
  nivel: 'Intermedio',
  skill: 'React',
  weakSkills: ['Estado Global', 'Performance', 'Testing'],
  feedback: [
    {
      pregunta: MOCK_QUESTIONS.React[0],
      score: 80,
      texto: 'Buena explicación de los conceptos básicos. Podrías profundizar en casos de uso de useLayoutEffect al medir el DOM antes de que el usuario vea el render, para evitar parpadeos visuales.',
    },
    {
      pregunta: MOCK_QUESTIONS.React[1],
      score: 72,
      texto: 'Comprendes bien el lifting state. Sin embargo, la comparación con Context API podría ser más precisa. Recuerda que Context tiene trade-offs de rendimiento y no siempre reemplaza el lifting.',
    },
    {
      pregunta: MOCK_QUESTIONS.React[2],
      score: 85,
      texto: 'Excelente conocimiento de las reglas de los Hooks. Mencionaste correctamente que no deben usarse en condicionales o bucles. Buen detalle sobre el eslint-plugin-react-hooks.',
    },
    {
      pregunta: MOCK_QUESTIONS.React[3],
      score: 60,
      texto: 'Conoces React.memo y useMemo, pero la respuesta carece de profundidad. Faltó mencionar useCallback, el React Profiler, la virtualización de listas y el impacto de closures en las dependencias.',
    },
    {
      pregunta: MOCK_QUESTIONS.React[4],
      score: 73,
      texto: 'Buen entendimiento general. Profundiza en el cleanup de effects para evitar memory leaks y en cómo las dependencias del array de useEffect determinan cuándo se re-ejecuta el efecto.',
    },
  ],
}

export const MOCK_HISTORY = [
  { id: 'h1', skill: 'React', score: 82, fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'h2', skill: 'SQL', score: 65, fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'h3', skill: 'Python', score: 71, fecha: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'h4', skill: 'Excel', score: 58, fecha: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
]
