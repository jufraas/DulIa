# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-24 — **Entrevista V2 (Plan F M4):** chat conversacional en `/entrevistas` + mock fallback; backend B8 pendiente.

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | `main` unifica FRONT + Backend |
| Backend (FastAPI) | ✅ B1–B7 completo | Progreso + interview pool real + coach context; deploy pendiente |
| Frontend (React+Vite) | ✅ MVP UI | Plan 2 en pantalla; mocks si API falla |
| Pipeline | ✅ Híbrido | getonbrd + remotive; `run_queue.py` + `run_baseline.py`; cache-first en backend |
| Base de datos | ✅ Datos + schema | Plan 2 + migraciones 004, **008–015**; ~380 jobs; pool entrevistas **629 filas** |
| Deploy | 🔲 No iniciado | Backend: Railway/Render + `CORS_ORIGINS`; Front: Vercel |

## Frontend — avance detallado

### Rutas (kit ReBrand)

| Ruta | Pantalla | Dueño | Estado |
|------|----------|-------|--------|
| `/` | Landing (splash + hero + features scroll reveal) | Joufra / Migue | ✅ |
| `/sobre` | Sobre DulIA | Migue | ✅ |
| `/comenzar` | Wizard onboarding (3 pasos + CV) | Compartido | ✅ |
| `/resultados` | Score, perfil, **termómetro**, jobs, plan 30-60-90, **RadarMatch**, timeline, **coach**, PDF completo | Joufra / Migue | ✅ |
| `/vacantes` | Panel vacantes con semáforo; **Volver → `/resultados`** | Joufra | ✅ |
| `/login`, `/registro` | Auth opcional Supabase | Compartido | ✅ |
| `/perfil` | Cuenta + resumen coach (protegida) | Compartido | ✅ |
| `/progreso` | Plan checkeable + fases + CTA entrevista (protegida) | Migue + Jufra | ✅ |
| `/entrevistas` | Entrevista **V2 chat** (default) o quiz V1 (`?legacy=1`) | Migue | ✅ UI · mock |

### Piezas transversales (Migue — API / sesión)

| Pieza | Estado | Notas |
|-------|--------|-------|
| Design system (`dulia-tokens.css`, `dulia-kit.css`) | ✅ | Basado en ReBrand |
| Landing — splash + animaciones (Framer Motion) | ✅ | `RevealOnScroll`, `WelcomePage` fases |
| Wizard — ubicación DANE | ✅ | 32 deptos + 1.119 municipios; selects cascada |
| `RadarMatch` en `/resultados` | ✅ | `GET .../radar-data` + fallback `mockResultsBundle` |
| `MarketThermometer` | ✅ | Solo `/resultados`; endpoint `GET /market/dashboard/{session_id}` |
| `ProcessStatusBar` | ✅ | Barra fija inferior — CV, submit wizard, descarga PDF |
| Plan 2 frontend | ✅ | `loadResultsBundle`: analyze → action-plan → jobs/market/radar/timeline |
| Layout `/resultados` | ✅ | **Congelado** — regla `.cursor/rules/results-layout-frozen.mdc` |
| Integración Axios → API | ✅ | `services/api.js` + fallbacks mock |
| Auth Supabase (opcional) | ✅ | `AuthProvider`, `ProtectedRoute`, `link-session` |
| Mi Progreso — Bloque 2 | ✅ | `PlanTimeline`, `ProgressOverview`, `PhaseLockOverlay`, `TaskList`, scroll |
| Mi Progreso — M3 E2E | ✅ | Backend Supabase (`progress_m3_service`); banner `dataSource`; tests |
| Integración J1–J3 | ✅ | Auth redirect, nav, entrevista quiz V1 + store |
| Entrevista V2 — M4 | ✅ | `InterviewV2Page`, `useInterviewV2Store`, mock + `interviewV2Api`; espera B8 |
| Deploy producción (Vercel) | 🔲 | Root: `frontend`, env `VITE_API_URL` + `VITE_SUPABASE_*` |

### Pendiente UI (pre-pitch)

| Pieza | Prioridad | Notas |
|-------|-----------|-------|
| Deploy Vercel + backend prod | Alta | `VITE_API_URL`, CORS |
| Alinear preguntas entrevista UI ↔ API | Media | V2 mock hasta B8; V1 pool vs templates |
| Backend entrevista V2 (B8) | Alta | `/api/interview/v2/*`, tabla `mock_interviews_v2` |
| Copy landing hardcode | Baja | Prototipos kit `Landing.jsx` / `Wizard.jsx` (huérfanos) |

Ver detalle post-MVP: [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md).

## Backend — fases

| Fase | Descripción | Estado |
|------|-------------|--------|
| 0–1 | Entorno + estructura + CORS | ✅ |
| 2 | Schema Supabase | ✅ Tablas + datos pipeline (~380 jobs) |
| 3–5 | Modelos + perfil + Gemini | ✅ |
| 6–7 | Jobs recomendados + mercado | ✅ |
| 8 | Coach conversacional | ✅ |
| 9–10 | Seguridad + smoke tests | ✅ |
| 11 | Deploy | 🔲 |
| P2-F2 | Coach function calling | 🚧 Código en `app/services/coach/` |
| Híbrido | Cache-first + scrape_queue | ✅ Migraciones 008–009 |
| Scoring v1.1 | Seniority filter + scores expresivos | ✅ |
| **B1–B7** | Progreso + interview Supabase + pool real | ✅ |
| M3 front + back | `/progreso`, `/entrevistas`, adaptador M3 | ✅ |
| **B8** | Entrevista conversacional V2 (API + Gemini) | 🔲 |

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completo |
| 🚧 | En progreso |
| 🔲 | No iniciado |

## Próximos pasos inmediatos

### Pitch / demo
1. **Backend:** `USE_MOCK_DATA=false`, uvicorn `:8000` — smoke E2E progreso + interview + coach
2. **Frontend:** login → `/progreso` → `/entrevistas` con backend local
3. Deploy: Railway + Vercel — `VITE_API_URL` + `CORS_ORIGINS`

### Post-MVP
- Gemini real feedback entrevista; historial con detalle por sesión
- [post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md)

## Documentación

| Doc | Contenido |
|-----|-----------|
| [ENDPOINTS.md](ENDPOINTS.md) | Contrato API |
| [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) | Handoff front + progreso/entrevista |
| [INTERVIEW_REDESIGN_PLAN.md](INTERVIEW_REDESIGN_PLAN.md) | Rediseño entrevista V2 (Plan B + F) |
| [decisions/2026-05-24-frontend-progress-foundation.md](decisions/2026-05-24-frontend-progress-foundation.md) | Mi Progreso + merge |
