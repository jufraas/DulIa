# AI_CONTEXT — DulIA

> Lee esto primero si eres un LLM asistiendo en este proyecto.

## ¿Qué es DulIA?

Plataforma web con IA — coach de carrera para jóvenes colombianos. **Sin login:** el visitante completa un wizard, recibe vacantes con score de compatibilidad, explora un panel con semáforo y descarga un PDF con su plan. Incluye coach conversacional vía API.

1. Captura perfil en wizard (**3 pasos**, campos en español).
2. Backend guarda perfil por `session_id` (UUID en `localStorage`).
3. Backend calcula matching con vacantes y expone dashboard de mercado.
4. Frontend muestra resultados, plan 30d (store) y genera PDF (jsPDF).
5. Coach: `postCoachChat()` → `POST /api/coach/chat` (API ✅; UI burbuja pendiente Joufra).
6. Plan: `getPlan()` → `GET /api/plan/{session_id}` (front ✅; backend Carlos pendiente).

## Contexto del hackathon

- **Evento:** Barranqui-IA 2026
- **Duración:** 48 horas
- **Equipo:** 4-5 personas en paralelo

## Stack

`FastAPI` + `React/Vite/Tailwind` + `PostgreSQL/Supabase` + `Gemini API` + pipeline (mock / Adzuna)

## Flujo frontend (SPA)

```
Landing (/) ──► Sobre DulIA (/sobre) [opcional]
     │
     ▼
Onboarding (/comenzar, 3 pasos)
     │  paso 0: POST /profile/parse-cv (opcional)
     ▼
POST /profile ──► GET jobs + market + plan (paralelo)
     │
     ▼
Resultados (/resultados) ──► Vacantes (/vacantes) ──► PDF
     │  (score, plan 30d, Match Radar)
     │                              │
     └── Coach (UI Joufra) ─────────┘ postCoachChat()
     ▲
     └── refresh OK: rehidratación (cache + GET /profile)
```

- `session_id` en `localStorage` (`dulia_session_id`).
- Estado UI en Zustand; cache en `dulia_session_data` para sobrevivir refresh.
- Borrador del wizard en `dulia_wizard_draft` si refresca en `/comenzar`.
- UI kit ReBrand: `frontend/ReBrand/DulIA Design System (1)/`.
- **Landing motion:** `framer-motion` + `RevealOnScroll` (splash en `WelcomePage`, hero `trigger="mount"`, secciones `trigger="scroll"`).
- **Resultados:** `RadarMatch.jsx` montado; datos desde store vía `radarMatchData.js` (ejes estimados hasta endpoint dedicado).

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
| Frontend | 🚧 Kit ReBrand integrado; falta deploy |
| Pipeline | 🚧 Datos en `jobs` pendientes |
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
| GET | `/api/market/dashboard` | ✅ |
| POST | `/api/coach/chat` | ✅ |
| GET | `/api/plan/{session_id}` | 🚧 contrato listo; backend pendiente |

## Archivos clave

| Archivo | Para qué |
|---------|----------|
| [ENDPOINTS.md](ENDPOINTS.md) | **Contrato API — fuente de verdad** |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Módulos y flujo |
| [SCHEMA.md](SCHEMA.md) | Tablas Supabase |
| [PROJECT_STATE.md](PROJECT_STATE.md) | Estado por módulo |
| [PROMPTS.md](PROMPTS.md) | Prompts Gemini |
| [frontend/COMPONENT_OWNERS.md](../frontend/COMPONENT_OWNERS.md) | División frontend |
| [decisions/2026-05-23-frontend-landing-animations.md](decisions/2026-05-23-frontend-landing-animations.md) | Splash + scroll animations landing |
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
- API cliente: `postCoachChat`, `getPlan`, `createProfile`, `parseCvPdf`, jobs, market — fallbacks en `mock*.js`.
- Post-MVP (login, timeline plan): ver [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md).
