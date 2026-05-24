/**
 * Mini pruebas del foundation de progreso/entrevista (sin Vitest).
 * Ejecutar: node scripts/test-progress-foundation.mjs
 */
import {
  buildMockProgressState,
  initMockProgress,
  buildPhaseProgress,
  buildTaskId,
  findProgressTaskByLabel,
  globalCompletionPct,
  resetMockProgressStore,
  toggleMockTask,
  addMockTasksFromWeakSkills,
  tasksFromPlan,
} from '../src/mocks/mockProgress.js'
import {
  finishMockInterview,
  resetMockInterviewStore,
  startMockInterview,
  submitMockAnswer,
} from '../src/mocks/mockInterview.js'
import { buildMockPlanFromProfile } from '../src/services/mockPlan.js'
import { getTaskScrollTargetId } from '../src/utils/progressScroll.js'
import { extractApiErrorMessage } from '../src/utils/apiErrors.js'
import { computeCurrentDay, resolveNextMilestone } from '../src/utils/progressDay.js'

let passed = 0
let failed = 0

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

resetMockProgressStore()
resetMockInterviewStore()

const profile = {
  id: 'p1',
  session_id: 'sess-test',
  nombre: 'María González',
  ciudad: 'Barranquilla',
  habilidades: ['Canva', 'Excel'],
}

const plan = buildMockPlanFromProfile(profile)

await test('tasksFromPlan genera tareas en fases 30/60/90', () => {
  const tasks = tasksFromPlan(plan)
  assert(tasks.length >= 8, `esperaba >=8 tareas, got ${tasks.length}`)
  assert(tasks.some((t) => t.phase === '30'), 'falta fase 30')
  assert(tasks.some((t) => t.phase === '60'), 'falta fase 60')
  assert(tasks.some((t) => t.phase === '90'), 'falta fase 90')
})

await test('buildTaskId es estable', () => {
  const a = buildTaskId('30', 0, 'Actualiza tu CV')
  const b = buildTaskId('30', 0, 'Actualiza tu CV')
  assert(a === b, 'ids deben coincidir')
})

await test('findProgressTaskByLabel resuelve tarea del plan', () => {
  const tasks = tasksFromPlan(plan)
  const sample = tasks[0]
  assert(sample, 'plan debe tener tareas')
  const found = findProgressTaskByLabel(tasks, sample.phase, sample.label)
  assert(found?.id === sample.id, 'debe resolver por fase + label')
})

await test('mock progress calcula % global y día 1 al iniciar', () => {
  const state = buildMockProgressState('sess-test', plan, profile)
  assert(state.global_pct >= 0 && state.global_pct <= 100, 'pct inválido')
  assert(state.current_day === 1, `día inicial esperado 1, got ${state.current_day}`)
  assert(state.started_at, 'debe guardar started_at')
  assert(state.phases.length === 3, '3 fases')
})

await test('computeCurrentDay avanza por días calendario (tope 90)', () => {
  const start = new Date(2026, 0, 1)
  const nextDay = new Date(2026, 0, 2)
  const farFuture = new Date(2026, 0, 1)
  farFuture.setDate(farFuture.getDate() + 200)

  assert(computeCurrentDay(start, start) === 1, 'mismo día → 1')
  assert(computeCurrentDay(start, nextDay) === 2, 'día siguiente → 2')
  assert(computeCurrentDay(start, farFuture) === 90, 'más de 90 días → tope 90')
})

await test('resolveNextMilestone usa current_day, no valor fijo', () => {
  const milestones = [
    { dia: 7, logro: 'Semana 1' },
    { dia: 30, logro: 'Mes 1' },
  ]
  const next = resolveNextMilestone(milestones, 1)
  assert(next?.dia === 7, 'día 1 → próximo hito día 7')
  assert(resolveNextMilestone(milestones, 7)?.dia === 30, 'día 7 → próximo hito día 30')
  assert(resolveNextMilestone(milestones, 90) === null, 'día 90 → sin hitos futuros')
})

await test('fase 60 bloqueada si fase 30 < 80%', () => {
  const state = buildMockProgressState('sess-lock', plan, profile)
  const p60 = state.phases.find((p) => p.phase === '60')
  assert(p60?.locked === true, 'fase 60 debe estar bloqueada al inicio demo')
})

await test('toggleMockTask actualiza progreso', () => {
  resetMockProgressStore()
  const initial = initMockProgress('sess-toggle', plan, profile)
  const pending = initial.tasks.find((t) => !t.completed && t.phase === '30')
  assert(pending, 'debe haber tarea pendiente fase 30')
  const before = initial.global_pct
  const state = toggleMockTask('sess-toggle', pending.id)
  assert(state !== null, 'toggle debe devolver estado')
  assert(state.global_pct >= before, 'pct global no debe bajar al completar')
})

await test('addMockTasksFromWeakSkills agrega tareas', () => {
  resetMockProgressStore()
  initMockProgress('sess-skills', plan, profile)
  const updated = addMockTasksFromWeakSkills('sess-skills', ['Python'])
  assert(updated !== null, 'debe devolver estado')
  assert(
    updated.tasks.some((t) => t.label.includes('Python')),
    'debe incluir tarea de skill débil',
  )
})

await test('flujo mock interview 5 preguntas', () => {
  resetMockInterviewStore()
  let session = startMockInterview('sess-test', 'Canva', 'Diseñador')
  assert(session.current_question.index === 1, 'primera pregunta')

  for (let i = 0; i < 5; i += 1) {
    session = submitMockAnswer(
      session.id,
      'En mi último proyecto usé Canva para crear contenido visual con resultados medibles en engagement.',
    )
    assert(session !== null, `submit ${i + 1} falló`)
  }

  const result = finishMockInterview(session.id, 'user-test')
  assert(result !== null, 'finish debe devolver resultado')
  assert(typeof result.score === 'number', 'score numérico')
  assert(Array.isArray(result.feedback), 'feedback array')
})

await test('getTaskScrollTargetId resuelve anclas scroll', () => {
  const tasks = tasksFromPlan(plan)
  const t30 = tasks.find((t) => t.phase === '30')
  const t60 = tasks.find((t) => t.phase === '60')
  assert(t30 && t60, 'plan demo debe tener tareas 30 y 60')
  assert(getTaskScrollTargetId(t30) === `timeline-task-${t30.id}`, 'fase 30 → tarea')
  assert(getTaskScrollTargetId(t60) === 'timeline-phase-60', 'fase 60 → bloque fase')
})

await test('phaseCompletionPct y globalCompletionPct', () => {
  const tasks = tasksFromPlan(plan, { precompleteFirst: 0 })
  tasks[0].completed = true
  tasks[1].completed = true
  const pct = globalCompletionPct(tasks)
  assert(pct > 0, 'pct global > 0')
  assert(buildPhaseProgress(tasks).length === 3, 'buildPhaseProgress ok')
})

await test('extractApiErrorMessage — Error y fallback', () => {
  assert(extractApiErrorMessage(new Error('falló red')) === 'falló red', 'usa message')
  assert(extractApiErrorMessage(null, 'fallback') === 'fallback', 'fallback')
})

console.log('')
console.log(`Resultado: ${passed} ok, ${failed} fallos`)
process.exit(failed > 0 ? 1 : 0)
