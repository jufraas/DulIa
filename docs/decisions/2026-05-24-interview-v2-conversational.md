# Entrevista conversacional V2 — IA como entrevistador

- **Fecha:** 2026-05-24
- **Área:** backend | ia
- **Estado:** activa
- **Autor/es:** DulIA backend (B8)

## Contexto

El simulador V1 (quiz lineal: 5 preguntas pre-generadas + evaluación por respuesta) no refleja una entrevista real. El producto necesita que la IA **conduzca** la conversación por etapas, use el pool de preguntas como contexto (no como guion) y evalúe holísticamente al final.

## Decisión

1. Nueva tabla **`mock_interviews_v2`** con estado conversacional (`turns`, `stage`, `stage_scores`, `pool_snapshot`, `summary`).
2. API REST bajo **`/api/interview/v2/*`** — V1 intacta hasta cutover frontend.
3. Máquina de estados: `rapport → tecnica → behavioral → cierre → finalizada`.
4. Persona fija por sector (8 entrevistadores predefinidos).
5. Pool `interview_questions_seed` se consulta **una vez al iniciar** y se guarda en `pool_snapshot`.
6. Feature flag **`INTERVIEW_V2_ENABLED`** para rollback sin redeploy de código.

## Por qué

- Demuestra valor de IA en pitch (repreguntas, tono humano, etapas reales).
- Reutiliza el pool B7 (629 preguntas) sin re-ETL.
- V1 y V2 en paralelo reducen riesgo; historial unificado con campo `version`.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Reemplazar V1 in-place | Rompe frontend actual de Migue hasta que termine M4 |
| Streaming SSE en MVP | Complejidad extra; latencia Flash aceptable con typing indicator |
| Evaluar cada mensaje con score | Métrica frágil; evaluación por etapa es más estable |

## Consecuencias

- Migración `016` debe aplicarse en Supabase prod.
- 4 prompts nuevos en `PROMPTS.md` (OPENING, TURN, STAGE_EVAL, FINAL_SUMMARY).
- Frontend Migue consume V2 cuando `VITE_INTERVIEW_VERSION=v2`.
- Post-pitch: deprecar V1 si no se usa.
