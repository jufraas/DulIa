# AI_CONTEXT — DulIA

> Lee esto primero si eres un LLM asistiendo en este proyecto.

## ¿Qué es DulIA?

Plataforma web con IA — **coach de carrera para jóvenes colombianos** (Barranqui-IA 2026). El flujo principal es **anónimo** (`session_id` en localStorage): wizard → análisis IA → vacantes con score → plan 30/60/90 → PDF. **Auth opcional** (Supabase) para cuenta y retomar progreso sin repetir el wizard.

## MVP backend (contrato en ENDPOINTS.md)

**Core:** `POST /profile`, `POST .../analyze`, `POST .../action-plan`, jobs, market, coach, radar, timeline.

**Progreso (B1–B3):** persistencia Supabase con contrato público M3 (`/progress/init`, `/progress/task`, `/progress/add-from-skills`; shape `tasks[]`, `global_pct`). Adaptador traduce IDs `p30-t0-…` ↔ `fase_30:semana_N:idx_M`.

**Mock Interview (B4–B7):** simulador híbrido — pool de ~629 preguntas con procedencia real (GitHub sudheerj/*, arialdomartini/*, HuggingFace) para tech + AI para sectores no-tech, + Gemini personaliza y evalúa. Flujo: `POST /interview/start` → 5× `answer` → `finish` → `GET /history`.

**Auth opcional (B2):** `GET /user/has-profile` tras login → redirigir a `/progreso` o `/comenzar`. `POST /auth/link-session` vincula `session_id` ↔ `user_id`.

**Coach context-aware (B6):** el system prompt incluye progreso del plan y última entrevista si existen. `POST /progress/add-from-skills` enriquece el plan desde resultados de entrevista.

## Stack

`FastAPI` + `React/Vite/Tailwind` + `PostgreSQL/Supabase` + `Gemini` + pipeline (**Get on Board** + **Remotive**)

## Flujo frontend (SPA)

```
Landing → Wizard (/comenzar) → POST /profile → loadResultsBundle() → /resultados
     │  analyze + action-plan + jobs + market + radar + timeline
     ├── Coach global (POST /coach/chat)
     ├── Progreso plan (GET/PATCH /progress/...)
     └── Mock interview (POST /interview/...)
Login opcional → has-profile → link-session → /progreso
```

- `session_id`: `localStorage` (`dulia_session_id`)
- Mock fallback en front si API cae; backend soporta `USE_MOCK_DATA=true`

## Estado actual (2026-05-24)

| Módulo | Estado |
|--------|--------|
| Backend B1–B6 | ✅ Listo para integración front + deploy |
| Frontend MVP | ✅ UI completa; integrar tabs progreso + interview |
| Deploy | 🔲 Railway + Vercel pendiente |

Ver [PROJECT_STATE.md](PROJECT_STATE.md), [ENDPOINTS.md](ENDPOINTS.md), [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md).

## Archivos clave

| Archivo | Para qué |
|---------|----------|
| [ENDPOINTS.md](ENDPOINTS.md) | Contrato API — fuente de verdad |
| [SCHEMA.md](SCHEMA.md) | Tablas Supabase |
| [PROMPTS.md](PROMPTS.md) | Prompts Gemini (coach v2.4, interview) |
| [DECISIONS.md](DECISIONS.md) | Decisiones B1–B6 |
