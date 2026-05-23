# Plan 2 en frontend, ubicaciones DANE y termómetro en UI

- **Fecha:** 2026-05-23
- **Área:** frontend
- **Estado:** activa
- **Autor/es:** Equipo frontend (Migue / Joufra)

## Contexto

El backend Plan 2 expone `analyze`, `action-plan`, `radar-data` y `timeline-data`, pero el front seguía usando `GET /plan/{id}` (legacy) y calculaba el radar en cliente. El wizard pedía ciudad/departamento en texto libre. El termómetro de mercado tenía datos en store pero no se mostraba.

## Decisiones

### 1. Integración Plan 2 (`loadResultsBundle`)

Tras `POST /profile`, el front ejecuta:

1. `POST /profile/{session_id}/analyze`
2. `POST /profile/{session_id}/action-plan`
3. En paralelo: jobs, market, radar, timeline

Orquestación en `frontend/src/services/api.js` → `loadResultsBundle()`.  
Normalización del plan en `utils/planDisplay.js` (`normalizeActionPlanOut` — `fase_30` → semanas UI).

Store ampliado: `plan`, `radar`, `timeline` (+ cache en `sessionCache.js`).

### 2. Radar desde API

`RadarMatch.jsx` consume `GET .../radar-data` (5 dimensiones: usuario vs mercado).  
Parser en `utils/radarApi.js`. Vacantes reales arriba del gráfico (score del backend).

### 3. Fallbacks offline personalizados

`services/mockResultsBundle.js` centraliza mocks al perfil:

| Dato | Función mock |
|------|----------------|
| Jobs | `buildMockJobsFromProfile` — ciudad, match skills, score |
| Market | `buildMockMarketFromProfile` — ciudad/sector |
| Plan | `buildMockPlanFromProfile` — nombre, ciudad, skills |
| Radar | `buildMockRadarFromProfile` |
| Timeline | `buildMockTimelineFromProfile` |
| Análisis | `buildMockAnalysisFromProfile` |

`fillResultsFallbacks()` rellena cualquier hueco tras el bundle.

### 4. Ubicaciones Colombia (wizard paso 1)

- Catálogo DANE: **32 departamentos**, **1.119 municipios** en `constants/colombiaLocations.js`.
- Regeneración: `node scripts/build-colombia-locations.mjs` (fuente `colombia-cities` / DIVIPOLA).
- UI: selects en cascada en `StepPersonalInfo.jsx` (departamento → ciudad).
- Bogotá D.C. incluida en Cundinamarca.

### 5. Termómetro visible

`MarketThermometer.jsx` montado en:

- `/resultados` — arriba del plan y oportunidades
- `/vacantes` — debajo del título, antes del semáforo

Datos: store `market` o `getMarketDashboard()` al entrar si faltaba.

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `services/api.js` | Cliente HTTP + `loadResultsBundle` |
| `services/mockResultsBundle.js` | Fallbacks personalizados |
| `constants/colombiaLocations.js` | Deptos/municipios |
| `components/onboarding/StepPersonalInfo.jsx` | Selects ubicación |
| `components/results/MarketThermometer.jsx` | UI termómetro |
| `components/results/RadarMatch.jsx` | Radar Plan 2 |
| `pages/ResultsPage.jsx`, `VacanciesPage.jsx` | Montaje termómetro |

## Pendiente (no bloquea MVP)

- UI timeline (`timeline` ya en store)
- Burbuja coach
- Plan + radar en PDF
- Tabs plan 60/90 días

## Referencias

- [FRONTEND_INTEGRATION.md](../FRONTEND_INTEGRATION.md)
- [2026-05-23-frontend-mock-fallback-api.md](./2026-05-23-frontend-mock-fallback-api.md)
