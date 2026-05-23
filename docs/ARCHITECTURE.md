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
| `/` | Landing — pitch, features, CTA |
| `/sobre` | Sobre DulIA — problema, audiencia, modelo, equipo |
| `/comenzar` | Wizard onboarding (3 pasos) |
| `/resultados` | Score, resumen perfil, preview vacantes, plan 30d, PDF |
| `/vacantes` | Panel de vacantes con semáforo de confianza |

**Flujo de datos:**

- Genera `session_id` (UUID) en `localStorage` (`dulia_session_id`).
- Envía `POST /api/profile` (JSON, campos en español) al completar el wizard.
- Consulta en paralelo jobs + market; estado en **Zustand** (`useProfileStore`).
- Fallback a `mockData.js` si jobs/market no responden.
- PDF (jsPDF) con perfil, vacantes y mercado.
- **No** llama a Gemini directamente.
- División de archivos: [frontend/COMPONENT_OWNERS.md](../frontend/COMPONENT_OWNERS.md).

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

0. Usuario ve **landing** (`/`) o **Sobre DulIA** (`/sobre`).
1. Completa **onboarding** (`/comenzar`, 3 pasos).
2. Frontend envía `POST /api/profile` con `session_id`.
3. Backend estructura perfil (Gemini) y guarda en `profiles`.
4. Frontend pide jobs + market en paralelo.
5. **Resultados** (`/resultados`): score, perfil, top vacantes, plan 30d.
6. **Vacantes** (`/vacantes`): listado completo con semáforo.
7. Usuario descarga **PDF**.
8. (Opcional) **Coach** → `POST /api/coach/chat`.

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
| Matching vacantes | Muestra scores y semáforo | Calcula `score_compatibilidad` |
| Termómetro mercado | PDF (UI opcional) | Agrega sobre `jobs` |
| Coach / chat | UI futura | Gemini + perfil en Supabase |
| PDF plan de acción | Genera (jsPDF) | — |

## Estructura frontend relevante

```
frontend/src/
├── pages/           # WelcomePage, AboutPage, OnboardingPage, ResultsPage, VacanciesPage
├── components/      # about/, welcome/, onboarding/, results/, vacancies/, layout/, brand/, ui/
├── hooks/           # useOnboardingForm, useResultsData, usePdfDownload
├── services/        # api.js, mockData.js
├── store/           # useProfileStore.js
├── styles/          # dulia-tokens.css, dulia-kit.css
└── utils/           # session, buildProfilePayload, generateAnalysisPdf
```

## Modo desarrollo sin credenciales

`USE_MOCK_DATA=true` en backend `.env`:

- Respuestas estables sin Supabase/Gemini real.
- `GET /profile/{session_id}` devuelve 404 en mock; el front guarda respuesta del POST en Zustand.

## Limitaciones conocidas

- Refresh en `/resultados` sin perfil en Zustand → redirige a `/comenzar`. Pendiente: `GET /profile/{session_id}`.
