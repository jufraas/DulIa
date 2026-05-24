# Plan 2 — UI completa en frontend (Sprints 1–3)

**Fecha:** 2026-05-23  
**Área:** frontend  
**Estado:** ✅ Implementado en rama `FRONT`

## Contexto

El backend entregó Plan 2 (`analyze`, `action-plan`, `radar-data`, `timeline-data`, `coach/chat`, `market/dashboard`) pero parte de la respuesta solo se guardaba en store/cache sin renderizarse. El back reportó gaps en UI (analyze, timeline, fases 60/90, chips skills, coach, PDF).

## Decisión

Completar la integración visual en tres sprints sin cambiar contratos API.

### Sprint 1 — Persistencia y análisis visible

- `analysis` en Zustand + `sessionCache` (`setAnalysis`, hooks, hydration).
- `ProfileSummary` + `ScoreCard` consumen `POST .../analyze` vía `analysisDisplay.js`.
- Chips `habilidades_match` / `faltantes` en `VacancyRow` (`/vacantes`).

### Sprint 2 — Coach, timeline y plan 60/90

- `CoachChatBubble` + `useCoachChat` → `postCoachChat()`.
- `CareerTimeline` ← `store.timeline` (días 0/30/60/90).
- `ThirtyDayPlan` con tabs 30 / 60 / 90 + milestones/recursos.

### Sprint 3 — PDF y pulido

- PDF: `generateAnalysisPdf.jsx` + `AnalysisPdfDocument` (React → html2canvas → jsPDF). Reemplaza jsPDF imperativo.
- Layout análisis: `AnalysisOverviewGrid` — contenedor único score+PDF alineado con resumen (580px desktop).
- `OpportunitiesPreview`: copy dinámico desde `market.total_vacantes_activas`.
- Campo `url` en vacantes (preview + panel); mocks con URLs demo.

## Componentes clave

| Dato API | Store | UI |
|----------|-------|-----|
| `POST .../analyze` | `analysis` | `ProfileSummary`, PDF |
| `POST .../action-plan` | `plan` | `ThirtyDayPlan` (tabs) |
| `GET .../timeline-data` | `timeline` | `CareerTimeline` |
| `GET .../radar-data` | `radar` | `RadarMatch`, PDF |
| `GET market/dashboard` | `market` | `MarketThermometer`, preview copy, PDF |
| `POST /coach/chat` | — (ephemeral) | `CoachChatBubble` |

## Pendiente (no bloquea MVP)

- Deploy Vercel + backend prod + prueba E2E `USE_MOCK_DATA=false`.
- Copy hardcode en prototipos huérfanos (`Landing.jsx`, `Wizard.jsx`).
- Login opcional, timeline con progreso del usuario (post-MVP).

## Referencias

- [FRONTEND_INTEGRATION.md](../FRONTEND_INTEGRATION.md)
- [PROJECT_STATE.md](../PROJECT_STATE.md)
