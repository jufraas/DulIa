# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-23 — **Backend Fase 1 Plan 2** (analyze/radar/timeline real) + **Front MVP** Sprints 1–3 (UI Plan 2 + PDF). Pendiente: E2E back real y deploy.

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Ramas FRONT y Backend integradas |
| Backend (FastAPI) | ✅ Fase 1 Plan 2 | Cadena real verificada (migración 004); deploy pendiente |
| Frontend (React+Vite) | ✅ MVP UI | Plan 2 en pantalla; mocks si API falla |
| Pipeline | 🔁 En progreso | Poblar `jobs.city` (muchas filas null) |
| Integración Gemini | ✅ | Profile, analyze, plan, coach, CV parse |
| Base de datos | 🚧 Datos + schema | Tablas Plan 2 + migración 004 aplicada |
| Deploy | 🔲 No iniciado | Backend: Railway/Render + `CORS_ORIGINS`; Front: Vercel |

## Frontend — avance detallado

### Rutas (kit ReBrand)

| Ruta | Pantalla | Dueño | Estado |
|------|----------|-------|--------|
| `/` | Landing (splash + hero + features scroll reveal) | Joufra / Migue | ✅ |
| `/sobre` | Sobre DulIA | Migue | ✅ |
| `/comenzar` | Wizard onboarding (3 pasos + CV) | Compartido | ✅ |
| `/resultados` | Score, perfil, **termómetro**, jobs, plan 30-60-90, **RadarMatch**, timeline, **coach**, PDF completo | Joufra / Migue | ✅ |
| `/vacantes` | **Termómetro** + semáforo; **Volver → `/resultados`** | Joufra | ✅ |

### Piezas transversales (Migue — API / sesión)

| Pieza | Estado | Notas |
|-------|--------|-------|
| Design system (`dulia-tokens.css`, `dulia-kit.css`) | ✅ | Basado en ReBrand |
| Landing — splash + animaciones (Framer Motion) | ✅ | `RevealOnScroll`, `WelcomePage` fases |
| Wizard — ubicación DANE | ✅ | 32 deptos + 1.119 municipios; selects cascada |
| `RadarMatch` en `/resultados` | ✅ | `GET .../radar-data` + fallback `mockResultsBundle` |
| `MarketThermometer` | ✅ | Montado en `/resultados` y `/vacantes` |
| Plan 2 frontend | ✅ | `loadResultsBundle`: analyze → action-plan → jobs/market/radar/timeline |
| Plan 30d — fuente de datos | ✅ | API `action-plan` (fase_30) o mock `buildMockPlanFromProfile` (nombre, ciudad, 1 tarea/ skill) |
| Navegación resultados ↔ vacantes | ✅ | `OpportunitiesPreview` → `/vacantes`; botón **Volver a mi análisis** → `/resultados` |
| Footers — copyright | ✅ | `© {year} DulIA` en `LandingFooter` y `SiteFooter` |
| Integración Axios → API | ✅ | `services/api.js` + `mockResultsBundle.js` |
| `session_id` + rehidratación al refresh | ✅ | `sessionCache.js`, `sessionHydration.js` |
| Borrador wizard al refresh | ✅ | `dulia_wizard_draft` |
| Subida CV PDF | ✅ | `POST /profile/parse-cv` + fallback en `api.js` |
| POST `/profile` + mock fallback | ✅ | `mockProfileFromPayload.js` |
| GET jobs + market + plan + radar en bundle | ✅ | `loadResultsBundle()` tras wizard / rehidratación |
| `analysis` en UI + store | ✅ | Fortalezas, recomendaciones, score `nivel_preparacion` |
| Coach chat UI | ✅ | `CoachChatBubble` en `/resultados` |
| Timeline Plan 2 UI | ✅ | `CareerTimeline` — días 0/30/60/90 |
| Tabs plan 60/90 | ✅ | `ThirtyDayPlan` — pestañas + milestones/recursos |
| Copy vacantes dinámico | ✅ | `OpportunitiesPreview` ← `market.total_vacantes_activas` |
| Links `url` en vacantes | ✅ | Preview + panel semáforo; mock con URLs demo |
| Descarga PDF (jsPDF) | ✅ | Score, análisis, plan 30d, radar, jobs, mercado, perfil |
| ESLint | ✅ | `npm run lint` sin errores; ignora ReBrand + prototipos kit (`Landing.jsx`, …) |
| Deploy producción (Vercel) | 🔲 | Root: `frontend`, env `VITE_API_URL` |

### Pendiente UI (pre-pitch)

| Pieza | Prioridad | Notas |
|-------|-----------|-------|
| Deploy Vercel + backend prod | Alta | `VITE_API_URL`, CORS |
| Prueba E2E back real | Alta | `USE_MOCK_DATA=false` |
| Copy landing hardcode | Baja | Prototipos kit `Landing.jsx` / `Wizard.jsx` (huérfanos) |

Ver detalle post-MVP: [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md).

## Backend — fases

| Fase | Descripción | Estado |
|------|-------------|--------|
| 0–1 | Entorno + estructura + CORS | ✅ |
| 2 | Schema Supabase | 🚧 Tablas ✅, datos pendientes pipeline |
| 3–5 | Modelos + perfil + Gemini | ✅ |
| 6–7 | Jobs recomendados + mercado | ✅ |
| 8 | Coach conversacional | ✅ |
| 9–10 | Seguridad + smoke tests | ✅ |
| 11 | Deploy | 🔲 |
| — | `GET /api/plan/{session_id}` | ⚠️ Legacy — front usa `POST .../action-plan` |
| P2-F1 | Análisis + plan IA | ✅ Real verificado (migración 004) |
| P2-F3 | Gráficas radar + timeline (API) | ✅ Real verificado |
| P2-F2 | Coach function calling | 🚧 Código en `app/services/coach/` |

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completo |
| 🚧 | En progreso |
| 🔲 | No iniciado |
| 🔁 | Cambio de alcance |
| ❌ | Bloqueado |

## Próximos pasos inmediatos

### Pitch / demo
1. **Backend:** `USE_MOCK_DATA=false`, migraciones 002+004, uvicorn `:8000` — smoke en [ENDPOINTS.md](ENDPOINTS.md#troubleshooting--modo-real-use_mock_datafalse)
2. **E2E:** wizard → resultados — Network con 200 en Plan 2; UI ya consume `analysis`/plan real
3. Pipeline: enriquecer `jobs.city` al insertar
4. Deploy: **pospuesto** — `VITE_API_URL` + `CORS_ORIGINS`

### Post-MVP (no bloquean pitch)
- Login opcional + timeline del plan con progreso → [post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md)
- Startup Analyzer (spinoff) → [ideallamativamacondo.md](EXTRA_IDEAS/ideallamativamacondo.md)

## Documentación

| Doc | Contenido |
|-----|-----------|
| [ENDPOINTS.md](ENDPOINTS.md) | Contrato API + troubleshooting Plan 2 |
| [decisions/2026-05-23-backend-plan2-phase1-fixes.md](decisions/2026-05-23-backend-plan2-phase1-fixes.md) | Fixes RLS, dashboard, JSONB |
| [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) | Handoff Plan 2 (analyze, radar, timeline) |
| [EXTRA_IDEAS/README.md](EXTRA_IDEAS/README.md) | Ideas fuera del MVP |
| [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md) | Roadmap fase 2 + guion pitch |
