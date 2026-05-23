# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-23 — Documentación actualizada: sin login, importación CV PDF + MarkItDown.

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Estructura creada |
| Backend (FastAPI) | 🔲 No iniciado | Pendiente: `/profile`, MarkItDown, Gemini |
| Frontend (React+Vite) | 🚧 En progreso | Flujo demo con mock; falta upload CV + deploy |
| Pipeline (scrapers) | 🔲 No iniciado | — |
| Integración Gemini | 🔲 No iniciado | Ver PROMPTS.md |
| Base de datos | 🔲 No definida | Ver SCHEMA.md |
| Deploy | 🔲 No iniciado | — |

## Frontend — avance detallado

| Pantalla / pieza | Estado |
|------------------|--------|
| Landing (bienvenida) | ✅ |
| Footer (contacto, copyright) | ✅ |
| Wizard formulario (3 pasos) | ✅ |
| Pantalla de resultados | ✅ |
| Descarga PDF (jsPDF) | ✅ |
| Integración Axios → backend (fallback mock) | ✅ |
| **Importar CV (PDF) — UI upload** | 🔲 |
| **Envío multipart (profile + cv)** | 🔲 |
| Resumen perfil del usuario en resultados | 🔲 |
| Deploy producción (Vercel) | 🔲 |

## Backend — pendiente (referencia para coordinación)

| Pieza | Estado |
|-------|--------|
| `GET /health` | 🔲 |
| `POST /profile` (JSON) | 🔲 |
| `POST /profile` (multipart + CV) | 🔲 |
| MarkItDown PDF → markdown | 🔲 |
| Prompt Gemini con cv_markdown | 🔲 |
| CORS para frontend | 🔲 |

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completo |
| 🚧 | En progreso |
| 🔲 | No iniciado |
| ❌ | Bloqueado |

## Próximos pasos inmediatos

### Frontend
1. UI importar CV (PDF) en onboarding
2. `submitProfile` con FormData cuando hay archivo
3. Sección “Tu perfil” en resultados
4. Commit rama `FRONT` + deploy Vercel

### Backend (Carlos)
1. `POST /profile` según ENDPOINTS.md
2. Integrar MarkItDown
3. Conectar Gemini con PROMPTS.md
