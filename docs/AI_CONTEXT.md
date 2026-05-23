# AI_CONTEXT — DulIA

> Lee esto primero si eres un LLM asistiendo en este proyecto.

## ¿Qué es DulIA?

Plataforma web con IA — coach de carrera para jóvenes colombianos. **Sin login:** el visitante completa un wizard, recibe vacantes con score de compatibilidad, explora un panel con semáforo y descarga un PDF con su plan. Incluye coach conversacional vía API.

1. Captura perfil en wizard (**3 pasos**, campos en español).
2. Backend guarda perfil por `session_id` (UUID en `localStorage`).
3. Backend calcula matching con vacantes y expone dashboard de mercado.
4. Frontend muestra resultados y genera PDF (jsPDF).
5. Coach: `POST /api/coach/chat` (backend Fase 8 ✅).

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
Onboarding (/comenzar, 3 pasos) ──► POST /profile
     │
     ├──► POST /profile/{id}/analyze
     ├──► POST /profile/{id}/action-plan
     ├──► GET /jobs/recommended/{session_id}
     ├──► GET /market/dashboard
     ├──► GET /profile/{id}/radar-data
     └──► GET /profile/{id}/timeline-data
     │
     ▼
Resultados (/resultados) ──► Vacantes (/vacantes) ──► PDF
```

- `session_id` en `localStorage` (`dulia_session_id`).
- Estado UI en Zustand; refresh sin perfil redirige a `/comenzar`.
- UI kit ReBrand: `frontend/ReBrand/DulIA Design System (1)/`.

## Rutas y dueños frontend

| Ruta | Pantalla | Dueño |
|------|----------|-------|
| `/` | Landing | Compañero |
| `/sobre` | Sobre DulIA | **Migue** |
| `/comenzar` | Wizard | Compartido |
| `/resultados` | Resultados | Compañero |
| `/vacantes` | Vacantes | Compañero |

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
| GET | `/api/profile/{session_id}` | ✅ |
| GET | `/api/jobs/recommended/{session_id}` | ✅ |
| GET | `/api/market/dashboard` | ✅ |
| POST | `/api/coach/chat` | ✅ |
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
- `USE_MOCK_DATA=true`: backend responde sin Supabase/Gemini; `GET /profile` devuelve 404 en mock.
