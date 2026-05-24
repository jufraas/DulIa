# Mi Progreso — foundation frontend (Bloque 1 + timeline M2.4)

- **Fecha:** 2026-05-24
- **Área:** frontend
- **Estado:** activa — Bloque 2 ✅ · M3 ✅ · **Integración Jufra (J1–J3) ✅** (2026-05-24)
- **Autor/es:** Migue (foundation + PlanTimeline), Jufra (auth guard + mock interview UI)

## Contexto

Con auth opcional Supabase, usuarios que ya completaron el wizard necesitan **seguir su plan 30-60-90** (tareas checkeables, fases bloqueadas) y **practicar entrevistas** por skill. La demo no puede depender de Gemini en vivo para entrevistas; el backend M3 expone endpoints mock alineados al contrato frontend.

## Decisión

### Capa de datos (Migue — Bloque 1)

| Pieza | Ubicación |
|-------|-----------|
| Mocks | `frontend/src/mocks/mockProgress.js`, `mockInterview.js` |
| API cliente | `getProgress`, `toggleTask`, `initProgress`, `hasProfile`, `startInterview`, `submitAnswer`, `finishInterview`, `interviewHistory`, `addTasksFromWeakSkills` en `api.js` |
| Stores | `useProgressStore.js`, `useInterviewStore.js` |
| Ruta | `/progreso` protegida con `ProtectedRoute` |
| Página | `ProgressPage.jsx` — header + barras fase + lista tareas (sin tocar `ThirtyDayPlan` en `/resultados`) |
| Tests | `npm run test:progress` (11 unit) · `npm run test:progress:api` (smoke E2E) · `pytest tests/test_m3_progress_api.py` (6) |

### Timeline checkeable (Migue — Bloque 2, M2.4)

| Pieza | Ubicación |
|-------|-----------|
| Timeline interactivo | `frontend/src/components/progress/PlanTimeline.jsx` |
| Resolución tarea | `findProgressTaskByLabel()` en `mockProgress.js` |
| Integración | `ProgressPage.jsx` — stats + barras fase + `<PlanTimeline />` |
| Solo lectura en resultados | `ThirtyDayPlan.jsx` **sin cambios** (layout congelado) |

Comportamiento M2.4: tabs 30/60/90, checkbox por tarea, UI optimista vía `useProgressStore.toggleTask`, spinner durante sync, anclas `timeline-phase-*` / `timeline-week-*` para scroll (M2.8).

### Barras animadas (Migue — M2.5)

| Pieza | Ubicación |
|-------|-----------|
| Overview global + fases | `ProgressOverview.jsx` |
| Strip bajo tabs | `ActivePhaseProgressStrip` en `PlanTimeline` |
| Hooks | `useAnimatedNumber.js`, `useProgressBarWidth.js` |
| Estilos | `.progress-bar-*` en `dulia-kit.css` |

### Overlay fases bloqueadas (Migue — M2.6)

| Pieza | Ubicación |
|-------|-----------|
| Overlay candado | `PhaseLockOverlay.jsx` |
| Integración | Tabs 60/90 en `PlanTimeline`; icono candado en tab bloqueado |
| UX | Contenido difuminado + card centrada; mensaje 80% fase anterior |

### TaskList lateral + scroll (Migue — M2.7–M2.8)

| Pieza | Ubicación |
|-------|-----------|
| Panel lateral | `TaskList.jsx` — filtros semana / pendientes / completadas |
| Scroll | `progressScroll.js` — `getTaskScrollTargetId`, anclas `timeline-task-*` |
| Store | `requestTaskFocus`, `highlightedTaskId` en `useProgressStore` |
| Layout | `ProgressPage` — grid `.progress-workspace` (sidebar + timeline) |
| UX | Click en tarea → tab correcto + scroll suave + highlight ~2s |

### Reglas de fallback

- Cada función en `api.js`: **intentar backend → `logOfflineFallback` → mock local**.
- Mocks no silenciosos en éxito parcial; errores de red caen a demo estable.
- Unlock fases: **80%** de la fase anterior (`UNLOCK_THRESHOLD_PCT`).

### E2E backend (Migue — Bloque 3, M3)

| Pieza | Ubicación |
|-------|-----------|
| Servicio progreso | `backend/app/services/progress_service.py` — store en memoria, unlock 80%, carga plan vía `action_plan_service` |
| Servicio entrevista | `backend/app/services/interview_service.py` — 5 preguntas mock, score/feedback |
| Rutas | `backend/app/routes/progress.py`, `routes/user.py` (progreso + interview + has-profile) |
| Registro | `backend/main.py` — routers bajo `/api` |
| Fallback frontend | `withProgressFallback()` en `api.js` — retorna `{ data, dataSource, fallbackDetail? }` |
| Env demo | `VITE_FORCE_PROGRESS_MOCK=true` en `.env.local` |
| Banner mock | `ProgressDataSourceBanner.jsx` en `/progreso` |
| Errores API | `utils/apiErrors.js` — `extractApiErrorMessage()` |
| Loader entrevista | `components/interview/GeminiThinkingLoader.jsx` (listo para UI J2) |
| Stores | `dataSource` + `dataSourceDetail` en `useProgressStore`, `useInterviewStore` |

### Contrato API (backend ✅ M3)

```
GET    /api/user/has-profile?user_id=
GET    /api/progress/{session_id}
PATCH  /api/progress/task          { session_id, task_id, completed }
POST   /api/progress/init           { session_id }
POST   /api/progress/add-from-skills { session_id, weak_skills[] }
POST   /api/interview/start         { session_id, skill, role? }
POST   /api/interview/{id}/answer   { answer }
POST   /api/interview/{id}/finish   { user_id }
GET    /api/interview/history?user_id=
```

### Integración post-merge Jufra (2026-05-24)

| Pieza | Ubicación |
|-------|-----------|
| Fix merge | `ProgressPage.jsx` — eliminado mock duplicado; CTA entrevista |
| J1 Auth guard | `useProfileCheck.js`, `RedirectIfHasProfile.jsx`, `LoginPage`, `RegisterPage` |
| J2 Entrevista UI | `InterviewPage.jsx`, `components/interview/*`, cableado a `useInterviewStore` |
| J2 Loader | `GeminiThinkingLoader.jsx` en submit/finish |
| J2 → plan | `addTasksFromWeakSkills` desde `InterviewResults` |
| J3 Nav | `SiteHeader.jsx` — Mi progreso + Entrevistas (logueado) |
| J3 Empty states | `ProgressPage` (sin plan), `InterviewHistory` (sin historial) |
| Adaptadores | `utils/interviewDisplay.js`, `utils/apiErrors.js` |
| Rutas | `/progreso`, `/entrevistas` en `App.jsx` |

### División con Jufra

| Jufra | Migue |
|-------|-------|
| `useProfileCheck`, redirect post-login ✅ | Stores + mocks + `/progreso` shell ✅ |
| Mock Interview UI (J2) ✅ | Timeline checkeable (`PlanTimeline`) ✅ |
| Nav “Mi Progreso”, empty states ✅ | E2E backend M3 + integración merge ✅ |

## Por qué

- Desbloquea trabajo en paralelo sin esperar backend.
- No modifica layout congelado de `/resultados`.
- Mismo patrón mock fallback que el resto del MVP.

## Pendiente (post-merge main)

- Deploy Vercel + backend prod
- Alinear preguntas entrevista UI (pool por skill) ↔ API backend
- “Ver feedback” en historial por sesión (endpoint detalle)
- Gemini real para feedback de entrevista (post-pitch)
