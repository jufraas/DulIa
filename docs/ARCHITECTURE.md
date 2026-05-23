# ARCHITECTURE — Arquitectura de DulIA

## Diagrama general

```
┌─────────────┐     HTTP/REST      ┌─────────────────────┐
│   Frontend  │ ◄────────────────► │      Backend        │
│ React+Vite  │   JSON + session   │  FastAPI + Uvicorn  │
│  Tailwind   │                    │  matching + Gemini  │
└─────────────┘                    └────────┬────────────┘
                                            │
                              ┌─────────────┼──────────────┐
                              │             │              │
                    ┌─────────▼──────┐  ┌───▼───┐  ┌──────▼──────┐
                    │  Base de datos │  │ jobs  │  │ Gemini API  │
                    │ profiles/jobs  │  │ table │  │  (Fase 8)   │
                    └────────────────┘  └───────┘  └─────────────┘
                              ▲
                    ┌─────────┴──────┐
                    │    Pipeline    │
                    │  scrapers.py   │
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
- Consulta en paralelo:
  - `GET /api/jobs/recommended/{session_id}`
  - `GET /api/market/dashboard?city=...`
- Estado de UI en **Zustand** (`useProfileStore`): perfil, jobs, market.
- Fallback a `mockData.js` si jobs/market no responden.
- PDF (jsPDF) incluye perfil, vacantes y datos de mercado si están en store.
- **No** llama a Gemini directamente.
- Referencia visual: `frontend/ReBrand/DulIA Design System (1)/` (no es código de producción).
- División de archivos: [frontend/COMPONENT_OWNERS.md](../frontend/COMPONENT_OWNERS.md).

### `backend/`

- API REST según [ENDPOINTS.md](ENDPOINTS.md).
- Persiste perfil por `session_id`.
- Calcula compatibilidad perfil ↔ vacantes (algoritmo o IA).
- Expone dashboard agregado del mercado laboral.
- **Fase 8:** coach conversacional vía Gemini ([PROMPTS.md](PROMPTS.md)).
- Módulo `markitdown/` listo para CV PDF → markdown (integración posterior).
- **Responsable:** Carlos

> **Nota:** `backend/main.py` aún tiene stub multipart legacy. Debe migrarse al contrato de `ENDPOINTS.md`.

### `pipeline/`

- Scrapers de portales laborales colombianos → BD (`job_offers`).
- Independiente del backend; alimenta matching y dashboard.
- **Responsable:** Compa 2

## Flujo principal (happy path)

0. Usuario ve **landing** (`/`) o lee **Sobre DulIA** (`/sobre`) — sin registro.
1. Usuario completa **onboarding** (`/comenzar`, wizard 3 pasos).
2. Frontend genera/reutiliza `session_id` y envía `POST /api/profile` (JSON).
3. Backend guarda perfil asociado al `session_id`.
4. Frontend consulta en paralelo jobs + market y guarda en Zustand.
5. Usuario ve **resultados** (`/resultados`): score, perfil, top vacantes, plan 30d.
6. Usuario puede ir a **vacantes** (`/vacantes`) — listado completo con semáforo.
7. Usuario descarga **PDF** con plan de acción (incluye mercado si hay datos).

## Comunicación entre módulos

| De | A | Protocolo |
|----|---|-----------|
| Frontend | Backend | HTTP REST (`application/json`) |
| Backend | BD | Driver nativo (por definir) |
| Backend | Gemini | HTTPS — Fase 8 (coach) |
| Backend | MarkItDown | In-process — fase posterior (CV) |
| Pipeline | BD | Driver nativo (por definir) |

## Responsabilidades: datos del usuario

| Dato | Frontend | Backend |
|------|----------|---------|
| Formulario wizard | Captura + valida (3 pasos) | Recibe JSON (`nombre`, `ciudad`, …) |
| session_id | Genera en localStorage | Clave de persistencia anónima |
| Matching vacantes | Muestra scores y semáforo | Calcula `score_compatibilidad` |
| Termómetro mercado | PDF (UI opcional / pendiente) | Agrega datos de BD |
| Plan 30 días | Copy estático en UI | Futuro: Gemini |
| Coach / chat | UI futura | Gemini — Fase 8 |
| PDF plan de acción | Genera (jsPDF) | — |

## Estructura frontend relevante

```
frontend/src/
├── pages/
│   ├── WelcomePage.jsx      # / — Landing
│   ├── AboutPage.jsx        # /sobre
│   ├── OnboardingPage.jsx   # /comenzar
│   ├── ResultsPage.jsx      # /resultados
│   └── VacanciesPage.jsx    # /vacantes
├── components/
│   ├── about/               # Secciones Sobre DulIA
│   ├── welcome/             # Hero, Features (landing)
│   ├── onboarding/          # Wizard (3 pasos)
│   ├── results/             # Score, perfil, PDF, plan 30d
│   ├── vacancies/           # Panel semáforo
│   ├── layout/              # SiteHeader, SiteFooter, LandingFooter
│   ├── brand/               # Logo, ScoreRing, IconBox
│   └── ui/                  # Button, Input, Container, …
├── hooks/
│   ├── useOnboardingForm.js
│   ├── useResultsData.js
│   └── usePdfDownload.js
├── services/
│   ├── api.js               # Cliente Axios
│   └── mockData.js          # Fallback
├── store/
│   └── useProfileStore.js   # Zustand: perfil, jobs, market
├── styles/
│   ├── dulia-tokens.css
│   └── dulia-kit.css
└── utils/
    ├── session.js
    ├── buildProfilePayload.js
    └── generateAnalysisPdf.js
```

## Limitaciones conocidas

- **Refresh en `/resultados`:** si Zustand no tiene perfil, redirige a `/comenzar`. Recuperación vía `GET /profile/{session_id}` pendiente de implementar en frontend.
- **Estado en memoria:** jobs/market se pierden al recargar si no se re-fetchan (hooks lo intentan si hay perfil en store).
