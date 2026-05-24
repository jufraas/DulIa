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
                    │ getonbrd +     │
                    │ remotive +     │
                    │ run_queue CLI  │
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
| `/resultados` | Score, análisis IA, termómetro, preview vacantes, plan 30-60-90 (tabs), radar, timeline, coach, PDF |
| `/vacantes` | **Termómetro** + panel de vacantes con semáforo de confianza |

**Flujo de datos:**

- Genera `session_id` (UUID) en `localStorage` (`dulia_session_id`).
- **Paso 0 wizard (opcional):** sube CV PDF → `POST /api/profile/parse-cv` → prellena formulario.
- Envía `POST /api/profile` (JSON, campos en español) al completar el wizard (paso 1: departamento + municipio DANE).
- Tras guardar perfil: `loadResultsBundle()` — analyze, action-plan, jobs, market, radar, timeline.
- Estado en **Zustand** (`useProfileStore`: `savedProfile`, `jobs`, `market`, `plan`, `radar`, `timeline`).
- **Persistencia:** cache en `dulia_session_data` (incluye plan, radar, timeline); borrador wizard en `dulia_wizard_draft`.
- **Rehidratación** al cargar app (`sessionHydration.js`): cache → `GET /profile` → `loadResultsBundle` si faltan datos.
- Fallbacks: `mockResultsBundle.js` (personalizado al perfil) + `mockData`, `mockCvPrefill`, `mockProfileFromPayload`, `mockPlan`, `mockCoachChat`.
- PDF: bloques `[data-pdf-block]` capturados con html2canvas (PNG) → jsPDF; fondo `#0D0D0D` en cada hoja (`generateAnalysisPdf.jsx`, lazy).
- **Coach:** `CoachChatBubble` → `postCoachChat()`.
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

- Inserta vacantes en Supabase tabla `jobs` (**Get on Board** + **Remotive**).
- **Híbrido cache-first:** `run_queue.py` procesa `scrape_queue`; `run_baseline.py` scrape directo.
- No depende del backend en runtime (excepto compartir `.env` Supabase).
- Ver [PIPELINE_HYBRID.md](PIPELINE_HYBRID.md).
- **Responsable:** Jose

## Flujo principal (happy path)

0. Usuario ve **landing** (`/`): splash logo → hero en cascada → scroll con reveal en features/CTA; o **Sobre DulIA** (`/sobre`).
1. Completa **onboarding** (`/comenzar`, 3 pasos).
2. Frontend envía `POST /api/profile` con `session_id`.
3. Backend estructura perfil (Gemini) y guarda en `profiles` + best-effort `user_interests`.
4. Frontend pide jobs + market + plan en paralelo.
5. **Jobs recomendados:** cache-first por frescura (`FRESH_HORIZON_HOURS`); si pocas frescas → encola `scrape_queue` (best-effort).
6. **Resultados** (`/resultados`): score, perfil, top vacantes, plan 30d, **Match Radar** (store).
7. **Vacantes** (`/vacantes`): listado completo con semáforo; **Volver** regresa a `/resultados` (store conserva perfil y análisis).
8. Usuario descarga **PDF**.
9. **Coach** → `CoachChatBubble` / `POST /api/coach/chat`.

Ideas post-MVP (login, timeline del plan, deploy): [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md).

## Comunicación entre módulos

| De | A | Protocolo |
|----|---|-----------|
| Frontend | Backend | HTTP REST (JSON) — `ENDPOINTS.md` |
| Backend | Gemini | HTTPS (google-generativeai) |
| Backend | Supabase | supabase-py (PostgREST) |
| Pipeline | Supabase | Inserción directa en `jobs`; cola `scrape_queue` vía `run_queue.py` |
| Backend | scrape_queue | `request_scrape()` best-effort desde `jobs_service` |

## Responsabilidades: datos del usuario

| Dato | Frontend | Backend |
|------|----------|---------|
| Formulario wizard | Captura + valida (3 pasos) | Recibe JSON (`nombre`, `ciudad`, …) |
| session_id | Genera en localStorage | Clave de persistencia anónima |
| Cache sesión | `sessionCache.js` (localStorage) | — |
| Rehidratación | `sessionHydration.js` al boot | `GET /profile/{session_id}` |
| Matching vacantes | Scores, semáforo y **RadarMatch** (5 ejes vía API) | Calcula `score_compatibilidad` |
| Termómetro mercado | `MarketThermometer` en `/resultados` y `/vacantes` | `GET /market/dashboard/{session_id}` (personalizado) o global por `city` |
| Plan 30 días | `ThirtyDayPlan` ← `POST .../action-plan` o mock por perfil (1 curso por habilidad) | Plan 2 + Gemini |
| Coach / chat | `CoachChatBubble` → `postCoachChat()` | Gemini + perfil |
| PDF plan de acción | `generateAnalysisPdf.jsx` + `components/pdf/*` (html2canvas → jsPDF) | — |

## Estructura frontend relevante

```
frontend/src/
├── pages/           # WelcomePage, AboutPage, OnboardingPage, ResultsPage, VacanciesPage
├── components/      # about/, welcome/, onboarding/, results/, vacancies/, layout/, brand/, ui/, motion/
│   └── motion/RevealOnScroll.jsx   # whileInView (scroll) | animate (mount)
├── hooks/           # useOnboardingForm, useResultsData, useSessionHydration, usePdfDownload
├── services/        # api.js, mockResultsBundle.js, mock*.js, sessionHydration.js
├── store/           # useProfileStore.js (profile, jobs, market, plan, radar, timeline, analysis)
├── constants/       # colombiaLocations.js (DANE)
├── components/pdf/  # AnalysisPdfDocument, PdfSection
└── utils/           # session, sessionCache, planDisplay, radarApi, analysisDisplay, marketDisplay, timelineDisplay, generateAnalysisPdf.jsx
```

## Roadmap post-MVP

Login opcional, timeline del plan con progreso, deploy, pulido pitch: [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md).  
Spinoff emprendimiento (no mezclar en MVP): [EXTRA_IDEAS/ideallamativamacondo.md](EXTRA_IDEAS/ideallamativamacondo.md).

## Modo desarrollo sin credenciales

`USE_MOCK_DATA=true` en backend `.env`:

- Respuestas estables sin Supabase/Gemini real.
- `GET /profile/{session_id}` devuelve 404 en mock; el front persiste la respuesta del POST en `dulia_session_data`.

## Limitaciones conocidas (MVP)

- Deploy producción pendiente (Vercel + backend + CORS).
- Copy hardcode en prototipos kit huérfanos (`Landing.jsx`, `Wizard.jsx`) — no afecta `*Page.jsx`.
- Vacantes reales dependen del pipeline en Supabase (`USE_MOCK_DATA=false`).
