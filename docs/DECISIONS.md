# DECISIONS — Índice de decisiones técnicas

> Detalle completo en [`decisions/`](./decisions/) (un `.md` por decisión).

## Índice rápido

| Fecha | Área | Decisión | Archivo |
|-------|------|----------|---------|
| 2026-05-23 | general | Sin login — session_id anónimo | [decisions/2026-05-23-sin-login-flujo-anonimo.md](./decisions/2026-05-23-sin-login-flujo-anonimo.md) |
| 2026-05-23 | full-stack | API session_id + jobs + market | [decisions/2026-05-23-api-session-jobs-market.md](./decisions/2026-05-23-api-session-jobs-market.md) |
| 2026-05-23 | full-stack | CV PDF + MarkItDown (`parse-cv`) | [decisions/2026-05-23-cv-pdf-markitdown.md](./decisions/2026-05-23-cv-pdf-markitdown.md) |
| 2026-05-23 | backend | FastAPI | [decisions/2026-05-23-backend-fastapi.md](./decisions/2026-05-23-backend-fastapi.md) |
| 2026-05-23 | frontend | React + Vite + Tailwind | [decisions/2026-05-23-frontend-react-vite-tailwind.md](./decisions/2026-05-23-frontend-react-vite-tailwind.md) |
| 2026-05-23 | ia | Google Gemini | [decisions/2026-05-23-ia-gemini.md](./decisions/2026-05-23-ia-gemini.md) |
| 2026-05-23 | frontend | Landing antes del onboarding | [decisions/2026-05-23-frontend-landing-antes-onboarding.md](./decisions/2026-05-23-frontend-landing-antes-onboarding.md) |
| 2026-05-23 | frontend | Mock fallback API | [decisions/2026-05-23-frontend-mock-fallback-api.md](./decisions/2026-05-23-frontend-mock-fallback-api.md) |
| 2026-05-23 | frontend | React Router (SPA) | [decisions/2026-05-23-frontend-react-router-flujo-spa.md](./decisions/2026-05-23-frontend-react-router-flujo-spa.md) |
| 2026-05-23 | frontend | Zustand estado perfil | [decisions/2026-05-23-frontend-zustand-estado-perfil.md](./decisions/2026-05-23-frontend-zustand-estado-perfil.md) |
| 2026-05-23 | frontend | Rehidratación sesión (refresh) | [decisions/2026-05-23-frontend-session-rehydration.md](./decisions/2026-05-23-frontend-session-rehydration.md) |
| 2026-05-23 | backend | Plan 2 Fase 1 — RLS, dashboard, JSONB | [decisions/2026-05-23-backend-plan2-phase1-fixes.md](./decisions/2026-05-23-backend-plan2-phase1-fixes.md) |
| 2026-05-23 | frontend | Plan 2 UI Sprints 1–3 | [decisions/2026-05-23-frontend-plan2-ui-sprints-complete.md](./decisions/2026-05-23-frontend-plan2-ui-sprints-complete.md) |
| 2026-05-23 | frontend | Plan 2 + termómetro + mocks | [decisions/2026-05-23-frontend-plan2-locations-thermometer.md](./decisions/2026-05-23-frontend-plan2-locations-thermometer.md) |
| 2026-05-23 | frontend | Ubicaciones DANE wizard | [decisions/2026-05-23-frontend-colombia-locations-wizard.md](./decisions/2026-05-23-frontend-colombia-locations-wizard.md) |
| 2026-05-23 | pipeline | Get on Board + Remotive (fuentes finales) | [decisions/2026-05-23-pipeline-fuentes-getonbrd-remotive.md](./decisions/2026-05-23-pipeline-fuentes-getonbrd-remotive.md) |
| 2026-05-23 | frontend | Animaciones landing (splash + Framer Motion) | [decisions/2026-05-23-frontend-landing-animations.md](./decisions/2026-05-23-frontend-landing-animations.md) |
| 2026-05-23 | pipeline | Adzuna/Jooble descartadas — reframe local + remoto | inline ↓ (ver archivo pipeline arriba) |
| 2026-05-23 | pipeline | Arquitectura híbrida cache-first + queue manual | [PIPELINE_HYBRID.md](./PIPELINE_HYBRID.md) — cron pendiente fase 2 |
| 2026-05-24 | backend | Scoring v1.1 + filtro seniority junior | [decisions/2026-05-24-jobs-seniority-scoring.md](./decisions/2026-05-24-jobs-seniority-scoring.md) |
| 2026-05-24 | frontend | PDF html2canvas + layout análisis | [decisions/2026-05-24-frontend-pdf-html2canvas-layout-analisis.md](./decisions/2026-05-24-frontend-pdf-html2canvas-layout-analisis.md) |
| 2026-05-24 | frontend | Proxy Vite `/api` + coach global | [decisions/2026-05-24-frontend-vite-proxy-coach-global.md](./decisions/2026-05-24-frontend-vite-proxy-coach-global.md) |
| 2026-05-24 | full-stack | Auth Supabase opcional + vinculación session_id | [decisions/2026-05-24-auth-supabase-vinculado.md](./decisions/2026-05-24-auth-supabase-vinculado.md) |
| 2026-05-24 | backend + ia | Híbrido seed-pool + Gemini para mock interviews | [decisions/2026-05-24-mock-interview-seed-pool.md](./decisions/2026-05-24-mock-interview-seed-pool.md) |
| 2026-05-24 | backend | Progreso plan: JSONB `completed_tasks` + convención task_id | [decisions/2026-05-24-plan-progress-task-id-jsonb.md](./decisions/2026-05-24-plan-progress-task-id-jsonb.md) |
| 2026-05-24 | backend | Rate limits asimétricos mock interview | [decisions/2026-05-24-interview-rate-limits.md](./decisions/2026-05-24-interview-rate-limits.md) |
| 2026-05-24 | backend | Add-tasks in-place en action_plans | [decisions/2026-05-24-add-tasks-action-plan-inplace.md](./decisions/2026-05-24-add-tasks-action-plan-inplace.md) |

### Panorama B1–B6 (hackathon progreso + interview)

| Fase | Decisión clave | Doc |
|------|----------------|-----|
| B1 | Seed-pool 120 preguntas + tablas progreso/interview | [mock-interview-seed-pool](./decisions/2026-05-24-mock-interview-seed-pool.md) |
| B2 | has-profile sin JWT (MVP) | Atajo documentado en ENDPOINTS |
| B3 | JSONB completed_tasks + task_id + desbloqueo 80% | [plan-progress-task-id-jsonb](./decisions/2026-05-24-plan-progress-task-id-jsonb.md) |
| B4 | Híbrido pool + Gemini evaluación | [mock-interview-seed-pool](./decisions/2026-05-24-mock-interview-seed-pool.md) |
| B5 | Rate limits 5/10/3 min | [interview-rate-limits](./decisions/2026-05-24-interview-rate-limits.md) |
| B6 | Coach context + add-tasks in-place | [add-tasks-action-plan-inplace](./decisions/2026-05-24-add-tasks-action-plan-inplace.md) |

## Decisiones stack (resumen)

| Fecha | Decisión | Razón | Alternativas descartadas |
|-------|----------|-------|--------------------------|
| 2026-05-23 | FastAPI para el backend | Rápido, Swagger, Python | Django REST, Node/Express |
| 2026-05-23 | React + Vite + Tailwind | Setup mínimo, mobile first | Next.js, Vue |
| 2026-05-23 | Gemini como modelo de IA | Gratis, buen español | OpenAI, Claude |
| 2026-05-23 | pydantic>=2.14.0a1 | Python 3.14 sin wheel estable de pydantic-core 2.x | Downgrade Python |
| 2026-05-23 | Mock data + APIs públicas vs scrapers | Menor riesgo en 48h | Scrapers propios |
| 2026-05-23 | Remotive + Get on Board como fuentes finales del pipeline | Adzuna sin Colombia; Jooble sin LATAM fiable. Reframe: oportunidades locales + remoto internacional. Termómetro: `por_fuente`, `por_modalidad` | Adzuna, Jooble, scrapers propios |
| 2026-05-23 | Arquitectura híbrida cache-first con queue manual | Respuesta rápida desde cache; scrape on-demand vía `scrape_queue` + `run_queue.py`. Sin cron en hackathon | Cron inmediato, scrape síncrono en request |
| 2026-05-24 | Scoring v1.1 + filtro seniority | Junior-first top 20; scores expresivos; analyze fallback calibrado | LLM re-rank; filtrar solo en pipeline |
| 2026-05-24 | Auth Supabase opcional vinculado | Login opcional; wizard anónimo intacto; `user_accounts` + link `profiles.user_id` | Auth obligatorio; mezclar cuenta en `profiles` |
| 2026-05-24 | Seed-pool + Gemini entrevistas | 120 preguntas curadas CO + IA personaliza; demo estable con fallback | Solo HF tech EN; 100% Gemini |
| 2026-05-24 | Progreso JSONB + task_id compuesto | PATCH simple; sin tabla relacional; IDs alineados a semanas UI | Tabla task_completions; hash de texto tarea |
| 2026-05-24 | Rate limits interview 5/10/3 por min | 1 entrevista = 7 llamadas Gemini cabe en límites; protege cuota | Sin límite; límite uniforme 10/min |
| 2026-05-24 | Add-tasks modifica action_plans in-place | Sin migración; front ve tareas al refetch plan | Columna extra_tasks en plan_progress |
| 2026-05-24 | Coach prompt v2.4 + user_context_block | Progreso + entrevista solo si relevante a la pregunta | Meter JSON crudo al prompt |
| 2026-05-23 | Sin auth — session_id (coach) | Evita fricción en demo; auth es capa aparte | Supabase Auth obligatorio |
| 2026-05-23 | Tabla `jobs` en inglés | Compatible Adzuna/pipeline | Solo español en BD |
| 2026-05-23 | slowapi 10 req/min | Protege cuota Gemini | Sin rate limit |
| 2026-05-23 | Landing antes del onboarding | Pitch para jurado | Ir directo al formulario |
| 2026-05-23 | Mock local en frontend | Demo sin backend | Hardcode en componentes |
| 2026-05-23 | UI kit ReBrand — 5 rutas | Pantallas separadas alineadas al diseño | Monolito landing+about |
| 2026-05-23 | Framer Motion en landing | Splash + scroll reveal sin scroll-jacking | Solo CSS anim-in |

## Cómo agregar una decisión

1. Copia [`decisions/_TEMPLATE.md`](./decisions/_TEMPLATE.md).
2. Guárdala como `decisions/YYYY-MM-DD-[area]-[slug].md`.
3. Añádela al índice en [`decisions/README.md`](./decisions/README.md) y aquí.

Ver índice completo: **[decisions/README.md](./decisions/README.md)**

## Roadmap post-MVP

Ideas fuera del MVP (login + timeline del plan, pulido pitch, spinoff emprendimiento): **[EXTRA_IDEAS/README.md](./EXTRA_IDEAS/README.md)**
