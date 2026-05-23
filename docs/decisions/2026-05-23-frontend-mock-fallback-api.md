# Mock local como fallback de la API

- **Fecha:** 2026-05-23
- **Área:** frontend
- **Estado:** activa
- **Autor/es:** Equipo frontend

## Contexto

Backend y frontend avanzan en paralelo. La demo no puede depender de que FastAPI/Supabase estén listos en cada prueba.

## Decisión

Fallbacks en `frontend/src/services/api.js` y módulos auxiliares. Desde 2026-05-23, los datos de resultados se centralizan en **`mockResultsBundle.js`**, que personaliza mocks con el perfil del usuario (ciudad, skills, score).

| Función | Fallback | Estado |
|---------|----------|--------|
| `createProfile()` | `mockProfileFromPayload.js` | ✅ |
| `getProfile()` | `null` + cache `sessionHydration.js` | ✅ |
| `parseCvPdf()` | `mockCvPrefill.js` | ✅ |
| `postCoachChat()` | `mockCoachChat.js` | ✅ |
| `postProfileAnalyze()` | `buildMockAnalysisFromProfile` | ✅ |
| `postActionPlan()` | `buildMockPlanFromProfile` | ✅ |
| `getRecommendedJobs()` | `buildMockJobsFromProfile` | ✅ |
| `getMarketDashboard()` | `buildMockMarketFromProfile` | ✅ |
| `getRadarData()` | `buildMockRadarFromProfile` | ✅ |
| `getTimelineData()` | `buildMockTimelineFromProfile` | ✅ |
| `loadResultsBundle()` | `fillResultsFallbacks()` — rellena huecos | ✅ |
| `fetchHealth()` | `{ mock: true }` | ✅ |

## Por qué

- Demo funcional en pitch aunque BD o API fallen.
- Mocks alineados al perfil real del wizard (no datos genéricos fijos).
- Un solo punto (`fillResultsFallbacks`) garantiza bundle completo.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Hardcodear respuesta en el componente | Duplicación; difícil de mantener |
| Bloquear UI si no hay backend | Rompe demo del hackathon |
| MSW / json-server | Más setup del necesario en 48 h |

## Consecuencias

- Wizard completa aunque `POST /profile` falle; perfil mock en `dulia_session_data`.
- Resultados siempre muestran plan, radar, termómetro y vacantes (API o mock).
- Ver también: [2026-05-23-frontend-plan2-locations-thermometer.md](./2026-05-23-frontend-plan2-locations-thermometer.md).
