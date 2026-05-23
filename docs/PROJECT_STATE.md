# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-23 — Frontend: rebrand, scaffolding por componentes, CV upload, multipart, resumen perfil.

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Estructura creada |
| Backend (FastAPI) | 🚧 En progreso | Módulo `markitdown/` + `POST /profile` stub; falta Gemini |
| Frontend (React+Vite) | 🚧 En progreso | Flujo demo completo; falta deploy |
| Pipeline (scrapers) | 🔲 No iniciado | — |
| Integración Gemini | 🔲 No iniciado | Ver PROMPTS.md |
| Base de datos | 🔲 No definida | Ver SCHEMA.md |
| Deploy | 🔲 No iniciado | Vercel listo (`vercel.json`) |

## Frontend — avance detallado

| Pantalla / pieza | Estado |
|------------------|--------|
| Landing (bienvenida) + rebrand DulIA | ✅ |
| Footer (contacto, copyright) | ✅ |
| Wizard formulario (3 pasos) | ✅ |
| Scaffolding por componentes (`COMPONENT_OWNERS.md`) | ✅ |
| Pantalla de resultados + score ring | ✅ |
| Descarga PDF (jsPDF, colores marca) | ✅ |
| Integración Axios → backend (fallback mock) | ✅ |
| Importar CV (PDF) — UI upload | ✅ |
| Envío multipart (profile + cv) | ✅ |
| Resumen perfil del usuario en resultados | ✅ |
| Aviso flujo sin sesión | ✅ |
| Deploy producción (Vercel) | 🔲 |

## Backend — pendiente (referencia para coordinación)

| Pieza | Estado |
|-------|--------|
| `GET /health` | ✅ stub |
| `POST /profile` (JSON) | ✅ stub + mock |
| `POST /profile` (multipart + CV) | ✅ MarkItDown en `backend/markitdown/` |
| MarkItDown PDF → markdown | ✅ |
| Prompt Gemini con cv_markdown | 🚧 vars listas; falta llamada API |
| CORS para frontend | ✅ |

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
1. `POST /profile` según ENDPOINTS.md
2. Integrar MarkItDown
3. Conectar Gemini con PROMPTS.md
