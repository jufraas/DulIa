# Mock local como fallback de la API

- **Fecha:** 2026-05-23
- **Área:** frontend
- **Estado:** activa
- **Autor/es:** Equipo frontend

## Contexto

Backend y frontend avanzan en paralelo. La demo no puede depender de que FastAPI esté listo, ni de CORS configurado, en cada prueba.

## Decisión

Fallbacks en `frontend/src/services/api.js` y módulos auxiliares:

| Función | Fallback | Estado |
|---------|----------|--------|
| `getRecommendedJobs()` | `mockData.js` → `mockJobs` | ✅ |
| `getMarketDashboard()` | `mockData.js` → `mockMarket` | ✅ |
| `parseCvPdf()` | `mockCvPrefill.js` en `api.js` | ✅ |
| `getPlan()` | `mockPlan.js` / `buildMockPlanFromProfile` | ✅ |
| `postCoachChat()` | `mockCoachChat.js` | ✅ |
| `fetchHealth()` | `{ mock: true }` | ✅ |
| `getProfile()` | `null` en 404; cache local vía `sessionHydration.js` | ✅ |
| `createProfile()` | `mockProfileFromPayload.js` desde el payload del wizard | ✅ |

## Por qué

- Demo funcional en pitch aunque jobs/market o parse-cv fallen.
- Frontend puede desarrollar resultados y PDF sin bloquearse.
- El shape de los mocks documenta el contrato en [`../ENDPOINTS.md`](../ENDPOINTS.md).

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Hardcodear respuesta en el componente | Duplicación; difícil de mantener |
| Bloquear UI si no hay backend | Rompe demo del hackathon |
| MSW / json-server | Más setup del necesario en 48 h |

## Consecuencias

- Wizard completa aunque `POST /profile` falle; perfil mock se persiste en `dulia_session_data`.
- Pendiente eliminado: mock de `createProfile` en `mockProfileFromPayload.js`.
