# Frontend React + Vite + Tailwind

- **Fecha:** 2026-05-23
- **Área:** frontend
- **Estado:** activa
- **Autor/es:** Equipo frontend

## Contexto

UI demostrable en pocas horas, mobile first, sin tiempo para configurar un framework full-stack.

## Decisión

**React 19 + Vite 8 + Tailwind CSS 4** en `frontend/`, sin Next.js.

## Por qué

- Vite: HMR rápido, setup mínimo.
- Tailwind: diseño responsive sin escribir CSS custom masivo.
- React: ecosistema conocido (router, zustand, lucide, jsPDF).
- SPA suficiente para flujo lineal del hackathon.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Next.js | Overkill para 48 h; SSR/SSG no necesarios en la demo |
| Vue | Menos familiaridad en el equipo frontend |

## Consecuencias

- Una SPA con rutas client-side (`react-router-dom`).
- Estilos en utilidades Tailwind; `index.css` solo para base global.
- Deploy estático posible (build `dist/`).
