# ARCHITECTURE — Arquitectura de DulIA

## Diagrama general

```
┌─────────────┐     HTTP/REST      ┌─────────────────────┐
│   Frontend  │ ◄────────────────► │      Backend        │
│ React+Vite  │                    │  FastAPI + Uvicorn  │
│  Tailwind   │                    │                     │
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
                    │ mock / APIs    │
                    └────────────────┘
```

## Módulos

### `backend/`
- Expone la API REST que consume el frontend (`docs/ENDPOINTS.md`).
- Extrae perfiles con Gemini (`profile_service`) y calcula scoring (`jobs_service`).
- Agrega estadísticas de mercado sobre `jobs` (`market_service`).
- **Responsable:** Carlos

#### Estructura interna del backend

```
backend/
├── main.py              → entrada: carga .env, registra routers, configura CORS
├── requirements.txt
├── .env                 → credenciales reales (NO en repo)
├── .env.example         → plantilla pública
└── app/
    ├── routes/          → health, profile, jobs, market, coach
    ├── services/        → profile_service, jobs_service, market_service, coach_service
    ├── models/          → schemas Pydantic (request/response)
    ├── db/
    │   ├── supabase.py  → cliente Supabase singleton
    │   └── gemini.py    → cliente Gemini singleton
    └── utils/
        ├── logger.py    → logger centralizado
        ├── limiter.py   → slowapi (10/min en rutas Gemini)
        └── cors.py      → orígenes según APP_ENV
```

### `frontend/`
- SPA: onboarding → perfil → vacantes con score → termómetro de mercado → coach (pendiente).
- Sin lógica de negocio; contrato en `docs/ENDPOINTS.md`.
- **Responsable:** Migue

### `pipeline/`
- Inserta vacantes en Supabase tabla `jobs` (mock Gemini, Adzuna, Jooble).
- No depende del backend en runtime.
- **Responsable:** Jose

### `docs/`
- Documentación compartida. **Actualizar `ENDPOINTS.md` al cambiar el contrato de la API.**

## Flujo principal (happy path)

1. Frontend genera `session_id` (UUID en `localStorage`).
2. Usuario completa onboarding → `POST /api/profile`.
3. Backend estructura perfil (Gemini) y guarda en `profiles`.
4. Frontend pide vacantes → `GET /api/jobs/recommended/{session_id}`.
5. Backend lee perfil + `jobs` activos, calcula score 0–100, devuelve top 20 (sin rojas).
6. Frontend pide mercado → `GET /api/market/dashboard?city=...`.
7. Coach → `POST /api/coach/chat` con contexto del perfil y prompt `CAREER_COACH_SYSTEM`.

## Comunicación entre módulos

| De | A | Protocolo |
|----|---|-----------|
| Frontend | Backend | HTTP REST (JSON) — ver `ENDPOINTS.md` |
| Backend | Gemini | HTTPS (google-generativeai) |
| Backend | Supabase | supabase-py (PostgREST) |
| Pipeline | Supabase | Inserción directa en `jobs` |

## Modo desarrollo sin credenciales

`USE_MOCK_DATA=true` en `.env` del backend:
- Salta Supabase y Gemini en servicios que lo soportan.
- Permite al frontend integrar contra respuestas estables.
- `GET /profile` devuelve 404 en mock (el POST no persiste); el front puede guardar la respuesta del POST en estado local.
