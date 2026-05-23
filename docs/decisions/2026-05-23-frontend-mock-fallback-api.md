# Mock local como fallback de la API

- **Fecha:** 2026-05-23
- **Área:** frontend
- **Estado:** activa
- **Autor/es:** Equipo frontend

## Contexto

Backend y frontend avanzan en paralelo. La demo no puede depender de que FastAPI esté listo, ni de CORS configurado, en cada prueba.

## Decisión

En `frontend/src/services/api.js`, `submitProfile()` intenta `POST /api/profile` y, si falla, devuelve el mock de `Mock_Response.js` tras un delay corto (~1.2 s).

## Por qué

- Demo siempre funcional en el pitch.
- Frontend puede desarrollar resultados y PDF sin bloquearse.
- El shape del mock documenta el contrato esperado en [`../ENDPOINTS.md`](../ENDPOINTS.md).

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Hardcodear respuesta en el componente | Duplicación; difícil de mantener |
| Bloquear UI si no hay backend | Rompe demo del hackathon |
| MSW / json-server | Más setup del necesario en 48 h |

## Consecuencias

- Cuando backend esté listo, el mismo `submitProfile` usará datos reales sin cambiar la UI.
- Hay que alinear JSON request/response con backend antes de producción.
- El delay simula IA; quitar o reducir cuando haya latencia real.
