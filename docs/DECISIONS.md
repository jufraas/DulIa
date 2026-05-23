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

## Decisiones stack (resumen)

| Fecha | Decisión | Razón | Alternativas descartadas |
|-------|----------|-------|--------------------------|
| 2026-05-23 | FastAPI para el backend | Rápido, Swagger, Python | Django REST, Node/Express |
| 2026-05-23 | React + Vite + Tailwind | Setup mínimo, mobile first | Next.js, Vue |
| 2026-05-23 | Gemini como modelo de IA | Gratis, buen español | OpenAI, Claude |
| 2026-05-23 | pydantic>=2.14.0a1 | Python 3.14 sin wheel estable de pydantic-core 2.x | Downgrade Python |
| 2026-05-23 | Mock data + APIs públicas vs scrapers | Menor riesgo en 48h | Scrapers propios |
| 2026-05-23 | Sin auth — session_id | Evita setup de login | Supabase Auth, JWT |
| 2026-05-23 | Tabla `jobs` en inglés | Compatible Adzuna/pipeline | Solo español en BD |
| 2026-05-23 | slowapi 10 req/min | Protege cuota Gemini | Sin rate limit |
| 2026-05-23 | Landing antes del onboarding | Pitch para jurado | Ir directo al formulario |
| 2026-05-23 | Mock local en frontend | Demo sin backend | Hardcode en componentes |
| 2026-05-23 | UI kit ReBrand — 5 rutas | Pantallas separadas alineadas al diseño | Monolito landing+about |

## Cómo agregar una decisión

1. Copia [`decisions/_TEMPLATE.md`](./decisions/_TEMPLATE.md).
2. Guárdala como `decisions/YYYY-MM-DD-[area]-[slug].md`.
3. Añádela al índice en [`decisions/README.md`](./decisions/README.md) y aquí.

Ver índice completo: **[decisions/README.md](./decisions/README.md)**
