# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

<<<<<<< Updated upstream
2026-05-23 — Estructura del repositorio inicializada.
=======
2026-05-23 — Onboarding + pantalla de resultados implementados en frontend.
>>>>>>> Stashed changes

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Estructura creada, primer commit hecho |
| Backend (FastAPI) | 🔲 No iniciado | — |
<<<<<<< Updated upstream
| Frontend (React+Vite) | 🔲 No iniciado | — |
=======
| Frontend (React+Vite) | 🚧 En progreso | Landing + onboarding + resultados (mock); falta PDF |
>>>>>>> Stashed changes
| Pipeline (scrapers) | 🔲 No iniciado | — |
| Integración Gemini | 🔲 No iniciado | — |
| Base de datos | 🔲 No definida | Ver SCHEMA.md |
| Deploy | 🔲 No iniciado | — |

<<<<<<< Updated upstream
=======
## Frontend — avance detallado

| Pantalla / pieza | Estado |
|------------------|--------|
| Landing (bienvenida) | ✅ |
| Header + nav mobile | ✅ |
| Secciones: problema, cómo funciona, audiencia, modelo de negocio | ✅ |
| Onboarding (formulario perfil) | ✅ |
| Pantalla de resultados | ✅ |
| Integración Axios → backend (fallback mock) | ✅ |
| Descarga PDF (jsPDF) | 🔲 |

>>>>>>> Stashed changes
## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completo |
| 🚧 | En progreso |
| 🔲 | No iniciado |
| ❌ | Bloqueado |

## Próximos pasos inmediatos

<<<<<<< Updated upstream
1. Definir schema de BD → actualizar SCHEMA.md
2. Definir contrato de endpoints → actualizar ENDPOINTS.md
3. Cada módulo arranca su setup inicial (ver README.md)
=======
1. Frontend: botón descargar PDF en resultados
2. Backend: implementar `POST /profile` con mismo contrato que ENDPOINTS.md
3. Definir schema de BD → actualizar SCHEMA.md
4. Backend: arrancar FastAPI con `/health`
>>>>>>> Stashed changes
