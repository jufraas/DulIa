# Progreso plan 30/60/90 — completed_tasks como JSONB

- **Fecha:** 2026-05-24
- **Área:** backend
- **Estado:** activa
- **Autor/es:** CTO backend (hackathon)

## Contexto

El frontend necesita marcar tareas completadas del plan 30/60/90 y ver porcentajes de avance. El plan ya vive en `action_plans` como JSONB generado por Gemini.

## Decisión

1. Tabla **`plan_progress`** con **`completed_tasks` JSONB** (array de strings), no tabla relacional `plan_task_completions`.
2. **Convención `task_id`:** `"fase_30:semana_1:idx_0"` — fase numérica, semana del campo `acciones[].semana`, índice dentro de esa semana (0-based).
3. Desbloqueo: fase **60** si fase 30 ≥ **80%** completada; fase **90** si fase 60 ≥ **80%**.

## Por qué

- Hackathon: menos joins, menos migraciones, PATCH atómico en una fila.
- El plan es read-only desde progreso; solo cambia qué IDs están en el array.
- IDs compuestos estables sin depender de UUIDs por tarea en el JSON de Gemini.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Tabla `task_completions(profile_id, task_id)` | Más queries y schema; overkill para MVP |
| Hash del texto de la tarea | Gemini puede reformular wording entre regeneraciones |
| Solo índice flat `fase_30:0` | Pierde semana UI que ya muestra el front |

## Consecuencias

- Si el plan se **regenera** y cambian semanas/cantidad de acciones, algunos `task_id` viejos quedan huérfanos (se ignoran al calcular %).
- Post-hackathon: migración de IDs si cambia el schema del plan.
