/**
 * Política API-first: mock solo cuando el backend no responde (red).
 * Ejecutar: node scripts/test-api-fallback.mjs
 */
import axios from 'axios'
import { isBackendUnreachable } from '../src/utils/apiErrors.js'
import { normalizeCvParseResponse } from '../src/services/mockCvPrefill.js'
import {
  markSpaNavigationReady,
  resetLandingSplashState,
  shouldShowLandingSplash,
} from '../src/utils/landingSplash.js'

/** Paridad con mockResultsBundle.fillResultsFallbacks — no importar el módulo (cadena mockData). */
function fillResultsFallbacks(partial) {
  return {
    jobs: partial.jobs ?? [],
    market: partial.market ?? null,
    plan: partial.plan ?? null,
    radar: partial.radar ?? null,
    timeline: partial.timeline ?? null,
    analysis: partial.analysis ?? null,
  }
}

let passed = 0
let failed = 0

/** @param {string} name @param {() => void} fn */
function test(name, fn) {
  try {
    fn()
    passed += 1
    console.log(`✓ ${name}`)
  } catch (err) {
    failed += 1
    console.error(`✗ ${name}`)
    console.error(`  ${err instanceof Error ? err.message : err}`)
  }
}

test('isBackendUnreachable — sin respuesta HTTP', () => {
  const err = new axios.AxiosError('Network Error', 'ERR_NETWORK')
  if (!isBackendUnreachable(err)) throw new Error('debe ser unreachable')
})

test('isBackendUnreachable — 500 con respuesta no es offline', () => {
  const err = new axios.AxiosError('Server error', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status: 500,
    data: { detail: 'fail' },
  })
  if (isBackendUnreachable(err)) throw new Error('500 no debe activar mock offline')
})

test('isBackendUnreachable — TypeError de fetch', () => {
  if (!isBackendUnreachable(new TypeError('Failed to fetch'))) {
    throw new Error('TypeError debe ser unreachable')
  }
})

test('fillResultsFallbacks no inventa datos mock en vacíos', () => {
  const out = fillResultsFallbacks({ jobs: [], radar: null })
  if (out.jobs.length !== 0) throw new Error('jobs debe quedar []')
  if (out.radar !== null) throw new Error('radar debe quedar null')
  if (out.plan !== null) throw new Error('plan debe quedar null')
})

test('normalizeCvParseResponse rechaza shape inválido', () => {
  let threw = false
  try {
    normalizeCvParseResponse(null)
  } catch (err) {
    threw = true
    if (!(err instanceof Error)) throw err
  }
  if (!threw) throw new Error('debe lanzar error, no devolver MOCK_CV_PREFILL')
})

test('landing splash — visible en carga inicial del documento', () => {
  resetLandingSplashState()
  if (!shouldShowLandingSplash()) throw new Error('debe mostrar splash antes de markSpaNavigationReady')
})

test('landing splash — omitido tras navegación SPA', () => {
  resetLandingSplashState()
  markSpaNavigationReady()
  if (shouldShowLandingSplash()) throw new Error('no debe mostrar splash en visitas SPA a /')
})

console.log('')
console.log(`Resultado: ${passed} ok, ${failed} fallos`)
process.exit(failed > 0 ? 1 : 0)
