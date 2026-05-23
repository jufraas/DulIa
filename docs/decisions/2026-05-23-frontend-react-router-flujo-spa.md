# Rutas SPA con React Router

- **Fecha:** 2026-05-23
- **Área:** frontend
- **Estado:** activa
- **Autor/es:** Equipo frontend

## Contexto

El flujo del producto tiene pasos claros (bienvenida → perfil → resultados). Se necesitan URLs compartibles y navegación sin recargar la página.

## Decisión

Usar **react-router-dom** con tres rutas:

| Ruta | Pantalla |
|------|----------|
| `/` | Landing (`WelcomePage`) |
| `/comenzar` | Formulario (`OnboardingPage`) |
| `/resultados` | Análisis (`ResultsPage`) |

Configurado en `frontend/src/App.jsx`.

## Por qué

- CTAs de la landing apuntan a `/comenzar` con `Link`.
- Resultados protegidos: si no hay data en store, redirect a `/comenzar`.
- Ya estaba en dependencias; cero config extra vs Next.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Todo en una sola página con `useState` | URLs feas; back del navegador confuso |
| Next.js App Router | Ver decisión stack frontend |

## Consecuencias

- Deploy SPA: servidor debe reescribir rutas a `index.html` (Vercel/Netlify lo hacen por defecto).
- Estado entre rutas vía Zustand (no query params con PII).
