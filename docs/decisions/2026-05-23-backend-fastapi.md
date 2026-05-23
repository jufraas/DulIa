# Backend en FastAPI

- **Fecha:** 2026-05-23
- **Área:** backend
- **Estado:** activa
- **Autor/es:** Carlos (backend)

## Contexto

Hackathon de 48 h. Se necesita una API REST que exponga perfil, recomendaciones y salud del servicio, con documentación automática para que frontend y backend trabajen en paralelo.

## Decisión

Usar **Python 3.12 + FastAPI + Uvicorn** en `backend/`.

## Por qué

- Arranque rápido y poco boilerplate.
- Swagger/OpenAPI out of the box (`/docs`) — el frontend ve el contrato sin esperar.
- El equipo backend domina Python.
- Encaja con scrapers/pipeline también en Python.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Django REST | Más pesado para 48 h; más configuración inicial |
| Node/Express | Menos alineado con pipeline e IA en Python del equipo |

## Consecuencias

- Contrato en [`../ENDPOINTS.md`](../ENDPOINTS.md).
- Integración Gemini desde el mismo stack Python.
- CORS y `POST /api/profile` deben definirse pronto para dejar de depender del mock del frontend.
