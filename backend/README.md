# DulIA — Backend

API FastAPI para el coach de carrera DulIA (Barranqui-IA 2026).

## Arrancar

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # o: ../scripts/setup-env.sh
uvicorn main:app --reload --port 8000
```

Swagger: http://localhost:8000/docs

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Clave anon (rol `anon`) — la misma que va al frontend |
| `SUPABASE_KEY` | Alias legacy de `SUPABASE_ANON_KEY` (retrocompat) |
| `GEMINI_API_KEY` | Google Gemini |
| `USE_MOCK_DATA` | `true` = respuestas mock sin BD/IA |

Ver `.env.example` para el resto (Adzuna, Jooble, rate limit, jobs cache).

## Migraciones Supabase

Aplicar en SQL Editor (orden):

1. `migrations/002_plan2_tables.sql`
2. `migrations/004_plan2_backend_fixes.sql`
3. `migrations/008_user_interests.sql`
4. `migrations/009_scrape_queue.sql`
5. `migrations/010_user_accounts.sql` — auth opcional
6. `migrations/011_profiles_user_link.sql` — vincular `session_id` ↔ `user_id`

Schema documentado en [`docs/SCHEMA.md`](../docs/SCHEMA.md).

## Auth (MVP)

- Backend **no valida JWT** — sigue usando anon key + `session_id`.
- `POST /api/auth/link-session` vincula perfil coach anónimo al `user_id` tras login en el front.
- RLS desactivado en todas las tablas (MVP hackathon).
