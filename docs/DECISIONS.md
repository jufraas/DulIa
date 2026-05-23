# DECISIONS — Log de decisiones técnicas

> Registra aquí cada decisión importante: qué se eligió, por qué, y qué alternativas se descartadas.

| Fecha | Decisión | Razón | Alternativas descartadas |
|-------|----------|-------|--------------------------|
| 2026-05-23 | FastAPI para el backend | Rápido de implementar, auto-docs con Swagger, equipo familiar con Python | Django REST, Node/Express |
| 2026-05-23 | React + Vite + Tailwind para el frontend | Setup mínimo, hot reload rápido, Tailwind acelera el diseño | Next.js (overkill para 48h), Vue |
| 2026-05-23 | Gemini como modelo de IA | API gratuita disponible, buen rendimiento en español | OpenAI GPT-4, Claude |
| 2026-05-23 | pydantic>=2.14.0a1 (pre-release) | Python 3.14 no tiene wheel estable de pydantic-core 2.x; pre-release sí lo tiene | Downgrade Python, compilar desde fuente |
| 2026-05-23 | Posponer scrapers propios → mock data + APIs públicas | En 48h el scraping es alto riesgo (captchas, bloqueos, DOM frágil). Mock data + Adzuna/Jooble da el mismo resultado con mucho menos riesgo | BeautifulSoup + Playwright en Computrabajo/El Empleo |
| 2026-05-23 | Mock data generada con Gemini como base del MVP | Permite desarrollar todos los endpoints contra datos realistas sin depender del pipeline. Gemini genera vacantes creíbles del mercado colombiano | Hardcodear vacantes manualmente, esperar scraper |
| 2026-05-23 | Sin autenticación en el hackathon — identificador por session_id | Evita setup de auth (registro, login, tokens). El session_id es un UUID generado por el frontend en localStorage | Supabase Auth, JWT propio |

---

_Agrega una fila cada vez que el equipo tome una decisión técnica relevante._
