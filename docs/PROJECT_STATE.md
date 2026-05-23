# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-23 — Frontend migrado al contrato real de Carlos (session_id, JSON, jobs + market).

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Estructura creada |
| Backend (FastAPI) | 🚧 En progreso | Contrato session_id + jobs/market; MarkItDown opcional |
| Frontend (React+Vite) | 🚧 En progreso | Migración API completa; falta deploy |
| Pipeline (scrapers) | 🔲 No iniciado | — |
| Integración Gemini | 🔲 No iniciado | Ver PROMPTS.md |
| Base de datos | 🔲 No definida | Ver SCHEMA.md |
| Deploy | 🔲 No iniciado | Vercel listo (`vercel.json`) |

## Frontend — avance detallado

| Pantalla / pieza | Estado |
|------------------|--------|
| Landing (bienvenida) + rebrand DulIA | ✅ |
| Footer (contacto, copyright) | ✅ |
| Wizard formulario (4 pasos) | ✅ |
| Scaffolding por componentes (`COMPONENT_OWNERS.md`) | ✅ |
| Pantalla de resultados (jobs + termómetro mercado) | ✅ |
| Descarga PDF (jsPDF, jobs + market) | ✅ |
| Integración Axios → API Carlos (fallback mock) | ✅ |
| session_id en localStorage | ✅ |
| Resumen perfil del usuario en resultados | ✅ |
| Aviso flujo sin sesión | ✅ |
| Deploy producción (Vercel) | 🔲 |

## Backend — pendiente (referencia para coordinación)

| Pieza | Estado |
|-------|--------|
| `GET /health` con `mock_data` | 🚧 |
| `POST /profile` (JSON + session_id) | 🚧 |
| `GET /jobs/recommended/{session_id}` | 🚧 |
| `GET /market/dashboard` | 🚧 |
| MarkItDown PDF → markdown | ✅ módulo listo (fase posterior) |
| Coach / chat (Fase 8) | 🔲 |

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completo |
| 🚧 | En progreso |
| 🔲 | No iniciado |
| ❌ | Bloqueado |

## Próximos pasos inmediatos

### Frontend
1. Deploy Vercel (root: `frontend`, env `VITE_API_URL`)
2. Commit rama `FRONT`
3. Compañero: pulir landing/resultados en sus archivos asignados

### Backend (Carlos)
1. Implementar endpoints según `docs/ENDPOINTS.md`
2. Conectar Gemini con PROMPTS.md
3. Coach / chat cuando esté listo Fase 8
