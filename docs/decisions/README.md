# Decisiones técnicas — DulIA

Cada decisión importante vive en **un archivo `.md` propio**. Plantilla: [`_TEMPLATE.md`](./_TEMPLATE.md).

## Cómo agregar una decisión

1. Copia [`_TEMPLATE.md`](./_TEMPLATE.md).
2. Nómbrala: `YYYY-MM-DD-[area]-[slug-corto].md`
3. Completa contexto, decisión, por qué y alternativas.
4. Añade una fila al índice de abajo y en [`../DECISIONS.md`](../DECISIONS.md).

## Índice

### General / full-stack

| Fecha | Archivo | Resumen |
|-------|---------|---------|
| 2026-05-23 | [2026-05-23-sin-login-flujo-anonimo.md](./2026-05-23-sin-login-flujo-anonimo.md) | Sin registro; session_id anónimo |
| 2026-05-23 | [2026-05-23-api-session-jobs-market.md](./2026-05-23-api-session-jobs-market.md) | API con endpoints separados |
| 2026-05-23 | [2026-05-23-cv-pdf-markitdown.md](./2026-05-23-cv-pdf-markitdown.md) | CV PDF → MarkItDown + `POST /profile/parse-cv` |

### Stack

| Fecha | Archivo | Resumen |
|-------|---------|---------|
| 2026-05-23 | [2026-05-23-backend-fastapi.md](./2026-05-23-backend-fastapi.md) | Backend en FastAPI |
| 2026-05-23 | [2026-05-23-frontend-react-vite-tailwind.md](./2026-05-23-frontend-react-vite-tailwind.md) | Frontend React + Vite + Tailwind |
| 2026-05-23 | [2026-05-23-ia-gemini.md](./2026-05-23-ia-gemini.md) | IA con Google Gemini |

### Frontend

| Fecha | Archivo | Resumen |
|-------|---------|---------|
| 2026-05-23 | [2026-05-23-frontend-landing-antes-onboarding.md](./2026-05-23-frontend-landing-antes-onboarding.md) | Landing antes del formulario |
| 2026-05-23 | [2026-05-23-frontend-mock-fallback-api.md](./2026-05-23-frontend-mock-fallback-api.md) | Mock si el backend no responde |
| 2026-05-23 | [2026-05-23-frontend-react-router-flujo-spa.md](./2026-05-23-frontend-react-router-flujo-spa.md) | Rutas SPA (5 pantallas) |
| 2026-05-23 | [2026-05-23-frontend-zustand-estado-perfil.md](./2026-05-23-frontend-zustand-estado-perfil.md) | Zustand para perfil y resultados |
| 2026-05-23 | [2026-05-23-frontend-session-rehydration.md](./2026-05-23-frontend-session-rehydration.md) | Cache local + GET profile al refresh |
| 2026-05-23 | [2026-05-23-frontend-landing-animations.md](./2026-05-23-frontend-landing-animations.md) | Splash + Framer Motion (`RevealOnScroll`) |
| 2026-05-23 | [2026-05-23-frontend-plan2-ui-sprints-complete.md](./2026-05-23-frontend-plan2-ui-sprints-complete.md) | Sprints 1–3: analyze UI, coach, timeline, PDF |
| 2026-05-23 | [2026-05-23-frontend-plan2-locations-thermometer.md](./2026-05-23-frontend-plan2-locations-thermometer.md) | Plan 2 API, termómetro UI, mocks bundle |
| 2026-05-23 | [2026-05-23-frontend-colombia-locations-wizard.md](./2026-05-23-frontend-colombia-locations-wizard.md) | Selects DANE departamento → municipio |
| 2026-05-24 | [2026-05-24-frontend-vite-proxy-coach-global.md](./2026-05-24-frontend-vite-proxy-coach-global.md) | Proxy `/api`, upload CV con fetch, coach global |

Estado frontend kit ReBrand: ver [COMPONENT_OWNERS.md](../../frontend/COMPONENT_OWNERS.md).

### Backend / Pipeline

| Fecha | Archivo | Resumen |
|-------|---------|---------|
| 2026-05-23 | [2026-05-23-backend-plan2-phase1-fixes.md](./2026-05-23-backend-plan2-phase1-fixes.md) | RLS Plan 2, dashboard sin `location`, JSONB nativo |
| 2026-05-23 | [2026-05-23-pipeline-fuentes-getonbrd-remotive.md](./2026-05-23-pipeline-fuentes-getonbrd-remotive.md) | Fuentes finales: getonbrd + remotive; Adzuna/Jooble deprecated |
| 2026-05-24 | [2026-05-24-jobs-seniority-scoring.md](./2026-05-24-jobs-seniority-scoring.md) | Scoring v1.1: filtro junior + scores expresivos |
| 2026-05-24 | [2026-05-24-auth-supabase-vinculado.md](./2026-05-24-auth-supabase-vinculado.md) | Auth opcional Supabase; vincular session_id ↔ user_id |
| 2026-05-24 | [2026-05-24-mock-interview-seed-pool.md](./2026-05-24-mock-interview-seed-pool.md) | Pool 120 preguntas CO + Gemini personaliza entrevistas |
| 2026-05-24 | [2026-05-24-plan-progress-task-id-jsonb.md](./2026-05-24-plan-progress-task-id-jsonb.md) | Progreso plan: JSONB + task_id `fase_X:semana_N:idx_M` |
| 2026-05-24 | [2026-05-24-interview-rate-limits.md](./2026-05-24-interview-rate-limits.md) | Rate limits 5/10/3 min en endpoints interview |
| 2026-05-24 | [2026-05-24-add-tasks-action-plan-inplace.md](./2026-05-24-add-tasks-action-plan-inplace.md) | Tareas refuerzo in-place en fase_30 |
| — | Ver [DECISIONS.md](../DECISIONS.md) | pydantic 3.14, slowapi, jobs en inglés, mock data |
