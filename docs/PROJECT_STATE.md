# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-23 — Landing page del frontend implementada (bienvenida + modelo de negocio).

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Estructura creada, primer commit hecho |
| Backend (FastAPI) | 🔲 No iniciado | — |
| Frontend (React+Vite) | 🚧 En progreso | Landing responsive lista; mock en `Mock_Response.js`; falta onboarding y resultados |
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
| Onboarding (formulario perfil) | 🔲 |
| Pantalla de resultados + PDF | 🔲 |
| Integración Axios → backend | 🔲 |

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completo |
| 🚧 | En progreso |
| 🔲 | No iniciado |
| ❌ | Bloqueado |

## Próximos pasos inmediatos

1. Frontend: pantalla de onboarding + conectar CTA de la landing
2. Acordar contrato JSON de `POST /profile` → actualizar ENDPOINTS.md
3. Definir schema de BD → actualizar SCHEMA.md
4. Backend: arrancar FastAPI con `/health` y `/profile`
