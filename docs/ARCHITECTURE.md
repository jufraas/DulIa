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

- SPA **sin login**: landing → onboarding (4 pasos) → resultados → PDF.
- Genera `session_id` (UUID) en `localStorage` (`dulia_session_id`).
- Envía `POST /api/profile` (JSON, campos en español).
- Tras guardar perfil, consulta en paralelo:
  - `GET /api/jobs/recommended/{session_id}`
  - `GET /api/market/dashboard?city=...`
- Muestra vacantes con `score_compatibilidad` y semáforo; termómetro de mercado.
- Genera PDF descargable (jsPDF) con jobs + mercado + perfil.
- Fallback a `mockData.js` si jobs/market no responden.
- **No** llama a Gemini directamente.
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

0. Usuario ve **landing** (sin registro).
1. Usuario completa **onboarding** (wizard 4 pasos).
2. Frontend genera/reutiliza `session_id` y envía `POST /api/profile` (JSON).
3. Backend guarda perfil asociado al `session_id`.
4. Frontend consulta en paralelo:
   - `GET /api/jobs/recommended/{session_id}` → array con scores
   - `GET /api/market/dashboard?city=...` → termómetro
5. Frontend muestra **resultados** (vacantes, mercado, resumen perfil).
6. Usuario descarga **PDF** con plan de acción.

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
| Formulario wizard | Captura + valida | Recibe JSON (`nombre`, `ciudad`, …) |
| session_id | Genera en localStorage | Clave de persistencia anónima |
| Matching vacantes | Muestra scores | Calcula `score_compatibilidad` |
| Termómetro mercado | Muestra dashboard | Agrega datos de BD |
| Coach / chat | UI futura | Gemini — Fase 8 |
| PDF plan de acción | Genera (jsPDF) | — |

## Estructura frontend relevante

```
frontend/src/
├── components/
│   ├── onboarding/     # Wizard (4 pasos)
│   ├── results/        # Vacantes, mercado, perfil
│   ├── welcome/        # Landing
│   └── layout/         # Header, footer
├── hooks/
│   ├── useOnboardingForm.js
│   ├── useResultsData.js
│   └── usePdfDownload.js
├── services/
│   ├── api.js          # Cliente Axios
│   └── mockData.js     # Fallback
├── store/
│   └── useProfileStore.js
└── utils/
    ├── session.js
    ├── buildProfilePayload.js
    └── generateAnalysisPdf.js
```
