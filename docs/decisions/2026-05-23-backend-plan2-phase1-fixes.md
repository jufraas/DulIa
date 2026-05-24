# Decisión: Fase 1 — fixes backend Plan 2 (modo real)

> **Fecha:** 2026-05-23  
> **Estado:** Aplicado  
> **Migración:** `backend/migrations/004_plan2_backend_fixes.sql`

## Contexto

En modo real (`USE_MOCK_DATA=false`), el front llamaba `loadResultsBundle()` y recibía:

| Endpoint | Error | Efecto en UI |
|----------|-------|--------------|
| `POST .../analyze` | 500 | Front caía a mocks → resumen/plan “hardcodeados” |
| `GET /market/dashboard` | 500 | Termómetro mock |
| `POST .../action-plan` | 404 | Plan mock (dependía de analyze) |
| `GET .../radar-data` | 500 | Radar mock |
| `GET .../timeline-data` | 404 | Sin timeline real |

## Causas raíz

### 1. Query dashboard referenciaba columna inexistente

`market_service.py` filtraba con PostgREST:

```text
city.ilike.%Barranquilla%,location.ilike.%Barranquilla%
```

La tabla `jobs` en Supabase **no tenía** columna `location` (migración `002_jobs_english_schema.sql` no aplicada). Postgres error `42703` → HTTP 500.

**Fix:** filtrar solo por `city`. Columna `location` añadida de forma idempotente en migración 004.

### 2. RLS bloqueaba INSERT en Plan 2

`profile_analysis` y `action_plans` tenían `rowsecurity=true` **sin políticas**. Con `SUPABASE_KEY` anon, Gemini generaba el análisis pero el INSERT fallaba:

```text
42501 new row violates row-level security policy
```

**Fix:** `DISABLE ROW LEVEL SECURITY` en ambas tablas (mismo criterio que `profiles` y `jobs` — ver `docs/SCHEMA.md`).

### 3. Serialización JSONB incorrecta

Los servicios hacían `json.dumps()` antes de insertar en columnas `jsonb`. El cliente Supabase espera listas/dicts nativos.

**Fix:** pasar objetos Python directamente; solo `raw_gemini_response` (text) usa `json.dumps()`.

### 4. Dashboard vacío por datos del pipeline (no 500)

119/126 vacantes tienen `city IS NULL`. Filtro `city=Barranquilla` devolvía 0 filas (200 OK pero stats vacías).

**Fix:** si el filtro por ciudad no devuelve filas, usar todas las vacantes activas y loguear warning.

## Verificación

Script local (con `.env` real):

```bash
cd backend && source venv/bin/activate
python -c "..."  # ver commit / smoke en ENDPOINTS.md
```

Cadena completa OK:

- `dashboard` → 200  
- `analyze` → 200 + fila en `profile_analysis`  
- `action-plan` → 200 + fila en `action_plans`  
- `radar-data` → 200  
- `timeline-data` → 200  

## Pendiente (Fase 2+ — front)

- Dejar de rellenar mocks silenciosamente cuando la API responde OK.
- Mostrar `analysis` en `ProfileSummary` y skills enriquecidos desde `gaps_mercado`.
- Enriquecer pipeline: poblar `jobs.city` al insertar (Get on Board / `enrich_job.py`).

## Referencias

- [ENDPOINTS.md](../ENDPOINTS.md) — troubleshooting Plan 2  
- [FRONTEND_INTEGRATION.md](../FRONTEND_INTEGRATION.md) — secuencia post-fix  
- [SCHEMA.md](../SCHEMA.md) — RLS y columnas `jobs`
