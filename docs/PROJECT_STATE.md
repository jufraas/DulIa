# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-23 — Fase 1 completa. Cambio de alcance en pipeline.

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Rama `Backend` activa, docs actualizadas |
| Backend (FastAPI) | 🚧 Fase 2 en curso | Fase 1 ✅ — estructura lista, `/api/health` responde |
| Frontend (React+Vite) | 🔲 No iniciado | Esperando contrato de endpoints (ver ENDPOINTS.md) |
| Pipeline | 🔁 Cambio de alcance | Scrapers pospuestos → mock data + APIs públicas (Adzuna/Jooble) |
| Integración Gemini | 🔲 No iniciado | Cliente listo en `app/db/gemini.py`, faltan prompts |
| Base de datos | 🚧 Fase 2 en curso | Schema diseñado en SCHEMA.md, tablas pendientes de crear |
| Deploy | 🔲 No iniciado | Espera MVP funcional |

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completo |
| 🚧 | En progreso |
| 🔲 | No iniciado |
| 🔁 | Cambio de alcance |
| ❌ | Bloqueado |

## Fases del backend

| Fase | Descripción | Estado |
|------|-------------|--------|
| -1 | Repo + docs + MCPs | ✅ |
| 0 | Entorno + dependencias + Hello World | ✅ |
| 1 | Estructura profesional + CORS + conexiones | ✅ |
| 2 | Schema Supabase + mock data (30-50 vacantes) | 🚧 En curso |
| 3 | Modelos Pydantic | 🔲 |
| 4 | Endpoints de perfil + Gemini extracción | 🔲 |
| 5 | Integración real Gemini | 🔲 |
| 6 | Endpoint vacantes recomendadas + scoring | 🔲 |
| 7 | Termómetro del mercado | 🔲 |
| 8 | Coach conversacional | 🔲 |
| 9 | Seguridad y robustez | 🔲 |
| 10 | Testing + docs finales | 🔲 |
| 11 | Deploy | 🔲 |

## Próximos pasos inmediatos

1. Confirmar proyecto Supabase correcto (DulIA, no GravityClaw)
2. Crear tablas en Supabase vía MCP
3. Generar 30-50 vacantes mock con Gemini e insertar
4. Continuar Fase 3 (modelos Pydantic)
