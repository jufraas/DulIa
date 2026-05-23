# DECISIONS — Log de decisiones técnicas

> Registra aquí cada decisión importante: qué se eligió, por qué, y qué alternativas se descartaron.

| Fecha | Decisión | Razón | Alternativas descartadas |
|-------|----------|-------|--------------------------|
| 2026-05-23 | FastAPI para el backend | Rápido de implementar, auto-docs con Swagger, equipo familiar con Python | Django REST, Node/Express |
| 2026-05-23 | React + Vite + Tailwind para el frontend | Setup mínimo, hot reload rápido, Tailwind acelera el diseño | Next.js (overkill para 48h), Vue |
| 2026-05-23 | Gemini como modelo de IA | API gratuita disponible, buen rendimiento en español | OpenAI GPT-4, Claude |
| 2026-05-23 | pydantic>=2.14.0a1 (pre-release) | Python 3.14 no tiene wheel estable de pydantic-core 2.x; pre-release sí lo tiene | Downgrade Python, compilar desde fuente |

---

_Agrega una fila cada vez que el equipo tome una decisión técnica relevante._
