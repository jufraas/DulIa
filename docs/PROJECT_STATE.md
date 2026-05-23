# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-23 — Fase 10 completa: smoke test de 6 endpoints en mock mode, validación 422 verificada, Swagger funcional, contrato final en ENDPOINTS.md.

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Rama `Backend` activa, docs actualizadas |
| Backend (FastAPI) | 🚧 Fases 0-9 | API completa + seguridad mínima |
| Frontend (React+Vite) | 🔲 No iniciado | Integrar contra `docs/ENDPOINTS.md` |
| Pipeline | 🔁 Cambio de alcance | Insertar mock en `jobs` |
| Integración Gemini | ✅ | Rate limit 10/min en profile y coach |
| Base de datos | 🚧 Schema listo | Datos pendientes pipeline |
| Deploy | 🔲 No iniciado | Configurar `CORS_ORIGINS` en Railway/Render |

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
| 2 | Schema Supabase + mock data | 🚧 Tablas ✅, datos pendientes pipeline |
| 3 | Modelos Pydantic | ✅ |
| 4 | Endpoints de perfil + Gemini extracción | ✅ |
| 5 | Integración real Gemini | ✅ |
| 6 | Vacantes recomendadas + scoring | ✅ |
| 7 | Termómetro del mercado | ✅ |
| 8 | Coach conversacional | ✅ |
| 9 | Seguridad y robustez | ✅ |
| 10 | Testing + docs finales | ✅ |
| 11 | Deploy | 🔲 |

## Próximos pasos inmediatos

1. Fase 11 — deploy con `APP_ENV=production` y `CORS_ORIGINS=<url-front>`
2. Pipeline — vacantes en `jobs`
