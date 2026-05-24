# ETL — Pool de entrevistas con fuentes reales (B7)

Repobla `interview_questions_seed` con preguntas tech de GitHub + HuggingFace, traducidas y clasificadas con Gemini. Sectores no-tech se preservan del seed 013 como `ai_generated`.

## Requisitos

- Python 3.11+ (venv del backend)
- Variables en `backend/.env`:
  - `GEMINI_API_KEY` (fases enrich)
  - `SUPABASE_URL` + `SUPABASE_ANON_KEY` (fase apply)
- Dependencias: `pip install -r backend/requirements.txt` (`httpx`, `datasets`, `huggingface-hub`)

## Ejecución por fases

Desde `backend/`:

```bash
source venv/bin/activate

# B7.2 — descarga fuentes (caché 7 días en cache/raw/)
python -m scripts.etl_interview_pool.main --fase download

# B7.3 — parsing y normalización
python -m scripts.etl_interview_pool.main --fase parse

# B7.4 — traducción + rúbricas Gemini (~13 min, 521 preguntas)
python -m scripts.etl_interview_pool.main --fase enrich

# B7.5 — genera SQL 015 + opcional apply a Supabase
python -m scripts.etl_interview_pool.main --fase export
python -m scripts.etl_interview_pool.apply_pool   # TRUNCATE debe estar hecho antes
```

Pipeline completo (sin re-traducir si hay caché):

```bash
python -m scripts.etl_interview_pool.main --fase all
```

Smoke test con pocas preguntas:

```bash
python -m scripts.etl_interview_pool.main --fase enrich --limit 30
```

## Caché local

```
cache/
├── raw/              # markdown GitHub + JSON HuggingFace + hf_hub/
└── translated/       # translations.json, classifications.json, pool_*.json
```

**No se sube al repo** (`.gitignore`). Borrar para forzar re-descarga/re-traducción:

```bash
rm -rf backend/scripts/etl_interview_pool/cache/raw/*
rm -rf backend/scripts/etl_interview_pool/cache/translated/*
```

## Aplicar a Supabase

1. Migración **014** (columnas `fuente_url`, `idioma_origen`) — una vez.
2. Migración **015** backup + TRUNCATE (via MCP o SQL Editor).
3. Inserts: `python -m scripts.etl_interview_pool.apply_pool` (PostgREST, batches de 50).

El archivo `backend/migrations/015_replace_interview_pool_with_real_sources.sql` queda como artefacto auditable aunque la aplicación en prod use PostgREST por tamaño (~362 KB).

## Revertir desde backup

```sql
BEGIN;
TRUNCATE TABLE interview_questions_seed RESTART IDENTITY;
INSERT INTO interview_questions_seed SELECT * FROM interview_questions_seed_backup_2026_05_24;
COMMIT;
```

## Fuentes y valores de `fuente`

| Valor | Origen |
|-------|--------|
| `github_sudheerj_react` | [reactjs-interview-questions](https://github.com/sudheerj/reactjs-interview-questions) |
| `github_sudheerj_javascript` | [javascript-interview-questions](https://github.com/sudheerj/javascript-interview-questions) |
| `github_arialdomartini_backend` | [Back-End-Developer-Interview-Questions](https://github.com/arialdomartini/Back-End-Developer-Interview-Questions) |
| `huggingface_ali_alkhars` | [ali-alkhars/interviews](https://huggingface.co/datasets/ali-alkhars/interviews) |
| `ai_generated` | Seed 013 no-tech (108 filas) |

## Atajos pragmáticos (deuda técnica)

- HF cache en `cache/hf_hub/` (no `~/.cache`) por sandbox/CI.
- Parser separado para arialdomartini (`#### Título` vs formato sudheerj).
- Prompts ETL inline en código; copia en `docs/PROMPTS.md`.
- `--limit N` para smoke sin quemar API.
- Inserts prod vía PostgREST, no SQL monolítico por MCP.
