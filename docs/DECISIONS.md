# DECISIONS — Log de decisiones técnicas

> Registra aquí cada decisión importante: qué se eligió, por qué, y qué alternativas se descartaron.

| Fecha | Decisión | Razón | Alternativas descartadas |
|-------|----------|-------|--------------------------|
| 2026-05-23 | FastAPI para el backend | Rápido de implementar, auto-docs con Swagger, equipo familiar con Python | Django REST, Node/Express |
| 2026-05-23 | React + Vite + Tailwind para el frontend | Setup mínimo, hot reload rápido, Tailwind acelera el diseño | Next.js (overkill para 48h), Vue |
| 2026-05-23 | Gemini como modelo de IA | API gratuita disponible, buen rendimiento en español | OpenAI GPT-4, Claude |
| 2026-05-23 | Landing antes del onboarding | Demo clara para jurado; explica producto y modelo de negocio | Ir directo al formulario |
| 2026-05-23 | Mock local en frontend | Desarrollo y demo sin depender del backend | Hardcodear en componentes |

---

_Agrega una fila cada vez que el equipo tome una decisión técnica relevante._
