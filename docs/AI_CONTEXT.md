# AI_CONTEXT — DulIA

> Lee esto primero si eres un LLM asistiendo en este proyecto.

## ¿Qué es DulIA?

Plataforma web con IA — coach de carrera para jóvenes colombianos. **Sin login:** el visitante completa un wizard, recibe vacantes con score de compatibilidad, explora un panel con semáforo y descarga un PDF con su plan. Incluye coach conversacional vía API.

1. Captura perfil en wizard (**3 pasos**, campos en español).
2. Backend guarda perfil por `session_id` (UUID en `localStorage`).
3. Backend calcula matching con vacantes y expone dashboard de mercado.
4. Frontend muestra resultados completos: análisis IA, termómetro, plan 30-60-90, radar, timeline, vacantes con semáforo y PDF (React + html2canvas → jsPDF).
5. Coach: `CoachChatBubble` → `postCoachChat()` → `POST /api/coach/chat` (UI ✅).
6. Plan 2: `loadResultsBundle()` → analyze + action-plan + radar/timeline (front ✅).

## Contexto del hackathon

- **Evento:** Barranqui-IA 2026
- **Duración:** 48 horas
- **Equipo:** 4-5 personas en paralelo

## Stack

`FastAPI` + `React/Vite/Tailwind` + `PostgreSQL/Supabase` + `Gemini API` + pipeline (**Get on Board** local + **Remotive** remoto internacional)

## Flujo frontend (SPA)

```
Landing (/) ──► Sobre DulIA (/sobre) [opcional]
     │
     ▼
Onboarding (/comenzar, 3 pasos)
     │  paso 0: POST /profile/parse-cv (opcional)
     ▼
POST /profile ──► loadResultsBundle()
     │  analyze → action-plan → jobs + market + radar + timeline
     ▼
Resultados (/resultados) ──► Vacantes (/vacantes) ──► Volver a análisis (/resultados) ──► PDF
     │  score, análisis IA, termómetro, plan (tabs 30/60/90), radar, timeline
     │                              │
     └── CoachChatBubble ───────────┘ postCoachChat()
     ▲
     └── refresh OK: rehidratación (cache + GET /profile)
```

- `session_id` en `localStorage` (`dulia_session_id`).
- Estado UI en Zustand; cache en `dulia_session_data` para sobrevivir refresh.
- Borrador del wizard en `dulia_wizard_draft` si refresca en `/comenzar`.
- UI kit ReBrand: `frontend/ReBrand/DulIA Design System (1)/`.
- **Landing motion:** `framer-motion` + `RevealOnScroll` (splash en `WelcomePage`, hero `trigger="mount"`, secciones `trigger="scroll"`).
- **Resultados:** `ProfileSummary` (analyze), `RadarMatch`, `CareerTimeline`, `CoachChatBubble`, `ThirtyDayPlan` (tabs 30/60/90), PDF completo.
- **Wizard ubicación:** selects DANE 32 deptos / 1.119 municipios (`colombiaLocations.js`).

## Rutas y dueños frontend

| Ruta | Pantalla | Dueño |
|------|----------|-------|
| `/` | Landing | Joufra |
| `/sobre` | Sobre DulIA | **Migue** |
| `/comenzar` | Wizard | Compartido |
| `/resultados` | Resultados | Joufra |
| `/vacantes` | Vacantes | Joufra |

Ver [frontend/COMPONENT_OWNERS.md](../frontend/COMPONENT_OWNERS.md).

## Estado actual

| Módulo | Estado |
|--------|--------|
| Backend | ✅ Fases 0–10 (mock + real); falta deploy |
| Frontend | ✅ MVP UI completo; falta deploy prod |
| Pipeline | ✅ Híbrido | getonbrd + remotive + `run_queue.py`; ver [PIPELINE_HYBRID.md](PIPELINE_HYBRID.md) |
| Gemini | ✅ Profile extraction + coach |

Ver [PROJECT_STATE.md](PROJECT_STATE.md).

## Estructura backend

```
backend/
├── main.py              → CORS + routers + startup
└── app/
    ├── routes/          → health, profile, jobs, market, coach
    ├── services/        → lógica de negocio
    ├── models/          → schemas Pydantic
    ├── db/supabase.py   → cliente Supabase
    └── db/gemini.py     → cliente Gemini
```

## Endpoints (contrato en ENDPOINTS.md)

| Método | Ruta | Estado |
|--------|------|--------|
| GET | `/api/health` | ✅ |
| POST | `/api/profile` | ✅ |
| POST | `/api/profile/parse-cv` | ✅ |
| GET | `/api/profile/{session_id}` | ✅ |
| GET | `/api/jobs/recommended/{session_id}` | ✅ |
| GET | `/api/market/dashboard` | ✅ (+ `por_modalidad`, `por_fuente`) |
| POST | `/api/coach/chat` | ✅ |
| GET | `/api/plan/{session_id}` | ⚠️ legacy — no usar en front |
| GET | `/api/profile/{session_id}/radar-data` | ✅ Plan 2 F3 |
| GET | `/api/profile/{session_id}/timeline-data` | ✅ Plan 2 F3 |
| POST | `/api/profile/{session_id}/analyze` | ✅ Plan 2 F1 |
| POST | `/api/profile/{session_id}/action-plan` | ✅ Plan 2 F1 |

## Archivos clave

| Archivo | Para qué |
|---------|----------|
| [ENDPOINTS.md](ENDPOINTS.md) | **Contrato API — fuente de verdad** |
| [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) | **Handoff frontend — flujo Plan 2 + recharts** |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Módulos y flujo |
| [SCHEMA.md](SCHEMA.md) | Tablas Supabase |
| [PROJECT_STATE.md](PROJECT_STATE.md) | Estado por módulo |
| [PROMPTS.md](PROMPTS.md) | Prompts Gemini |
| [frontend/COMPONENT_OWNERS.md](../frontend/COMPONENT_OWNERS.md) | División frontend |
| [decisions/2026-05-23-frontend-landing-animations.md](decisions/2026-05-23-frontend-landing-animations.md) | Splash + scroll animations landing |
| [decisions/2026-05-23-frontend-plan2-ui-sprints-complete.md](decisions/2026-05-23-frontend-plan2-ui-sprints-complete.md) | Sprints 1–3: analyze UI, coach, timeline, PDF |
| [decisions/2026-05-23-frontend-colombia-locations-wizard.md](decisions/2026-05-23-frontend-colombia-locations-wizard.md) | Selects ubicación DANE |
| [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md) | Fase 2: login, timeline plan, pulido pitch |
| [EXTRA_IDEAS/ideallamativamacondo.md](EXTRA_IDEAS/ideallamativamacondo.md) | Spinoff Startup Analyzer (no MVP) |

## Variables de entorno

| Variable | Dónde | Valor dev |
|----------|-------|-----------|
| `VITE_API_URL` | frontend | `http://localhost:8000/api` |
| `USE_MOCK_DATA` | backend | `true` (dev sin credenciales) |

## Desarrollo local

```bash
# Backend
cd backend && uvicorn main:app --reload

# Frontend (desde frontend/, no la raíz)
cd frontend && npm run dev
```

## Notas técnicas

- Python 3.14 + `pydantic>=2.14.0a1` en backend.
- CORS abierto en dev; restringir con `CORS_ORIGINS` en producción.
- `USE_MOCK_DATA=true`: backend responde sin Supabase/Gemini; `GET /profile` devuelve 404 en mock — el front usa cache local (`dulia_session_data`).
- Persistencia: `sessionCache.js`, `sessionHydration.js`.
- API cliente: `loadResultsBundle`, `postCoachChat`, `createProfile`, `parseCvPdf`, jobs, market, radar — fallbacks en `mockResultsBundle.js` + `mock*.js`.
- Post-MVP (login, timeline plan): ver [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md).
