# Auth Supabase opcional vinculado al flujo anónimo

- **Fecha:** 2026-05-24
- **Área:** full-stack
- **Estado:** activa
- **Autor/es:** equipo DulIA

## Contexto

El MVP original decidió **sin login** (`session_id` anónimo) para reducir fricción en el hackathon. El frontend ya tenía pantallas de login/registro/perfil que chocaban con el schema coach (`profiles.session_id` NOT NULL, PK distinta de `auth.users.id`). Faltaban `VITE_SUPABASE_*` en `frontend/.env`, lo que rompía auth en dev.

Se necesita auth **opcional** para futuro seguimiento de progreso sin obligar registro antes del wizard.

## Decisión

1. **Wizard 100% anónimo** — sigue con `dulia_session_id` en `localStorage`.
2. **Auth opcional** vía Supabase Auth en el frontend (`AuthProvider`, `useAuth`).
3. **Schema separado:** tabla `user_accounts` (FK `auth.users`) para datos de cuenta; columna `user_id` nullable en `profiles` para vincular el análisis del coach.
4. **Vinculación best-effort:** tras `SIGNED_IN`, el front llama `POST /api/auth/link-session` con `session_id` + `user_id`.
5. **Seguridad MVP:** sin RLS, sin JWT middleware en backend; anon key en front (rol `anon`).

## Por qué

- Mantiene demo fluida para jurado (comenzar sin cuenta).
- Permite registro/login para quien quiera guardar perfil de cuenta y ver su análisis en `/perfil`.
- Evita mezclar campos de cuenta (`telefono`, redes) con el perfil coach estructurado por Gemini.
- Dos `.env` explícitos (`SUPABASE_*` backend, `VITE_SUPABASE_*` frontend) evitan el bug de auth silenciosamente deshabilitada.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Auth obligatorio antes del wizard | Fricción alta; contradice decisión hackathon |
| Reutilizar `profiles` como tabla de usuario | PK y `session_id` NOT NULL chocan con `auth.users` |
| RLS + JWT en backend desde MVP | Tiempo limitado; anon key + session_id ya funciona para demo |
| OAuth Google en MVP | Requiere config dashboard; email/password primero |

## Consecuencias

- Habilita `/login`, `/registro`, `/perfil` sin romper `/comenzar`.
- `ProfilePage` lee/escribe `user_accounts`, no `profiles`.
- Backend expone un endpoint nuevo de vinculación; resto de API sin cambios.
- Post-MVP: activar RLS, validar JWT en backend, OAuth Google.

## Smoke test manual

1. **Sin envs Supabase en front** → wizard funciona; `/login` muestra banner demo y botones disabled; header sin "Iniciar sesión".
2. **Con envs** → registro nuevo → header muestra avatar sin recargar.
3. **Wizard anónimo + registro** → fila `profiles` tiene `user_id` poblado.
4. **`/perfil`** → datos de `user_accounts` + card "Tu análisis del coach" si hay perfil vinculado.
5. **Logout** → header vuelve a "Iniciar sesión".
