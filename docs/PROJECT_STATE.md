# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-23 — PDF de resultados implementado en frontend (jsPDF).

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Estructura creada, primer commit hecho |
| Backend (FastAPI) | 🔲 No iniciado | — |
| Frontend (React+Vite) | 🚧 En progreso | Flujo demo completo con mock; falta formulario ampliado y deploy |
| Pipeline (scrapers) | 🔲 No iniciado | — |
| Integración Gemini | 🔲 No iniciado | — |
| Base de datos | 🔲 No definida | Ver SCHEMA.md |
| Deploy | 🔲 No iniciado | — |

## Frontend — avance detallado

| Pantalla / pieza | Estado |
|------------------|--------|
| Landing (bienvenida) | ✅ |
| Header + nav mobile | ✅ |
| Secciones: problema, cómo funciona, audiencia, modelo de negocio | ✅ |
| Onboarding (formulario perfil) | ✅ |
| Pantalla de resultados | ✅ |
| Integración Axios → backend (fallback mock) | ✅ |
| Descarga PDF (jsPDF) | ✅ |
| Formulario ampliado (wizard 3 pasos) | ✅ |
| Deploy producción | 🔲 |

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completo |
| 🚧 | En progreso |
| 🔲 | No iniciado |
| ❌ | Bloqueado |

## Próximos pasos inmediatos

1. Frontend: commit en rama `FRONT` + deploy (Vercel/Netlify)
2. Backend: implementar `POST /profile` con contrato en ENDPOINTS.md
