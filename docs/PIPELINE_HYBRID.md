# PIPELINE_HYBRID — Cache-first + cola manual

Arquitectura híbrida para vacantes: el backend responde desde cache y encola scraping **best-effort** cuando hay pocas vacantes frescas. **Sin cron en hackathon** — el operador corre `run_queue.py` manualmente (o un cron futuro con el mismo CLI).

## Diagrama de flujo

```
POST /profile
    │
    ├─► profiles (OK, contrato sin cambios)
    └─► user_interests (best-effort INSERT)

GET /jobs/recommended/{session_id}
    │
    ├─► jobs activos con scraped_at < FRESH_HORIZON_HOURS (default 48h)
    │       + filtro flexible ciudad/sector
    │
    ├─► COUNT >= MIN_FRESH_JOBS (default 10)?
    │       SÍ → score normal, top 20 (sin encolar)
    │       NO → score sobre cache completo + request_scrape() → scrape_queue

Operador / cron futuro:
    pipeline/run_queue.py --batch N
        │
        ├─► getonbrd_fetcher (solo sectores tech)
        └─► remotive_fetcher (keyword = primer skill)
                │
                └─► upsert jobs + UPDATE scrape_queue (done/failed)
```

## Tablas nuevas

### `user_interests`

Señales de demanda al guardar perfil. **Nunca rompe** `POST /profile`.

| Columna | Uso |
|---------|-----|
| `session_id` | UUID del wizard |
| `city`, `department`, `sector` | Del perfil |
| `skills` | Habilidades del perfil |
| `source` | Default `profile_post` |

Migración: `backend/migrations/008_user_interests.sql`

### `scrape_queue`

Cola de scraping on-demand.

| Columna | Uso |
|---------|-----|
| `filters` | JSON `{ city, sector, skills[] }` |
| `priority` | Mayor = antes |
| `status` | `pending` → `processing` → `done` \| `failed` |
| `source_hint` | Default `['getonbrd','remotive']` |
| `jobs_inserted` | Conteo tras procesar |
| `retry_count` | Reintentos (max configurable en CLI) |

Migración: `backend/migrations/009_scrape_queue.sql`

## Variables de entorno (backend)

```env
FRESH_HORIZON_HOURS=48   # ventana de frescura
MIN_FRESH_JOBS=10        # mínimo para no encolar
```

## Servicios backend

| Archivo | Rol |
|---------|-----|
| `backend/app/services/profile_service.py` | `_registrar_interes()` tras guardar perfil |
| `backend/app/services/queue_service.py` | `request_scrape(filters, priority=1)` |
| `backend/app/services/jobs_service.py` | `_resolver_jobs_cache()` cache-first |

## CLIs pipeline

### Procesar cola (manual)

```bash
cd pipeline
../backend/venv/bin/python run_queue.py
../backend/venv/bin/python run_queue.py --batch 5 --dry-run
../backend/venv/bin/python run_queue.py --sources getonbrd,remotive --max-retries 3
```

Output esperado:

```
Procesadas: X | Done: Y | Failed: Z
Jobs insertados: N | Tiempo: Ts
```

### Baseline directo (sin cola)

```bash
../backend/venv/bin/python run_baseline.py \
  --city Barranquilla --sector tecnologia --skills python,javascript --limit 100

../backend/venv/bin/python run_baseline.py --sources remotive --limit 30 --dry-run
```

### Fetchers individuales (como antes)

```bash
../backend/venv/bin/python getonbrd_fetcher.py
../backend/venv/bin/python remotive_fetcher.py --max-jobs 50
```

## Adaptación de filtros por fuente

| Fuente | Comportamiento |
|--------|----------------|
| **getonbrd** | Solo sectores tech (`tecnologia`, `data`, etc.). Categorías `programming`, `data-science-analytics`. Skip si sector no-tech (ej. agricultura). |
| **remotive** | Primer skill del perfil como keyword en title/description/tags. |

## Test E2E manual

```bash
# 1. Backend con USE_MOCK_DATA=false
cd backend && ./venv/bin/uvicorn main:app --reload

# 2. Perfil normal → no encola
curl -X POST http://localhost:8000/api/profile -H 'Content-Type: application/json' \
  -d '{"session_id":"test-normal","nombre":"Ana","ciudad":"Barranquilla","departamento":"Atlantico","habilidades":["python"],"sectores_interes":["tecnologia"],"modalidad":"remoto"}'

curl http://localhost:8000/api/jobs/recommended/test-normal
# → 20 vacantes; logs: encolado=False

# 3. Perfil exótico → encola
curl -X POST http://localhost:8000/api/profile -H 'Content-Type: application/json' \
  -d '{"session_id":"test-exotic","nombre":"Luis","ciudad":"Mocoa","departamento":"Putumayo","habilidades":["agricultura"],"sectores_interes":["agricultura"]}'

curl http://localhost:8000/api/jobs/recommended/test-exotic
# → vacantes del cache; fila pending en scrape_queue

# 4. Procesar cola
cd pipeline && ../backend/venv/bin/python run_queue.py --batch 5
```

Verificar en Supabase:

```sql
SELECT * FROM user_interests ORDER BY created_at DESC LIMIT 5;
SELECT id, status, filters, jobs_inserted FROM scrape_queue ORDER BY created_at DESC LIMIT 5;
```

## Activar cron en producción (fase 2)

Literalmente el mismo CLI cada N minutos:

```cron
*/30 * * * * cd /app/DulIa/pipeline && /app/venv/bin/python run_queue.py --batch 10 >> /var/log/dulia-queue.log 2>&1
```

No requiere cambios de código — solo scheduler + credenciales Supabase en el entorno del worker.

## Reglas no negociables

- `user_interests` y `scrape_queue` son **best-effort** — nunca fallan endpoints existentes.
- Contrato de `POST /profile` y `GET /jobs/recommended` **sin cambios**.
- Lógica de score en `jobs_service` **sin cambios** (solo rama freshness + queue).
