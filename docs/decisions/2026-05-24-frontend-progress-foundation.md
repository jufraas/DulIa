# Mi Progreso — foundation frontend (Bloque 1)

- **Fecha:** 2026-05-24
- **Área:** frontend
- **Estado:** activa — Bloque 2 (timeline checkeable) pendiente
- **Autor/es:** Migue (foundation), Jufra (auth guard + mock interview UI)

## Contexto

Con auth opcional Supabase, usuarios que ya completaron el wizard necesitan **seguir su plan 30-60-90** (tareas checkeables, fases bloqueadas) y **practicar entrevistas** por skill. El backend de progreso/interview aún no está en producción; la demo no puede depender de Gemini en vivo.

## Decisión

### Capa de datos (Migue — Bloque 1)

| Pieza | Ubicación |
|-------|-----------|
| Mocks | `frontend/src/mocks/mockProgress.js`, `mockInterview.js` |
| API cliente | `getProgress`, `toggleTask`, `initProgress`, `hasProfile`, `startInterview`, `submitAnswer`, `finishInterview`, `interviewHistory`, `addTasksFromWeakSkills` en `api.js` |
| Stores | `useProgressStore.js`, `useInterviewStore.js` |
| Ruta | `/progreso` protegida con `ProtectedRoute` |
| Página | `ProgressPage.jsx` — header + barras fase + lista tareas (sin tocar `ThirtyDayPlan` en `/resultados`) |
| Tests | `npm run test:progress` → `scripts/test-progress-foundation.mjs` |

### Reglas de fallback

- Cada función en `api.js`: **intentar backend → `logOfflineFallback` → mock local**.
- Mocks no silenciosos en éxito parcial; errores de red caen a demo estable.
- Unlock fases: **80%** de la fase anterior (`UNLOCK_THRESHOLD_PCT`).

### Contrato API previsto (backend pendiente)

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

### División con Jufra

| Jufra | Migue |
|-------|-------|
| `useProfileCheck`, redirect post-login | Stores + mocks + `/progreso` shell |
| Mock Interview UI (J2) | Timeline checkeable en Bloque 2 (`PlanTimeline`) |
| Nav “Mi Progreso”, empty states | E2E backend real (Bloque 3) |

## Por qué

- Desbloquea trabajo en paralelo sin esperar backend.
- No modifica layout congelado de `/resultados`.
- Mismo patrón mock fallback que el resto del MVP.

## Pendiente (Bloque 2–3)

- Extraer timeline checkeable; integrar `ThirtyDayPlan` solo lectura en resultados.
- `TaskList` lateral + scroll a fase.
- Quitar mocks como primario cuando backend exponga endpoints.
