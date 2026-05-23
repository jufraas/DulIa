# Decisiones técnicas — DulIA

Cada decisión importante del proyecto vive en **un archivo `.md` propio** dentro de esta carpeta.

## Cómo agregar una decisión

1. Copia [`_TEMPLATE.md`](./_TEMPLATE.md).
2. Nómbrala: `YYYY-MM-DD-[area]-[slug-corto].md`  
   Ejemplo: `2026-05-23-frontend-mock-fallback.md`
3. Completa contexto, decisión, por qué y alternativas.
4. Añade una fila al índice de abajo y en [`../DECISIONS.md`](../DECISIONS.md).

## Índice

### General / stack

| Fecha | Archivo | Resumen |
|-------|---------|---------|
| 2026-05-23 | [2026-05-23-backend-fastapi.md](./2026-05-23-backend-fastapi.md) | Backend en FastAPI |
| 2026-05-23 | [2026-05-23-frontend-react-vite-tailwind.md](./2026-05-23-frontend-react-vite-tailwind.md) | Frontend React + Vite + Tailwind |
| 2026-05-23 | [2026-05-23-ia-gemini.md](./2026-05-23-ia-gemini.md) | IA con Google Gemini |

### Frontend

| Fecha | Archivo | Resumen |
|-------|---------|---------|
| 2026-05-23 | [2026-05-23-frontend-landing-antes-onboarding.md](./2026-05-23-frontend-landing-antes-onboarding.md) | Landing antes del formulario |
| 2026-05-23 | [2026-05-23-frontend-mock-fallback-api.md](./2026-05-23-frontend-mock-fallback-api.md) | Mock si el backend no responde |
| 2026-05-23 | [2026-05-23-frontend-react-router-flujo-spa.md](./2026-05-23-frontend-react-router-flujo-spa.md) | Rutas `/`, `/comenzar`, `/resultados` |
| 2026-05-23 | [2026-05-23-frontend-zustand-estado-perfil.md](./2026-05-23-frontend-zustand-estado-perfil.md) | Zustand para perfil y resultados |

### Backend

| Fecha | Archivo | Resumen |
|-------|---------|---------|
| — | _Pendiente_ | Agregar cuando backend tome decisiones |

### Pipeline / IA

| Fecha | Archivo | Resumen |
|-------|---------|---------|
| — | _Pendiente_ | Agregar cuando pipeline o prompts definan decisiones |
