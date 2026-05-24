# Reemplazo del pool de interviews con fuentes reales

- **Fecha:** 2026-05-24
- **Área:** backend + ia
- **Estado:** activa
- **Autor/es:** Backend B7 (ETL)

## Contexto

El pool inicial (B1, migración 013) tenía 120 preguntas generadas por IA con rúbricas plantilla (`concepto claro`, `ejemplo práctico`, etc.). Funcionaba para la demo, pero reduce la defensibilidad ante un jurado técnico que pregunte por procedencia de las preguntas de entrevista tech.

## Decisión

Reemplazar el contenido de `interview_questions_seed` con un ETL (`backend/scripts/etl_interview_pool/`) que:

1. Descarga preguntas **reales** desde repos GitHub validados por la comunidad (`sudheerj/reactjs-interview-questions`, `sudheerj/javascript-interview-questions`, `arialdomartini/Back-End-Developer-Interview-Questions`) y dataset HuggingFace `ali-alkhars/interviews`.
2. Traduce al español y enriquece con rúbricas específicas vía Gemini (batch).
3. Preserva 108 preguntas no-tech del seed original marcadas honestamente como `fuente='ai_generated'`.
4. Añade trazabilidad: columnas `fuente_url`, `idioma_origen` (migración 014) y valores de `fuente` por origen.

Resultado en prod (2026-05-24): **629 filas** — 521 tech reales + 108 no-tech AI.

## Por qué

- **Procedencia auditable** para tech: cada fila linkea al repo/dataset en `fuente_url`.
- **Pitch defendible:** sudheerj/* tiene +40k stars cada uno; no es “100% inventado por IA”.
- **Cobertura sectorial intacta:** 10 sectores; no-tech sigue en español CO con etiqueta honesta.
- **Flujo híbrido sin cambiar:** Gemini sigue personalizando y evaluando en runtime (B4–B6).

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Scraping InfoJobs/Indeed | Riesgo legal, tiempo, formato inconsistente |
| Solo Gemini (regenerar pool) | Es lo que motivó este bloque — no es “real” |
| Datasets públicos en español multi-sector junior | No existen con volumen y calidad comparable |
| Dejar pool B1 sin cambiar | Rúbricas plantilla y sin trazabilidad en pitch |

## Consecuencias

- ~521 preguntas tech traducidas al español con rúbricas específicas por pregunta.
- Pool no-tech (`ai_generated`) sigue siendo AI-generated y se declara como tal.
- ETL depende de `GEMINI_API_KEY` y caché local (`cache/` en `.gitignore`).
- Migración 015 SQL (362 KB) + aplicación vía PostgREST (atajo pragmático, igual que B1).
- Backup defensivo: tabla `interview_questions_seed_backup_2026_05_24` (120 filas originales).
