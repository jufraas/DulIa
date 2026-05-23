# PIPELINE — Contrato tabla `jobs` (inglés)

> Schema unificado: nombres en **inglés** (Adzuna/APIs) + campos extra que el **backend DulIA** necesita para scoring y mercado.

## Proyecto Supabase

- DulIA hackathon: `ikyrbkbhxpoycverkdqh`
- Migración SQL: `backend/migrations/002_jobs_english_schema.sql`

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
