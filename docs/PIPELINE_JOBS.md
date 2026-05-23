# PIPELINE — Contrato tabla `jobs` (inglés)

> Schema unificado: nombres en **inglés** (Adzuna/APIs) + campos extra que el **backend DulIA** necesita para scoring y mercado.

## Proyecto Supabase

- DulIA hackathon: `ikyrbkbhxpoycverkdqh`
- Migración SQL: `backend/migrations/002_jobs_english_schema.sql`
- Trigger `unique_hash` + `active`: `backend/migrations/003_jobs_unique_hash_trigger.sql` (ya aplicado en DulIA)

---

## Guía rápida — pipeline de Jose (errores que viste)

### 1. `Invalid API key` (401)

- Usar el **mismo proyecto** DulIA (`ikyrbkbhxpoycverkdqh`).
- En `.env` del pipeline: `SUPABASE_URL` + **`SUPABASE_KEY` = anon key** (Settings → API → `anon` `public`).
- No mezclar URL de un proyecto y key de otro. `service_role` solo si el script lo pide explícitamente.

### 2. `Could not find the 'skills_req' column` (PGRST204)

En Supabase la columna se llama **`skills_required`**, no `skills_req`.

```python
# Antes (rompe)
vacante["skills_req"] = [...]

# Después
vacante["skills_required"] = [...]
# o renombrar al armar el dict:
row = {**vacante, "skills_required": vacante.pop("skills_req")}
```

### 3. `null value in column "unique_hash"`

DulIA exige `unique_hash` (dedup). Opciones:

**A)** No mandarlo — el trigger en BD lo genera solo (recomendado).

**B)** En Python antes del insert:

```python
import hashlib
def unique_hash(title, company, url):
    s = f"{title}|{company}|{url}".lower()
    return hashlib.sha256(s.encode()).hexdigest()
```

### 4. `upsert(..., on_conflict="url")`

En DulIA el UNIQUE fuerte es **`unique_hash`**, no `url`. Mejor:

```python
.upsert(vacantes, on_conflict="unique_hash")
# o upsert por url solo si todas las filas tienen url única y rellenan unique_hash
```

### Mapeo: su tabla → Supabase DulIA

| Jose (su script) | Columna en Supabase DulIA | Notas |
|------------------|---------------------------|--------|
| `title` | `title` | ✅ |
| `company` | `company` | NOT NULL — no dejar null |
| `location` | `location` | ✅ |
| `salary_min` / `salary_max` | igual | ✅ |
| `description` | `description` | ✅ |
| **`skills_req`** | **`skills_required`** | ⚠️ renombrar |
| `source` | `source` | ✅ |
| `url` | `url` | ✅ |
| `posted_at` / `scraped_at` | igual | ✅ |
| `repost_count` | `repost_count` | ✅ |
| `status` | `status` | green/yellow/red ✅ |
| `hires_youth` | `hires_youth` | ✅ |
| — | `unique_hash` | auto con trigger o SHA256 |
| — | `active` | default `true` (puede omitir) |
| — | `city` | opcional; parsear de `location` |
| — | `department` | opcional |
| — | `sector` | recomendado para mercado |
| — | `experience_required` | default `0` |
| — | `modality` | `presencial`/`remoto`/`hibrido` |
| — | `education_level_req` | opcional |

Si su IA ya extrae skills y calcula fantasmas, **no hace falta** `enrich_job.py` salvo para `city`/`sector` si aún no los tiene.

### Por qué `detector.py` / `stats.py` ven 0 vacantes

Porque **el insert falló** (`skills_req`). Arreglar el nombre → volver a `cargar_mock.py` → luego detector y stats.

---

## Columnas obligatorias para el pipeline

| Columna | Tipo | Pipeline | Backend usa para |
|---------|------|----------|------------------|
| `title` | text | ✅ Adzuna | API, UI |
| `company` | text | ✅ | API, mercado, score |
| `url` | text | ✅ UNIQUE | Link vacante, dedup |
| `source` | text | ✅ | Trazabilidad |
| `salary_min` | int | opcional | Mercado, UI |
| `salary_max` | int | opcional | Mercado, UI |
| `location` | text | ✅ recomendado | Texto libre "Ciudad, Depto" |
| `city` | text | **rellenar si puedes** | Score ciudad (20%) |
| `department` | text | **rellenar si puedes** | Score departamento |
| `skills_required` | text[] | normalizar minúsculas | Score skills (40%) |
| `sector` | text | **inferir o default** | Mercado + recomendaciones |
| `experience_required` | numeric | default `0` | Score experiencia (25%) |
| `education_level_req` | text | opcional | Score educación (15%) |
| `modality` | text | `presencial`/`remoto`/`hibrido` | Score remoto |
| `status` | text | `green`/`yellow`/`red` | Filtro (excluye red) |
| `description` | text | opcional | UI |
| `posted_at` | timestamptz | opcional | Crecimiento semanal |
| `scraped_at` | timestamptz | default `now()` | Crecimiento semanal |
| `active` | boolean | default `true` | Solo vacantes vigentes |
| `unique_hash` | text | SHA256(title+company+url) | Dedup (único) |
| `repost_count` | int | default `0` | Detectar fantasmas |
| `hires_youth` | boolean | default `false` | Plan 2 / filtros jóvenes |

## Valores enumerados

**`status`:** `green` | `yellow` | `red`  
**`modality`:** `presencial` | `remoto` | `hibrido` (también aceptamos `remote`/`hybrid` — el backend normaliza)  
**`education_level_req`:** `bachiller` | `tecnico` | `tecnologo` | `universitario` | `posgrado`

## Campos que Adzuna NO trae — quién los rellena

| Campo | Si falta en raw | Quién lo completa |
|-------|-----------------|-------------------|
| `city` / `department` | Solo `location` | `pipeline/enrich_job.py` parsea `"Barranquilla, Atlántico"` |
| `sector` | — | `enrich_job.py` infiere por keywords en title+description (o `"general"`) |
| `skills_required` | — | Lista vacía o keywords en description (`python`, `excel`, …) |
| `experience_required` | — | Default `0` |
| `modality` | — | Inferido de description (`remoto`, `hibrido`, `presencial`) |
| `status` | — | Heurística: green si salario + descripción larga, si no yellow |
| `hires_youth` | — | `true` si dice junior / sin experiencia / practicante |
| `unique_hash` | — | SHA256(`title\|company\|url`) |
| `active` | — | Default `true` |

El **backend** también tolera huecos al leer (`location` → city para score), pero el **enriquecimiento al insertar** da mejores scores y mercado desde el día 1.

```python
# En el script de tu compa, antes del insert:
from enrich_job import enrich_job_row
row = enrich_job_row(adzuna_dict, source="adzuna")
```

## Ejemplo INSERT (Python)

```python
row = {
    "title": "Junior Data Analyst",
    "company": "Bancolombia",
    "url": "https://...",
    "source": "adzuna",
    "location": "Barranquilla, Atlántico",
    "city": "Barranquilla",
    "department": "Atlántico",
    "salary_min": 2800000,
    "salary_max": 4000000,
    "skills_required": ["python", "sql", "excel"],
    "sector": "fintech",
    "experience_required": 1,
    "education_level_req": "universitario",
    "modality": "hibrido",
    "status": "green",
    "active": True,
    "unique_hash": sha256(...),
    "repost_count": 0,
    "hires_youth": True,
}
```

## API → frontend (sin cambio)

El backend sigue devolviendo JSON en español (`titulo`, `empresa`, `semaforo`, …). La traducción EN→ES ocurre en `job_mapper.py`.

## Mapeo rápido ES (viejo) → EN (nuevo)

| Antes | Ahora |
|-------|-------|
| titulo | title |
| empresa | company |
| ciudad | city |
| departamento | department |
| habilidades_requeridas | skills_required |
| experiencia_requerida | experience_required |
| nivel_educativo_req | education_level_req |
| modalidad | modality |
| semaforo | status |
| fuente | source |
| hash_unico | unique_hash |
| publicado_at | posted_at |
| scrapeado_at | scraped_at |
| activo | active |
