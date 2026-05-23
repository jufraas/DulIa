# DECISIONS — Índice de decisiones técnicas

> Registra aquí cada decisión importante: qué se eligió, por qué, y qué alternativas se descartadas.

| Fecha | Decisión | Razón | Alternativas descartadas |
|-------|----------|-------|--------------------------|
| 2026-05-23 | FastAPI para el backend | Rápido de implementar, auto-docs con Swagger, equipo familiar con Python | Django REST, Node/Express |
| 2026-05-23 | React + Vite + Tailwind para el frontend | Setup mínimo, hot reload rápido, Tailwind acelera el diseño | Next.js (overkill para 48h), Vue |
| 2026-05-23 | Gemini como modelo de IA | API gratuita disponible, buen rendimiento en español | OpenAI GPT-4, Claude |
| 2026-05-23 | pydantic>=2.14.0a1 (pre-release) | Python 3.14 no tiene wheel estable de pydantic-core 2.x; pre-release sí lo tiene | Downgrade Python, compilar desde fuente |
| 2026-05-23 | Posponer scrapers propios → mock data + APIs públicas | En 48h el scraping es alto riesgo (captchas, bloqueos, DOM frágil). Mock data + Adzuna/Jooble da el mismo resultado con mucho menos riesgo | BeautifulSoup + Playwright en Computrabajo/El Empleo |
| 2026-05-23 | Mock data generada con Gemini como base del MVP | Permite desarrollar todos los endpoints contra datos realistas sin depender del pipeline. Gemini genera vacantes creíbles del mercado colombiano | Hardcodear vacantes manualmente, esperar scraper |
| 2026-05-23 | Sin autenticación en el hackathon — identificador por session_id | Evita setup de auth (registro, login, tokens). El session_id es un UUID generado por el frontend en localStorage | Supabase Auth, JWT propio |
| 2026-05-23 | Prompts del coach en `docs/PROMPTS.md` + loader `app/utils/prompts.py` | Editable sin tocar código; convención del proyecto | Hardcodear en `coach_service.py` |
| 2026-05-23 | Coach responde JSON (`respuesta` + `sugerencias_rapidas`) | Chips en el frontend; fallback a texto plano si Gemini no devuelve JSON | Solo texto libre |
| 2026-05-23 | slowapi 10 req/min por IP en POST profile y coach | Protege cuota Gemini en hackathon; 429 estándar | Sin rate limit |
| 2026-05-23 | CORS vía `CORS_ORIGINS` + `APP_ENV` | Prod solo orígenes explícitos; dev `*` sin credentials | CORS fijo en código |
| 2026-05-23 | Tabla `jobs` en inglés + campos pipeline | Compatible Adzuna; API al front sigue en español vía `job_mapper` | Solo español en BD |
> Cada decisión importante tiene su propio archivo en [`decisions/`](./decisions/).

## Cómo registrar una decisión

1. Copia [`decisions/_TEMPLATE.md`](./decisions/_TEMPLATE.md).
2. Guárdala como `decisions/YYYY-MM-DD-[area]-[slug].md`.
3. Añádela al índice en [`decisions/README.md`](./decisions/README.md).

## Índice rápido

| Fecha | Área | Decisión | Archivo |
|-------|------|----------|---------|
| 2026-05-23 | backend | FastAPI | [decisions/2026-05-23-backend-fastapi.md](./decisions/2026-05-23-backend-fastapi.md) |
| 2026-05-23 | frontend | React + Vite + Tailwind | [decisions/2026-05-23-frontend-react-vite-tailwind.md](./decisions/2026-05-23-frontend-react-vite-tailwind.md) |
| 2026-05-23 | ia | Google Gemini | [decisions/2026-05-23-ia-gemini.md](./decisions/2026-05-23-ia-gemini.md) |
| 2026-05-23 | frontend | Landing antes del onboarding | [decisions/2026-05-23-frontend-landing-antes-onboarding.md](./decisions/2026-05-23-frontend-landing-antes-onboarding.md) |
| 2026-05-23 | frontend | Mock fallback API | [decisions/2026-05-23-frontend-mock-fallback-api.md](./decisions/2026-05-23-frontend-mock-fallback-api.md) |
| 2026-05-23 | frontend | React Router (SPA) | [decisions/2026-05-23-frontend-react-router-flujo-spa.md](./decisions/2026-05-23-frontend-react-router-flujo-spa.md) |
| 2026-05-23 | frontend | Zustand estado perfil | [decisions/2026-05-23-frontend-zustand-estado-perfil.md](./decisions/2026-05-23-frontend-zustand-estado-perfil.md) |

Ver índice completo y convenciones: **[decisions/README.md](./decisions/README.md)**
