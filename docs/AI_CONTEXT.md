# AI_CONTEXT — DulIA

> Lee esto primero si eres un LLM asistiendo en este proyecto.

## ¿Qué es DulIA?

Plataforma web con IA que actúa como coach de carrera para jóvenes colombianos. El usuario describe su perfil (estudios, habilidades, intereses) y DulIA:
1. Sugiere rutas de carrera personalizadas con vacantes verificadas (🟢🟡🔴).
2. Muestra un termómetro del mercado laboral del Caribe colombiano.
3. Calcula un score de empleabilidad 0-100 por vacante con recomendaciones accionables.
4. Ofrece un coach conversacional con contexto del perfil del usuario.

## Contexto del hackathon

- **Evento:** Barranqui-IA 2026
- **Duración:** 48 horas
- **Fecha de inicio:** 2026-05-23
- **Equipo:** 4-5 personas trabajando en paralelo

## Stack en una línea

`FastAPI` (backend) + `React/Vite/Tailwind` (frontend) + `Gemini API` (IA) + `PostgreSQL/Supabase` (BD)

## Estrategia de datos (actualizada)

- **MVP:** Mock data realista generada con Gemini (30-50 vacantes) cargada en Supabase.
- **Siguiente nivel:** APIs públicas gratuitas — Adzuna (1000 llamadas/mes) y Jooble (LATAM).
- **Scrapers propios:** pospuestos — demasiado riesgo en 48h (captchas, bloqueos, DOM frágil).
- El pipeline escribe en la misma tabla `jobs` sin importar la fuente (mock, Adzuna, Jooble).

## Estado actual

**Fase 10 completa.** Smoke test de 6 endpoints en mock mode — health, profile (POST+GET), jobs/recommended, market/dashboard, coach/chat. Validación 422, Swagger funcional, contrato final en ENDPOINTS.md. Siguiente: Fase 11 — deploy.

## Estructura del backend

```
backend/
├── main.py              → CORS + routers + startup
└── app/
    ├── routes/          → endpoints por dominio
    ├── services/        → lógica de negocio
    ├── models/          → schemas Pydantic
    ├── db/supabase.py   → cliente singleton
    ├── db/gemini.py     → cliente singleton
    └── utils/logger.py  → logger centralizado
```

## Endpoints — contrato final (ver ENDPOINTS.md para detalle)

| Método | Ruta | Fase | Testeado |
|--------|------|------|----------|
| GET | `/api/health` | ✅ Fase 1 | ✅ |
| POST | `/api/profile` | ✅ Fase 4 | ✅ |
| GET | `/api/profile/{session_id}` | ✅ Fase 4 | ✅ |
| GET | `/api/jobs/recommended/{session_id}` | ✅ Fase 6 | ✅ |
| GET | `/api/market/dashboard` | ✅ Fase 7 | ✅ |
| POST | `/api/coach/chat` | ✅ Fase 8 | ✅ |

## Archivos clave

| Archivo | Para qué |
|---------|----------|
| **ENDPOINTS.md** | **Contrato API — fuente de verdad para el frontend** |
| ARCHITECTURE.md | Cómo se conectan los módulos |
| SCHEMA.md | Estructura de datos (tablas en Supabase) |
| PIPELINE_JOBS.md | Contrato `jobs` en inglés para el pipeline |
| PROJECT_STATE.md | Fases y estado por módulo |
| DECISIONS.md | Por qué se tomó cada decisión |
| PROMPTS.md | System prompts de Gemini |

## Regla para cambios de API

Al implementar o modificar un endpoint: actualizar `ENDPOINTS.md` en el mismo cambio. No anidar el onboarding en `respuestas_onboarding` — el body es plano (`OnboardingInput`).

## Notas técnicas importantes

- Python 3.14 + `pydantic>=2.14.0a1` (pre-release): estable en la práctica, funciona en el hackathon.
- CORS abierto (`*`) en dev — restringir al dominio del frontend al deployar.
- Sin autenticación: se usa `session_id` (UUID generado por el frontend) como identificador.
- Supabase proyecto: el del hackathon DulIA (no GravityClaw — ese es personal).
