# Filtro seniority + scoring expresivo en recomendaciones

- **Fecha:** 2026-05-24
- **Área:** backend
- **Estado:** activa
- **Autor/es:** Carlos (backend)

## Contexto

En demo pre-pitch se observó:

1. Scores de vacantes agrupados en ~60–65% sin diferenciación.
2. Perfiles estudiantes (0 años exp) recibían vacantes Senior / Tech Lead en el top 20.
3. Fallback de analyze devolvía `nivel_preparacion.overall: 65` fijo cuando Gemini fallaba.

Causas: bonus automático de 40 pts cuando `skills_required` vacío, 20 pts por cualquier remoto, curva de experiencia permisiva, y ausencia de filtro por seniority en título/`experience_required`.

## Decisión

### A — Pre-filtro seniority (`jobs_service.py`)

Solo perfiles con **≤2 años** de experiencia:

- Excluir vacantes cuyo título indique senior/lead/staff/manager (salvo que también diga junior).
- Excluir vacantes con `experience_required > perfil + 2` salvo `hires_youth=true`.

Perfiles con >2 años: pool completo sin filtro duro.

### B — Scoring v1.1

| Regla | Valor |
|-------|-------|
| Sin skills_required | 15 pts (antes 40) |
| Remoto | 15 pts ciudad (antes 20) |
| Ciudad exacta | 20 pts |
| Experiencia insuficiente | `max(0, 25 - brecha × 8)` |
| Youth bonus | +5 si junior + `hires_youth` |
| Score final | Redondeo a múltiplos de 5, cap 100 |

### D — Analyze fallback

- Eliminar `overall: 65` hardcoded.
- Estimar `overall` con heurística perfil + promedio de scores de vacantes recomendadas.
- Prompt `PROFILE_ANALYSIS` v1.1: descripciones en prosa, calibración honesta de overall.

## Por qué

- Mejora credibilidad del pitch sin cambiar contrato API.
- Estudiantes ven vacantes junior-first.
- Scores más dispersos facilitan lectura del semáforo y del preview.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Filtrar seniority en pipeline (solo scrapear junior) | Pierde cobertura del termómetro; filtro en runtime es más flexible |
| LLM para re-rank top 20 | Latencia + costo Gemini en cada GET jobs |
| Cambiar contrato `area` a español en API | Rompe parseo existente; frontend humaniza labels |

## Consecuencias

- `ScoreBreakdown` incluye campo opcional `youth` (0–5).
- Regenerar análisis existentes: `POST .../analyze?regenerate=true` para aplicar prompt v1.1.
- Frontend: handoff en `docs/handoff-frontend-analysis-labels.md` para labels legibles de `area`.
