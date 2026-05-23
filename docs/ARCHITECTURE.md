# ARCHITECTURE — Arquitectura de DulIA

## Diagrama general

```
┌─────────────┐     HTTP/REST      ┌─────────────────────┐
│   Frontend  │ ◄────────────────► │      Backend        │
│ React+Vite  │                    │  FastAPI + Uvicorn  │
│  Tailwind   │                    │                     │
└─────────────┘                    └────────┬────────────┘
                                            │
                              ┌─────────────┼──────────────┐
                              │             │              │
                    ┌─────────▼──────┐  ┌───▼───┐  ┌──────▼──────┐
                    │  Base de datos │  │  BD   │  │ Gemini API  │
                    │  (por definir) │  │  ...  │  │  (Google)   │
                    └────────────────┘  └───────┘  └─────────────┘
                              ▲
                    ┌─────────┴──────┐
                    │    Pipeline    │
                    │  scrapers.py   │
                    └────────────────┘
```

## Módulos

### `backend/`
- Expone la API REST que consume el frontend.
- Orquesta llamadas a Gemini con los prompts de `docs/PROMPTS.md`.
- Lee datos de la BD (ofertas scrapeadas + perfiles de usuario).
- **Responsable:** Carlos

#### Estructura interna del backend

```
backend/
├── main.py              → entrada: carga .env, registra routers, configura CORS
├── requirements.txt
├── .env                 → credenciales reales (NO en repo)
├── .env.example         → plantilla pública
└── app/
    ├── routes/          → endpoints FastAPI (un archivo por dominio)
    ├── services/        → lógica de negocio (matching, scoring, coach)
    ├── models/          → schemas Pydantic (request/response)
    ├── db/
    │   ├── supabase.py  → cliente Supabase singleton
    │   └── gemini.py    → cliente Gemini singleton
    └── utils/
        └── logger.py    → logger centralizado
```

### `frontend/`
- SPA con flujo: onboarding del usuario → llamada a la API → visualización de resultados.
- No contiene lógica de negocio; todo va al backend.
- **Responsable:** Migue

### `pipeline/`
- Corre de forma independiente (puede ser un cron job o script manual).
- Scrapea portales de empleo colombianos y escribe resultados en la BD.
- No depende del backend para funcionar.
- **Responsable:** Jose

### `docs/`
- Documentación compartida. Fuente de verdad del equipo.
- Cada módulo debe actualizar los archivos relevantes al hacer cambios de contrato.

## Flujo principal (happy path)

1. Usuario llena formulario de perfil en el **frontend**.
2. Frontend hace `POST /api/profile` al **backend**.
3. Backend construye prompt con el perfil + ofertas de la **BD**.
4. Backend llama a **Gemini** y recibe recomendaciones.
5. Backend responde con JSON de recomendaciones.
6. Frontend muestra resultados al usuario.

## Comunicación entre módulos

| De | A | Protocolo |
|----|---|-----------|
| Frontend | Backend | HTTP REST (JSON) |
| Backend | Gemini | HTTPS (SDK de Google) |
| Backend | BD | Driver nativo (por definir) |
| Pipeline | BD | Driver nativo (por definir) |
