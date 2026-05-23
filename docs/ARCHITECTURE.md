# ARCHITECTURE — Arquitectura de DulIA

## Diagrama general

```
┌─────────────┐     HTTP/REST      ┌─────────────────────┐
│   Frontend  │ ◄────────────────► │      Backend        │
│ React+Vite  │   JSON + session   │  FastAPI + Uvicorn  │
│  Tailwind   │                    │  matching + Gemini  │
└─────────────┘                    └────────┬────────────┘
                                            │
                              ┌─────────────┴──────────────┐
                              │                            │
                    ┌─────────▼──────┐            ┌────────▼────────┐
                    │    Supabase    │            │   Gemini API    │
                    │  PostgreSQL 17 │            │    (Google)     │
                    └─────────▲──────┘            └─────────────────┘
                              │
                    ┌─────────┴──────┐
                    │    Pipeline    │
                    │ mock / Adzuna  │
                    └────────────────┘
```

## Módulos

### `frontend/`

SPA **sin login**, alineada al **kit ReBrand** con pantallas separadas:

| Ruta | Contenido |
|------|-----------|
| `/` | Landing — splash, pitch, features con scroll reveal, CTA |
| `/sobre` | Sobre DulIA — problema, audiencia, modelo, equipo |
| `/comenzar` | Wizard onboarding (3 pasos) |
| `/resultados` | Score, resumen perfil, preview vacantes, plan 30d, **Match Radar**, PDF |
| `/vacantes` | Panel de vacantes con semáforo de confianza |

**Flujo de datos:**

- Genera `session_id` (UUID) en `localStorage` (`dulia_session_id`).
- **Paso 0 wizard (opcional):** sube CV PDF → `POST /api/profile/parse-cv` → prellena formulario.
- Envía `POST /api/profile` (JSON, campos en español) al completar el wizard.
- Consulta en paralelo jobs + market + **plan**; estado en **Zustand** (`useProfileStore`: `savedProfile`, `jobs`, `market`, `plan`).
- **Persistencia:** cache en `dulia_session_data` (incluye `plan`); borrador wizard en `dulia_wizard_draft`.
- **Rehidratación** al cargar app (`sessionHydration.js`): cache → `GET /profile` → re-fetch jobs/market/plan.
- Fallbacks: `mockData`, `mockCvPrefill`, `mockProfileFromPayload`, `mockPlan`, `mockCoachChat`.
- PDF (jsPDF): perfil + vacantes + mercado (plan en PDF pendiente).
- **Coach UI** pendiente (Joufra); API `postCoachChat()` lista.
- División de archivos: [frontend/COMPONENT_OWNERS.md](../frontend/COMPONENT_OWNERS.md).
- **Motion landing:** `framer-motion` vía `components/motion/RevealOnScroll.jsx`; splash orquestado en `WelcomePage` (ver [decisión landing animations](decisions/2026-05-23-frontend-landing-animations.md)).

### `backend/`

- API REST según [ENDPOINTS.md](ENDPOINTS.md). Handoff frontend: [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md).
- Extrae perfiles con Gemini (`profile_service`); scoring en `jobs_service`.
- Dashboard de mercado sobre tabla `jobs` (`market_service`).
- Coach conversacional (`coach_service` + [PROMPTS.md](PROMPTS.md)).
- **Responsable:** Carlos

```
backend/
├── main.py              → CORS + routers + startup
└── app/
    ├── routes/          → health, profile, jobs, market, coach
    ├── services/        → profile, jobs, market, coach
    ├── models/          → schemas Pydantic
    ├── db/supabase.py   → cliente Supabase
    ├── db/gemini.py     → cliente Gemini
    └── utils/           → logger, limiter, cors, prompts
```

### `pipeline/`

- Inserta vacantes en Supabase tabla `jobs` (mock Gemini, Adzuna, Jooble).
- No depende del backend en runtime.
- **Responsable:** Jose

## Flujo principal (happy path)

0. Usuario ve **landing** (`/`): splash logo → hero en cascada → scroll con reveal en features/CTA; o **Sobre DulIA** (`/sobre`).
1. Completa **onboarding** (`/comenzar`, 3 pasos).
2. Frontend envía `POST /api/profile` con `session_id`.
3. Backend estructura perfil (Gemini) y guarda en `profiles`.
4. Frontend pide jobs + market + plan en paralelo.
5. **Resultados** (`/resultados`): score, perfil, top vacantes, plan 30d, **Match Radar** (store).
6. **Vacantes** (`/vacantes`): listado completo con semáforo.
7. Usuario descarga **PDF**.
8. (Opcional) **Coach** → `postCoachChat()` / `POST /api/coach/chat` (UI pendiente).

Ideas post-MVP (login, timeline del plan, deploy): [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md).

## Comunicación entre módulos

| De | A | Protocolo |
|----|---|-----------|
| Frontend | Backend | HTTP REST (JSON) — `ENDPOINTS.md` |
| Backend | Gemini | HTTPS (google-generativeai) |
| Backend | Supabase | supabase-py (PostgREST) |
| Pipeline | Supabase | Inserción directa en `jobs` |

## Responsabilidades: datos del usuario

| Dato | Frontend | Backend |
|------|----------|---------|
| Formulario wizard | Captura + valida (3 pasos) | Recibe JSON (`nombre`, `ciudad`, …) |
| session_id | Genera en localStorage | Clave de persistencia anónima |
| Cache sesión | `sessionCache.js` (localStorage) | — |
| Rehidratación | `sessionHydration.js` al boot | `GET /profile/{session_id}` |
| Matching vacantes | Scores, semáforo y **RadarMatch** (4 ejes estimados desde perfil/jobs) | Calcula `score_compatibilidad` |
| Termómetro mercado | Datos en store; `MarketThermometer.jsx` no montado | Agrega sobre `jobs` |
| Plan 30 días | `ThirtyDayPlan` lee store (`getPlan` + mock) | `GET /plan/{session_id}` pendiente |
| Coach / chat | `postCoachChat()` en api.js; UI burbuja pendiente | Gemini + perfil |
| PDF plan de acción | Genera (jsPDF) | — |

## Estructura frontend relevante

```
frontend/src/
├── pages/           # WelcomePage, AboutPage, OnboardingPage, ResultsPage, VacanciesPage
├── components/      # about/, welcome/, onboarding/, results/, vacancies/, layout/, brand/, ui/, motion/
│   └── motion/RevealOnScroll.jsx   # whileInView (scroll) | animate (mount)
├── hooks/           # useOnboardingForm, useResultsData, useSessionHydration, usePdfDownload
├── services/        # api.js, mock*.js, sessionHydration.js
├── store/           # useProfileStore.js (profile, jobs, market, plan)
├── styles/          # dulia-tokens.css, dulia-kit.css
└── utils/           # session, sessionCache, planDisplay, radarMatchData, buildProfilePayload, generateAnalysisPdf
```

## Roadmap post-MVP

Login opcional, timeline del plan con progreso, deploy, pulido pitch: [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md).  
Spinoff emprendimiento (no mezclar en MVP): [EXTRA_IDEAS/ideallamativamacondo.md](EXTRA_IDEAS/ideallamativamacondo.md).

## Modo desarrollo sin credenciales

`USE_MOCK_DATA=true` en backend `.env`:

- Respuestas estables sin Supabase/Gemini real.
- `GET /profile/{session_id}` devuelve 404 en mock; el front persiste la respuesta del POST en `dulia_session_data`.

## Limitaciones conocidas (MVP)

- Termómetro de mercado no montado en `/resultados` (solo PDF).
- Burbuja del coach sin UI (API lista).
- `GET /plan` backend pendiente (front usa mock personalizado).
- Plan 30d y **RadarMatch** no incluidos en PDF aún.
- Deploy producción pendiente.
