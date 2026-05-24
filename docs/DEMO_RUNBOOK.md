# DEMO_RUNBOOK — Pre-pitch DulIA

> **Audiencia:** operador del equipo (Jose/Carlos) antes del pitch.  
> **Ventana:** ~12 horas antes del pitch.  
> **Alcance:** nacional, varios campos laborales visibles en termómetro y vacantes.  
> **Fuentes activas:** `getonbrd` + `remotive` (**Adzuna/Jooble descartadas** — ver [DECISIONS.md](./DECISIONS.md)).  
> **Última verificación BD:** 2026-05-23 — 135 jobs, 12 MB total, 12 filas pending en `scrape_queue`.

---

## Resumen ejecutivo

| Recurso | Límite | Uso estimado post-runbook | Riesgo |
|---------|--------|---------------------------|--------|
| Supabase storage | 500 MB | ~15–20 MB (≈350 jobs + perfiles) | 🟢 Bajo |
| Supabase transfer | 2 GB/mes | ~50 MB con 20 demos | 🟢 Bajo |
| Remotive API | **~4 req/día recomendado** | **1 run = 4 categorías max** | 🟡 Medio |
| Get on Board | Sin límite duro; sleep 0.5s/página | 1–2 runs | 🟢 Bajo |
| Gemini Flash | ~60 req/min | ~6 calls/demo × N usuarios | 🟢 Bajo si no repiten wizard 5× |

**Objetivo numérico:** ~**300–350 jobs activos**, mezcla de sectores (tech, ventas, marketing, soporte, operaciones, diseño) y ciudades nacionales + remoto.

---

## Estado inicial (baseline de referencia)

```sql
-- Correr en Supabase SQL Editor antes de empezar
SELECT
  (SELECT count(*) FROM jobs WHERE active = true) AS jobs_activos,
  (SELECT count(*) FROM jobs WHERE source = 'getonbrd') AS getonbrd,
  (SELECT count(*) FROM jobs WHERE source = 'remotive') AS remotive,
  (SELECT count(*) FROM scrape_queue WHERE status = 'pending') AS cola_pending,
  pg_size_pretty(pg_database_size(current_database())) AS db_size;
```

Valores de referencia al armar este doc: **135 jobs**, **127 getonbrd / 8 remotive**, **12 pending**, **12 MB**.

---

## Checklist por tiempo

| Cuándo | Qué hacer | Duración |
|--------|-----------|----------|
| **T-12h → T-10h** (ahora) | Bloque 0 + Bloque 1 + Bloque 2 | ~45–60 min |
| **T-10h → T-3h** | Descanso / no tocar Remotive otra vez el mismo día | — |
| **T-2h** | Bloque 1 refresh (solo getonbrd) | ~10 min |
| **T-1h** | Perfiles demo + smoke Plan 2 | ~15 min |
| **T-30min** | Bloque 3 verificación completa | ~10 min |
| **T-5min** | Health + front abierto en `/comenzar` | ~2 min |

---

## Pre-requisitos (una sola vez)

```bash
cd /home/krl0s/Documents/DulIa/backend
# Verificar .env real (no commitear)
grep -E '^(SUPABASE_URL|SUPABASE_KEY|GEMINI_API_KEY|USE_MOCK_DATA)=' .env
# USE_MOCK_DATA debe ser false para el pitch

cd ../pipeline
# Smoke de credenciales
../backend/venv/bin/python -c "
from dotenv import load_dotenv; import os
load_dotenv('../backend/.env')
from supabase import create_client
sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
print('jobs:', sb.table('jobs').select('id', count='exact').execute().count)
"
```

---

## Bloque 0 — Limpiar deuda de tests (T-12h)

La cola tiene filas `pending` de sesiones de prueba del híbrido. Procesarlas o cerrarlas antes del pitch.

### Opción A — Procesar (muestra arquitectura viva)

```bash
cd /home/krl0s/Documents/DulIa/pipeline
../backend/venv/bin/python run_queue.py --batch 12 --sources getonbrd,remotive
```

**Verificación:**

```sql
SELECT status, count(*) FROM scrape_queue GROUP BY status;
-- Esperado: pending bajo (0–2), algunas done
```

### Opción B — Cerrar sin scrape (más rápido, menos API)

```sql
UPDATE scrape_queue
SET status = 'done', finished_at = now(), jobs_inserted = 0,
    error_msg = 'cerrado pre-pitch — baseline manual'
WHERE status = 'pending';
```

**Riesgo:** 🟢 Ninguno. **Por qué:** jurado no debe ver 12 pending sin procesar.

---

## Bloque 1 — Baseline general nacional (T-12h y refresh T-2h)

Poblar vacantes frescas: Colombia + remoto LATAM/worldwide. **No usar `--city`** para alcance nacional.

### T-12h — Pasada principal (~35 min)

| Paso | Comando exacto | Por qué | Riesgo |
|------|----------------|---------|--------|
| 1a | `cd /home/krl0s/Documents/DulIa/pipeline` | — | — |
| 1b | `../backend/venv/bin/python getonbrd_fetcher.py` | Hasta **100 jobs** getonbrd: programming, data, design, sales, ops, soporte (Colombia + remoto). Refresca `scraped_at`. | 🟢 Bajo |
| 1c | `../backend/venv/bin/python remotive_fetcher.py --categories software-dev,data,marketing,customer-support --max-jobs 50` | **4 requests** Remotive (tope diario). Remoto internacional + diversidad sectorial. | 🟡 Respetar 1 solo run/día |
| 1d | `../backend/venv/bin/python run_baseline.py --sector tecnologia --skills python,javascript --limit 80 --sources getonbrd,remotive --dry-run` | Preview sin escribir; confirmar fetched > 0 antes de repetir live si hace falta. | 🟢 |

**Verificación post Bloque 1:**

```bash
cd /home/krl0s/Documents/DulIa/backend
./venv/bin/python -c "
from dotenv import load_dotenv; load_dotenv()
from app.db.supabase import get_supabase
sb = get_supabase()
j = sb.table('jobs').select('source', count='exact').eq('active', True).execute()
total = sb.table('jobs').select('id', count='exact').eq('active', True).execute().count
by_src = {}
for row in sb.table('jobs').select('source').eq('active', True).execute().data:
    by_src[row['source']] = by_src.get(row['source'], 0) + 1
print('activos:', total, by_src)
"
```

**Esperado:** `activos: 250–350`, `remotive: 40–58`, `getonbrd: 120–127` (upsert no duplica por URL).

```sql
SELECT count(*) AS frescas_48h
FROM jobs
WHERE active = true
  AND scraped_at >= now() - interval '48 hours';
-- Esperado: >= 200 (cache-first no encola en perfiles tech)
```

### T-2h — Refresh ligero (sin Remotive)

| Paso | Comando | Por qué | Riesgo |
|------|---------|---------|--------|
| 2a | `../backend/venv/bin/python getonbrd_fetcher.py` | Renueva `scraped_at` y captura vacantes nuevas del día. | 🟢 |
| 2b | **No** correr `remotive_fetcher.py` otra vez el mismo día | Ya consumiste cuota recomendada (4 req). | 🟡 |

---

## Bloque 2 — Cobertura sectorial (T-12h, después del Bloque 1)

Get on Board ya trae Sales, Operations, Marketing, Customer Support en el fetch general. Remotive aporta marketing + customer-support. Para **rellenar huecos** (retail, logística, salud local) sin APIs:

| Paso | Comando | Por qué | Riesgo |
|------|---------|---------|--------|
| 2a | `../backend/venv/bin/python run_baseline.py --sector data --skills sql,python --limit 40 --sources getonbrd` | Refuerzo **datos/analytics** en getonbrd. | 🟢 |
| 2b | `../backend/venv/bin/python run_baseline.py --sector marketing --skills marketing,seo --limit 30 --sources getonbrd,remotive` | Solo si Remotive **no** se corrió en 1c (si ya corriste 1c, **saltar** remotive aquí). | 🟡 |
| 2c | `../backend/venv/bin/python cargar_mock.py` | **~13 vacantes** mock en ciudades nacionales (Medellín, Bogotá, Barranquilla, Cali…) — sectores Finanzas, Retail, Seguros, Consultoría. Complementa termómetro donde APIs no llegan. | 🟢 ~40 KB |

**Verificación sectorial:**

```sql
SELECT coalesce(sector, '(null)') AS sector, count(*) AS n
FROM jobs WHERE active = true
GROUP BY sector ORDER BY n DESC LIMIT 15;
-- Esperado: >= 5 sectores distintos con count >= 3
```

```sql
SELECT city, count(*) AS n
FROM jobs
WHERE active = true AND city IS NOT NULL
GROUP BY city ORDER BY n DESC LIMIT 10;
-- Esperado: varias ciudades CO (mock + presenciales getonbrd)
```

---

## Bloque 3 — Verificación pre-pitch (T-30min)

### 3.1 Backend arriba

```bash
cd backend
# Linux/macOS:
./.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
# Windows:
.\.venv\Scripts\uvicorn.exe main:app --reload --port 8000

# Otra terminal:
curl -s http://localhost:8000/api/health | python -m json.tool
# mock_data debe ser false
```

### 3.1b Frontend + CV (smoke)

```bash
cd frontend && npm run dev
# .env.local: VITE_API_URL=/api (proxy → :8000)
# Probar subida PDF en http://localhost:5173/comenzar
```

### 3.2 Termómetro — números reales

```bash
# Nacional (sin filtro ciudad)
curl -s "http://localhost:8000/api/market/dashboard" | python -m json.tool

# Muestras nacionales
curl -s "http://localhost:8000/api/market/dashboard?city=Bogot%C3%A1" | python -m json.tool
curl -s "http://localhost:8000/api/market/dashboard?city=Medell%C3%ADn" | python -m json.tool
curl -s "http://localhost:8000/api/market/dashboard?city=Barranquilla" | python -m json.tool
```

**Esperado:**
- `total_vacantes_activas` > **200**
- `top_sectores` con **≥ 4 entradas** distintas
- `salario_promedio` o rango numérico > 0
- `por_modalidad.remoto` > 0 y `por_fuente.getonbrd` / `remotive` presentes

### 3.3 Perfiles demo + jobs recomendados

Crear **dos perfiles** que muestren diversidad (guardar `session_id` para demo en vivo):

```bash
API=http://localhost:8000/api

# Perfil A — tech nacional / remoto
curl -s -X POST "$API/profile" -H 'Content-Type: application/json' -d '{
  "session_id": "demo-pitch-tech",
  "nombre": "Camila Demo",
  "ciudad": "Medellín",
  "departamento": "Antioquia",
  "habilidades": ["python", "sql", "git"],
  "sectores_interes": ["tecnologia"],
  "modalidad": "remoto",
  "nivel_educativo": "universitario",
  "experiencia_anios": 1
}' | python -m json.tool

curl -s "$API/jobs/recommended/demo-pitch-tech" | python -c "
import sys, json
jobs = json.load(sys.stdin)
scores = [j.get('score_compatibilidad', 0) for j in jobs]
print('count:', len(jobs), 'scores min/max:', min(scores), max(scores) if scores else '-')
print('sectores:', sorted(set(j.get('sector','?') for j in jobs[:10])))
"

# Perfil B — comercial / marketing
curl -s -X POST "$API/profile" -H 'Content-Type: application/json' -d '{
  "session_id": "demo-pitch-comercial",
  "nombre": "Andrés Demo",
  "ciudad": "Bogotá",
  "departamento": "Cundinamarca",
  "habilidades": ["ventas", "excel", "comunicacion"],
  "sectores_interes": ["marketing"],
  "modalidad": "hibrido",
  "nivel_educativo": "tecnologo",
  "experiencia_anios": 0
}' | python -m json.tool

curl -s "$API/jobs/recommended/demo-pitch-comercial" | python -c "
import sys, json
jobs = json.load(sys.stdin)
scores = [j.get('score_compatibilidad', 0) for j in jobs]
print('count:', len(jobs), 'scores min/max:', min(scores), max(scores) if scores else '-')
"
```

**Esperado:**
- **20 vacantes** en cada perfil
- Scores **variados** (ej. min 25–40, max 70–90) — no todos 0 ni todos 100
- Perfil tech: `encolado=False` en logs uvicorn (≥10 frescas relevantes)

### 3.4 Sistema híbrido sano

```sql
SELECT count(*) AS interests FROM user_interests;
SELECT status, count(*) FROM scrape_queue GROUP BY status;
-- interests: puede crecer con demos (OK)
-- pending: idealmente 0–3 (no decenas sin procesar)
```

### 3.5 Plan 2 (evitar mocks en UI)

```bash
curl -s -X POST "$API/profile/demo-pitch-tech/analyze" | jq '.nivel_preparacion.overall // .session_id'
curl -s -X POST "$API/profile/demo-pitch-tech/action-plan" | jq '.resumen_ejecutivo | .[0:80]'
```

Si falla analyze → revisar `GEMINI_API_KEY` y migración 004 antes del pitch.

---

## T-5min — Checklist final

- [ ] `curl /api/health` → 200, `mock_data: false`
- [ ] Front con `VITE_API_URL` apuntando al backend correcto
- [ ] `localStorage` limpio en la máquina del pitch (o usar sesión incógnita)
- [ ] Tab `Network` sin 500 en analyze/dashboard
- [ ] No correr más scripts de pipeline (ya está la BD)
- [ ] Tener `session_id` `demo-pitch-tech` como backup si el wizard falla

---

## Plan B — Si algo falla

### Bloque 1 — Baseline falla

| Situación | Plan B |
|-----------|--------|
| Get on Board caído / timeout | Usar **135 jobs ya en BD** (frescas <48h). Decir: *"cache de las últimas 24h"*. |
| Remotive rechaza / sin red | Omitir Remotive; correr solo `getonbrd_fetcher.py`. Termómetro mostrará `por_fuente.getonbrd` dominante. |
| Supabase lento | No re-upsert masivo; trabajar con datos existentes + `cargar_mock.py` (1 comando, bajo volumen). |

### Bloque 2 — Termómetro poco diverso

| Situación | Plan B |
|-----------|--------|
| Solo aparece "Programming" | `../backend/venv/bin/python cargar_mock.py` — añade Finanzas, Retail, Seguros, Fintech en ciudades CO. |
| Sector salud/logística ausente | En el pitch: *"Get on Board es tech-first; la cola híbrida encola demanda de sectores no cubiertos"* y mostrar fila en `user_interests` + `scrape_queue` con perfil exótico (Mocoa/agricultura). |

### Bloque 3 — API falla en la demo

| Situación | Plan B |
|-----------|--------|
| Gemini caído (analyze/plan) | Front cae a mocks locales — **decir explícitamente** que es fallback offline. Mejor: usar sesión `demo-pitch-tech` ya analizada antes. |
| Backend caído | `USE_MOCK_DATA=true` temporal + reinicio uvicorn — vacantes mock pero **arquitectura real** visible en Supabase (tablas `user_interests`, `scrape_queue`). |
| Supabase caído | `USE_MOCK_DATA=true` en backend; front con mocks. Pitch centrado en UX + arquitectura documentada. |

---

## Qué decir si preguntan: *"¿Cómo manejan los datos?"*

> **Elevator (30 s):**  
> *"DulIA no scrapea en cada click. Mantenemos un cache de vacantes reales en Supabase — hoy de Get on Board para Colombia y Remotive para remoto internacional. Cuando un joven completa su perfil, el backend responde al instante con lo que hay fresco; si falta oferta en su sector o ciudad, encolamos un scrape en segundo plano sin bloquear la UX. En producción es el mismo CLI que corremos manualmente hoy, con un cron cada 30 minutos."*

> **Detalle técnico (si profundizan):**  
> - `POST /profile` → guarda perfil + señal en `user_interests` (best-effort).  
> - `GET /jobs/recommended` → cache-first: jobs con `scraped_at` < 48h; si < 10 relevantes → devuelve cache completo + INSERT en `scrape_queue`.  
> - Operador/cron ejecuta `pipeline/run_queue.py` → getonbrd (tech/local) + remotive (remoto).  
> - Termómetro agrega `jobs` en tiempo real; `por_fuente` y `por_modalidad` muestran el mix local vs remoto.  
> - **No usamos Adzuna/Jooble** — no cubren bien Colombia/LATAM; elegimos fuentes con API estable en 48h de hackathon.

---

## Presupuesto Gemini en demo (audiencia desconocida)

Asumir **hasta 15 personas** probando el wizard completo:

| Acción | Calls Gemini / persona |
|--------|------------------------|
| POST /profile | 1 |
| POST /analyze | 1 |
| POST /action-plan | 1 |
| Coach (3 mensajes) | ~3 |
| **Total conservador** | **~6** |

15 × 6 = **90 calls** — margen amplio en free tier.  
**Tip:** no repetir el wizard completo en la misma sesión; reutilizar `/resultados` ya cargado.

---

## Comandos rápidos (copy-paste bloque completo T-12h)

```bash
cd /home/krl0s/Documents/DulIa/pipeline

# 0. Cerrar cola de tests (opción rápida — correr en Supabase SQL Editor)
# UPDATE scrape_queue SET status='done', finished_at=now(), jobs_inserted=0 WHERE status='pending';

# 1. Baseline nacional
../backend/venv/bin/python getonbrd_fetcher.py
../backend/venv/bin/python remotive_fetcher.py \
  --categories software-dev,data,marketing,customer-support \
  --max-jobs 50

# 2. Diversidad sectorial
../backend/venv/bin/python run_baseline.py --sector data --skills sql,python --limit 40 --sources getonbrd
../backend/venv/bin/python cargar_mock.py

# 3. Conteo rápido
../backend/venv/bin/python -c "
import os; from dotenv import load_dotenv; load_dotenv('../backend/.env')
from supabase import create_client
sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
n = sb.table('jobs').select('id', count='exact').eq('active', True).execute().count
print('Jobs activos:', n)
"
```

---

## Referencias

- [PIPELINE_HYBRID.md](./PIPELINE_HYBRID.md) — flujo cache-first + cola
- [SCHEMA.md](./SCHEMA.md) — tablas y tamaños
- [ENDPOINTS.md](./ENDPOINTS.md) — smoke Plan 2
- [decisions/2026-05-23-pipeline-fuentes-getonbrd-remotive.md](./decisions/2026-05-23-pipeline-fuentes-getonbrd-remotive.md)
