/**
 * Smoke E2E contra backend local (opcional).
 * Ejecutar con uvicorn en :8000: node scripts/test-progress-api.mjs
 */
const BASE = process.env.PROGRESS_API_URL ?? 'http://127.0.0.1:8000/api'

let passed = 0
let failed = 0
let skipped = 0

/** @param {string} name @param {() => void | Promise<void>} fn */
async function test(name, fn) {
  try {
    await fn()
    passed += 1
    console.log(`✓ ${name}`)
  } catch (err) {
    failed += 1
    console.error(`✗ ${name}`)
    console.error(`  ${err instanceof Error ? err.message : err}`)
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  return { res, data }
}

const health = await request('/health', { method: 'GET' })
if (!health.res.ok) {
  console.log('⊘ Backend no disponible en', BASE, '— omitiendo smoke E2E')
  console.log('  Levanta: cd backend && .\\.venv\\Scripts\\uvicorn.exe main:app --port 8000')
  skipped += 1
  console.log('')
  console.log(`Resultado: ${passed} ok, ${failed} fallos, ${skipped} omitidos`)
  process.exit(0)
}

const sessionId = `smoke-${Date.now()}`

await test('POST /progress/init', async () => {
  const { res, data } = await request('/progress/init', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  })
  assert(res.ok, `status ${res.status}`)
  assert(data?.session_id === sessionId, 'session_id coincide')
  assert(Array.isArray(data?.tasks) && data.tasks.length >= 8, 'tasks >= 8')
})

await test('GET /progress/{session_id}', async () => {
  const { res, data } = await request(`/progress/${sessionId}`)
  assert(res.ok, `status ${res.status}`)
  assert(data?.global_pct >= 0, 'global_pct válido')
})

await test('PATCH /progress/task', async () => {
  const { data: state } = await request(`/progress/${sessionId}`)
  const task = state?.tasks?.find((/** @type {{ completed: boolean }} */ t) => !t.completed)
  assert(task, 'tarea pendiente')
  const { res, data } = await request('/progress/task', {
    method: 'PATCH',
    body: JSON.stringify({
      session_id: sessionId,
      task_id: task.id,
      completed: true,
    }),
  })
  assert(res.ok, `status ${res.status}`)
  const updated = data?.tasks?.find((/** @type {{ id: string }} */ t) => t.id === task.id)
  assert(updated?.completed === true, 'tarea marcada')
})

await test('POST /interview/start + answer + finish', async () => {
  const { res: startRes, data: start } = await request('/interview/start', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, skill: 'Excel', role: 'Analista' }),
  })
  assert(startRes.ok, `start status ${startRes.status}`)
  const id = start?.id
  assert(id, 'interview id')

  const answer =
    'Usé Excel para automatizar reportes semanales con tablas dinámicas y reduje el tiempo de cierre en un 30%.'

  for (let i = 0; i < 5; i += 1) {
    const { res } = await request(`/interview/${id}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    })
    assert(res.ok, `answer ${i + 1} status ${res.status}`)
  }

  const { res: finishRes, data: result } = await request(`/interview/${id}/finish`, {
    method: 'POST',
    body: JSON.stringify({ user_id: 'smoke-user' }),
  })
  assert(finishRes.ok, `finish status ${finishRes.status}`)
  assert(typeof result?.score === 'number', 'score numérico')
})

await test('GET /user/has-profile', async () => {
  const { res, data } = await request('/user/has-profile?user_id=smoke-user')
  assert(res.ok, `status ${res.status}`)
  assert(typeof data?.has_profile === 'boolean', 'has_profile boolean')
})

await test('PATCH /progress/task 404 tarea inexistente', async () => {
  const { res } = await request('/progress/task', {
    method: 'PATCH',
    body: JSON.stringify({
      session_id: sessionId,
      task_id: 'no-existe',
      completed: true,
    }),
  })
  assert(res.status === 404, `esperaba 404, got ${res.status}`)
})

console.log('')
console.log(`Resultado: ${passed} ok, ${failed} fallos, ${skipped} omitidos`)
process.exit(failed > 0 ? 1 : 0)
