# Tareas de refuerzo in-place en action_plans

- **Fecha:** 2026-05-24
- **Área:** backend
- **Estado:** activa
- **Autor/es:** CTO backend (hackathon)

## Contexto

Tras una entrevista simulada, el frontend quiere inyectar `weak_skills` como tareas nuevas en el plan 30/60/90.

## Decisión

**Opción (a):** modificar `action_plans.fase_30.acciones` in-place vía `append_reinforcement_tasks()`.

Cada tarea incluye `"fuente": "mock_interview"` para distinguirla del plan generado por Gemini.

## Por qué

- Sin migración nueva (B6 indicaba no tocar SCHEMA.md).
- El frontend ya consume `action-plan`; verá las tareas extra al refetch.
- Menos piezas que tabla `plan_extensions` o columna `extra_tasks`.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| `plan_progress.extra_tasks` jsonb | Requiere migración + lógica dual en stats |
| Tabla `plan_extensions` | Overkill en 48h |

## Consecuencias (deuda técnica)

- Regenerar el plan con `force_regenerate` puede **borrar** tareas de refuerzo.
- Post-hackathon: merge idempotente por skill o tabla de extensiones.
