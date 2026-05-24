# Rate limits asimétricos en mock interview

- **Fecha:** 2026-05-24
- **Área:** backend
- **Estado:** activa
- **Autor/es:** CTO backend (hackathon)

## Contexto

Los endpoints de entrevista simulada llaman a Gemini en `/start` (generación de preguntas), `/answer` (evaluación) y `/finish` (feedback final). En demo en vivo, un usuario puede completar 1 entrevista = 1 start + 5 answers + 1 finish = 7 llamadas IA.

## Decisión

| Endpoint | Rate limit |
|----------|------------|
| `POST /interview/start` | 5/min por IP |
| `POST /interview/{id}/answer` | 10/min por IP |
| `POST /interview/{id}/finish` | 3/min por IP |
| `GET /interview/history/{session_id}` | Sin límite |

Configurable vía `.env`: `RATE_LIMIT_INTERVIEW_START`, `RATE_LIMIT_INTERVIEW_ANSWER`, `RATE_LIMIT_INTERVIEW_FINISH`.

## Por qué

- Una entrevista completa cabe cómodamente dentro de los límites (5 answers + margen).
- `/finish` es la llamada más costosa (resumen + síntesis) → límite más estricto.
- `/history` es read-only barato → sin throttle.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Mismo 10/min que coach | Permite spam de starts caros |
| Sin rate limit | Riesgo de agotar cuota Gemini en pitch |
| Rate limit por session_id | Más complejo; IP suficiente en hackathon |

## Consecuencias

- Front debe manejar **429** con mensaje amigable.
- Pre-cache de entrevistas demo queda como mejora opcional post-B5.
