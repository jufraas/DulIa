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

### `frontend/`
- SPA con flujo: **landing (bienvenida)** → onboarding del usuario → llamada a la API → visualización de resultados (+ PDF).
- Mobile first, Tailwind 4, componentes reutilizables en `src/components/`.
- No contiene lógica de negocio; todo va al backend.
- Mock local: `src/Mock_Response.js` (fallback si backend no está listo).
- **Responsable:** Compa 1

### `pipeline/`
- Corre de forma independiente (puede ser un cron job o script manual).
- Scrapea portales de empleo colombianos y escribe resultados en la BD.
- No depende del backend para funcionar.
- **Responsable:** Compa 2

### `docs/`
- Documentación compartida. Fuente de verdad del equipo.
- Cada módulo debe actualizar los archivos relevantes al hacer cambios de contrato.

## Flujo principal (happy path)

0. Usuario ve **landing** con propuesta de valor y modelo de negocio.
1. Usuario llena formulario de perfil en el **frontend** (onboarding).
2. Frontend hace `POST /api/profile` al **backend**.
3. Backend construye prompt con el perfil + ofertas de la **BD**.
4. Backend llama a **Gemini** y recibe recomendaciones.
5. Backend responde con JSON de recomendaciones.
6. Frontend muestra resultados al usuario (score, oportunidades, roadmap, PDF).

## Comunicación entre módulos

| De | A | Protocolo |
|----|---|-----------|
| Frontend | Backend | HTTP REST (JSON) |
| Backend | Gemini | HTTPS (SDK de Google) |
| Backend | BD | Driver nativo (por definir) |
| Pipeline | BD | Driver nativo (por definir) |
