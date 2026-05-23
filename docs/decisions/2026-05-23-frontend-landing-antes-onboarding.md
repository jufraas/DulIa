# Landing antes del onboarding

- **Fecha:** 2026-05-23
- **Área:** frontend
- **Estado:** activa
- **Autor/es:** Equipo frontend

## Contexto

Demo ante jurado: hay que explicar qué es DulIA, el problema, el flujo y el modelo de negocio antes de pedir datos al usuario.

## Decisión

Implementar una **página de bienvenida** (`WelcomePage`) como paso 0 del flujo, con CTA hacia `/comenzar`.

## Por qué

- Pitch visual en ~30 segundos sin tocar la app.
- Separa marketing/storytelling del formulario funcional.
- Mobile first: scroll vertical con secciones reutilizables.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Ir directo al formulario | Pierde contexto para jurado y usuarios nuevos |
| Landing estática fuera del repo | Más fricción de deploy; rompe flujo SPA |

## Consecuencias

- Rutas: `/` = landing, `/comenzar` = formulario.
- Componentes en `frontend/src/components/welcome/`.
- Header de landing usa anclas internas; onboarding tiene header propio con “Volver”.
