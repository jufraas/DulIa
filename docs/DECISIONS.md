# DECISIONS — Índice de decisiones técnicas

> Detalle completo en [`decisions/`](./decisions/) (un `.md` por decisión).

## Índice rápido

| Fecha | Área | Decisión | Archivo |
|-------|------|----------|---------|
| 2026-05-23 | general | Sin login — flujo anónimo | [decisions/2026-05-23-sin-login-flujo-anonimo.md](./decisions/2026-05-23-sin-login-flujo-anonimo.md) |
| 2026-05-23 | full-stack | CV PDF + MarkItDown → IA | [decisions/2026-05-23-cv-pdf-markitdown.md](./decisions/2026-05-23-cv-pdf-markitdown.md) |
| 2026-05-23 | backend | FastAPI | Tabla abajo |
| 2026-05-23 | frontend | React + Vite + Tailwind | Tabla abajo |
| 2026-05-23 | ia | Google Gemini | Tabla abajo |
| 2026-05-23 | frontend | Landing antes del onboarding | Tabla abajo |
| 2026-05-23 | frontend | Mock fallback API | Tabla abajo |

## Decisiones stack (resumen)

| Fecha | Decisión | Razón | Alternativas descartadas |
|-------|----------|-------|--------------------------|
| 2026-05-23 | FastAPI para el backend | Rápido, Swagger, Python + MarkItDown | Django REST, Node/Express |
| 2026-05-23 | React + Vite + Tailwind | Setup mínimo, mobile first | Next.js, Vue |
| 2026-05-23 | Gemini como modelo de IA | Gratis, buen español | OpenAI, Claude |
| 2026-05-23 | Landing antes del onboarding | Pitch para jurado | Ir directo al formulario |
| 2026-05-23 | Mock local en frontend | Demo sin backend | Hardcode en componentes |

## Cómo agregar una decisión

1. Copia [`decisions/_TEMPLATE.md`](./decisions/_TEMPLATE.md).
2. Guárdala como `decisions/YYYY-MM-DD-[area]-[slug].md`.
3. Añádela al índice en [`decisions/README.md`](./decisions/README.md) y aquí.
