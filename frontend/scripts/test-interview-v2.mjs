/**
 * Pruebas entrevista V2 conversacional (mock, sin Vitest).
 * Ejecutar: node scripts/test-interview-v2.mjs
 */
import {
  buildStageProgress,
  resetMockInterviewV2Store,
  sendMockTurn,
  startMockInterviewV2,
  abortMockInterviewV2,
  fetchMockInterviewStateV2,
} from '../src/mocks/mockInterviewV2.js'
import { mapSummaryToDisplay, stageLabel } from '../src/utils/interviewV2Display.js'

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

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

const USER_MSG =
  'Llevo seis meses con proyectos personales en React y quiero entrar a la industria con bases sólidas.'

await test('startMockInterviewV2 devuelve persona y opening', () => {
  resetMockInterviewV2Store()
  const start = startMockInterviewV2('session-test', 'React', 'Frontend Jr')
  assert(start.interview_id, 'interview_id requerido')
  assert(start.persona?.nombre, 'persona requerida')
  assert(start.opening_message?.length > 20, 'opening_message')
  assert(start.stage === 'rapport', 'stage inicial rapport')
})

await test('buildStageProgress marca doing/pending/done', () => {
  const steps = buildStageProgress('tecnica', ['rapport'])
  assert(steps.find((s) => s.stage === 'rapport')?.status === 'done', 'rapport done')
  assert(steps.find((s) => s.stage === 'tecnica')?.status === 'doing', 'tecnica doing')
  assert(steps.find((s) => s.stage === 'behavioral')?.status === 'pending', 'behavioral pending')
})

await test('flujo mock 8 turnos finaliza con summary', async () => {
  resetMockInterviewV2Store()
  const start = startMockInterviewV2('session-flow', 'React', null)
  let finished = false
  /** @type {import('../src/mocks/mockInterviewV2.js').InterviewSummaryV2 | null} */
  let summary = null

  for (let i = 0; i < 10 && !finished; i += 1) {
    const turn = sendMockTurn(start.interview_id, `${USER_MSG} Turno ${i + 1}.`)
    assert(turn?.reply, `reply turno ${i + 1}`)
    if (turn.finished) {
      finished = true
      summary = turn.summary
    }
  }

  assert(finished, 'debe finalizar en <= 10 turnos')
  assert(summary && summary.global_score >= 0 && summary.global_score <= 100, 'global_score')
  assert(summary.stages?.length === 4, '4 etapas en summary')
  const display = mapSummaryToDisplay(summary, 'React')
  assert(display.proximosPasos.length >= 2, 'proximos pasos')
})

await test('stageLabel traduce etapas', () => {
  assert(stageLabel('rapport') === 'Rapport')
  assert(stageLabel('tecnica') === 'Técnica')
})

await test('abortMockInterviewV2 marca aborted', () => {
  resetMockInterviewV2Store()
  const start = startMockInterviewV2('session-abort', 'Python', null)
  const res = abortMockInterviewV2(start.interview_id)
  assert(res?.aborted === true, 'aborted')
  const state = fetchMockInterviewStateV2(start.interview_id)
  assert(state?.status === 'aborted', 'status aborted')
})

console.log(`\nResultado: ${passed} ok, ${failed} fallos`)
process.exit(failed > 0 ? 1 : 0)
