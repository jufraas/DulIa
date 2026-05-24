# DEPLOYMENT — Runbook de producción DulIA

> **Versión:** v1.0 · 2026-05-24
> **Owner:** Jufra (CTO backend)
> **Tiempo total estimado:** 35–45 min (primera vez)

---

## Stack de producción

| Capa | Host | URL esperada | Justificación |
|------|------|---------------|---------------|
| **Base de datos** | Supabase | `https://ikyrbkbhxpoycverkdqh.supabase.co` | ✅ Ya en prod, 16 migraciones aplicadas |
| **Backend (FastAPI)** | Railway | `https://dulia-production.up.railway.app` | Long-running, free trial, sin cold starts agresivos |
| **Frontend (Vite SPA)** | Vercel | `https://dul-ia.vercel.app` | Edge CDN, deploy desde GitHub, `vercel.json` ya configurado |
| **Pipeline ETL** | Local (manual) | — | Solo se corre cuando hay que repoblar el pool (ya corrió B7) |

**URLs reales en producción** (actualizado 2026-05-24):

- Backend Railway: `https://dulia-production.up.railway.app`
- Frontend Vercel: `https://dul-ia.vercel.app`

Si cambian, actualizar el rewrite en `frontend/vercel.json` y el `CORS_ORIGINS` en Railway.

---

## 0 · Pre-requisitos

```bash
# Verificá que tenés todo localmente
cd /home/krl0s/Documents/DulIa
cd backend && python -m pytest tests/ -q   # → 19 passed
cd ../frontend && npm run lint && npm run build  # → 0 errores
```

Cuentas necesarias:

- [x] **Supabase** — `ikyrbkbhxpoycverkdqh` (ya creado)
- [ ] **Railway** — https://railway.app (login con GitHub)
- [ ] **Vercel** — https://vercel.com (login con GitHub)
- [x] **Gemini API key** — ya en `backend/.env`
- [x] **Adzuna app ID + key** — ya en `backend/.env`
- [x] **Jooble API key** — ya en `backend/.env`

CLIs opcionales (acelera diagnóstico):

```bash
npm i -g vercel        # Vercel CLI
npm i -g @railway/cli  # Railway CLI
```

---

## 1 · Backend en Railway

### 1.1 Crear proyecto

1. Entra a **https://railway.app/new** → "Deploy from GitHub repo" → seleccionar `jufraas/DulIa`.
2. Railway detecta automáticamente que es un repo monorepo. Configurar:
   - **Root Directory:** `backend`
   - **Branch:** `main`
   - **Watch Paths:** `backend/**` (para que solo redeploye cuando cambie el back)

Railway leerá automáticamente:

- `backend/Procfile` → comando de arranque
- `backend/runtime.txt` → Python 3.12.6
- `backend/railway.json` → healthcheck en `/api/health`
- `backend/nixpacks.toml` → fase install/start
- `backend/requirements.txt` → dependencias

### 1.2 Variables de entorno

En Railway → tu proyecto → **Variables** → "Raw Editor" → pegar este bloque (reemplazar valores reales):

```env
APP_ENV=production
USE_MOCK_DATA=false

# Supabase
SUPABASE_URL=https://ikyrbkbhxpoycverkdqh.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...

# Gemini
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-3.1-flash-lite

# Adzuna
ADZUNA_APP_ID=1ec311ea
ADZUNA_APP_KEY=3e2bc51250eed4c54b6bb0b9150336f8

# Jooble
JOOBLE_API_KEY=b2e059e4-4cca-4b77-960f-1a4e7cf3068f

# Entrevista V2 (B8)
INTERVIEW_V2_ENABLED=true

# Rate limits
RATE_LIMIT_GEMINI=10/minute
RATE_LIMIT_INTERVIEW_START=5/minute
RATE_LIMIT_INTERVIEW_ANSWER=10/minute
RATE_LIMIT_INTERVIEW_FINISH=3/minute
RATE_LIMIT_INTERVIEW_V2_TURN=15/minute

# Jobs cache-first
FRESH_HORIZON_HOURS=48
MIN_FRESH_JOBS=10
RECOMMENDED_TOP_N=0

# CORS — listar dominios Vercel (prod + preview wildcards manuales si aplica)
CORS_ORIGINS=https://dul-ia.vercel.app,http://localhost:5173
```

> Los valores reales de `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, etc. están en tu `backend/.env` local — copiá de ahí.

### 1.3 Generar dominio público

Railway → **Settings** → **Networking** → **Generate Domain** → te da `https://<auto>.up.railway.app`.

> Si Railway te da un subdominio distinto a `dulia-backend.up.railway.app`, anotalo — lo necesitarás en el paso 2.2.

### 1.4 Verificar

```bash
curl https://<tu-backend>.up.railway.app/api/health
# → { "status": "ok" } (o similar)

curl https://<tu-backend>.up.railway.app/docs
# → Swagger UI con tag "Mock Interview V2"
```

Smoke V2:

```bash
curl -X POST https://<tu-backend>.up.railway.app/api/interview/v2/start \
  -H "Content-Type: application/json" \
  -d '{"session_id":"smoke-test","target_skill":"Python"}'
# → 404 (profile not found) si el session_id no existe → backend respondió ✅
```

---

## 2 · Frontend en Vercel

### 2.1 Importar proyecto

1. **https://vercel.com/new** → "Import Git Repository" → `jufraas/DulIa`.
2. Configurar:
   - **Framework Preset:** Vite (auto-detectado)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
   - **Install Command:** `npm install` (default)

### 2.2 Actualizar el rewrite del backend (CRÍTICO)

Si Railway te dio una URL distinta a `dulia-backend.up.railway.app`, edita `frontend/vercel.json` ANTES de hacer el primer deploy:

```jsonc
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://<TU-URL-REAL>.up.railway.app/api/:path*"
    },
    ...
  ]
}
```

Commit y push. Vercel redeployará automáticamente.

> **Por qué este rewrite es importante:** el frontend usa `VITE_API_URL=/api` (path relativo). Vercel intercepta `/api/*` y lo reescribe transparentemente al backend. Sin esto, el navegador haría CORS preflight a otro dominio.

### 2.3 Variables de entorno

Vercel → tu proyecto → **Settings** → **Environment Variables** → agregar para los 3 environments (Production, Preview, Development):

```env
   VITE_API_URL=/api
   VITE_SUPABASE_URL=https://ikyrbkbhxpoycverkdqh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   # VITE_INTERVIEW_VERSION=v2  (default — no es obligatorio setearla)
   ```

   > Migue dejó V2 conversacional como default en `InterviewPage.jsx`. Para forzar V1 (quiz legacy) usar `?legacy=1` en la URL o setear `VITE_INTERVIEW_VERSION=v1`.

### 2.4 Deploy

Click "Deploy". El primer build tarda ~90s.

### 2.5 Verificar

1. Abrir `https://dulia.vercel.app` → landing.
2. DevTools → Network → navegar a `/comenzar` → ver requests a `/api/profile/...` → status 2xx desde el backend Railway.
3. Si ves CORS errors: significa que el rewrite NO está aplicado o la URL del backend está mal. Verificar `vercel.json`.

### 2.6 Volver al backend a fijar CORS

Cuando tengas la URL real de Vercel (ej. `https://dulia-abc.vercel.app`), actualizar en Railway:

```env
CORS_ORIGINS=https://dulia.vercel.app,https://dulia-abc.vercel.app
```

> **Nota:** con los rewrites de Vercel, las requests al backend llegan con el `Origin` header de `dulia.vercel.app`, NO con `Origin: dulia-abc.vercel.app`. Pero conviene listar ambos por preview deployments.

Reiniciar el service en Railway (Settings → Restart) para que cargue el CORS nuevo.

---

## 3 · Verificación end-to-end (smoke)

Ejecutar en orden con el sitio prod abierto en otra pestaña:

| # | Acción | Resultado esperado |
|---|--------|---------------------|
| 1 | Abrir `https://dulia.vercel.app` | Landing carga, no hay errores en consola |
| 2 | Click "Comenzar" → completar onboarding wizard | Llega a `/resultados` con score |
| 3 | Subir CV PDF en `/comenzar` | Backend parsea, devuelve prefill |
| 4 | Ir a `/vacantes` | Cards de Adzuna/Jooble (puede tardar 5–8s primera vez) |
| 5 | Login → ir a `/progreso` | Tareas del plan visibles, toggle persiste |
| 6 | Ir a `/entrevistas` → iniciar V1 | Quiz lineal funcional (5 preguntas) |
| 7 | Curl directo `/api/interview/v2/start` | Devuelve persona + opening_message |
| 8 | Refresh `/progreso` tras logout/login | Datos persisten (Supabase OK) |

Si todo 1–8 OK → **deploy verde**.

---

## 4 · Toggling entre V1 (quiz) y V2 (conversacional)

Migue completó M4 — V2 está activa por default.

- **Forzar V1 puntualmente**: agregar `?legacy=1` a la URL del navegador → `https://dul-ia.vercel.app/entrevistas?legacy=1`.
- **Forzar V1 global** (rollback): Vercel → Environment Variables → agregar `VITE_INTERVIEW_VERSION=v1` → Redeploy.
- **Forzar V2 global** (default actual): no hace falta env var; `InterviewPage.jsx` usa v2 cuando la var no está seteada.

---

## 5 · Logs y debugging

### Backend (Railway)

```bash
# CLI
railway login
railway link  # seleccionar el proyecto
railway logs   # streaming en vivo

# Web
Railway → Deployments → Click en el deploy actual → Logs
```

### Frontend (Vercel)

```bash
# CLI
vercel login
vercel link   # desde frontend/
vercel logs

# Web
Vercel → Project → Deployments → Functions/Logs
```

### DB (Supabase)

```sql
-- En el SQL editor del dashboard Supabase

-- Healthcheck V2
SELECT count(*) FROM mock_interviews_v2;

-- Últimas entrevistas
SELECT id, session_id, stage, status, global_score, created_at
FROM mock_interviews_v2
ORDER BY created_at DESC
LIMIT 10;

-- Pool de preguntas (debería tener 629 filas)
SELECT count(*), sector FROM interview_questions_seed GROUP BY sector;
```

---

## 6 · Troubleshooting

| Síntoma | Causa probable | Fix |
|---------|----------------|-----|
| `502 Bad Gateway` en `/api/*` | Backend Railway crasheado | Railway → Logs → buscar traceback; suele ser env var faltante |
| `CORS error` en consola | Rewrite mal en `vercel.json` o `CORS_ORIGINS` no incluye el dominio Vercel | Ver §2.2 y §2.6 |
| `/api/health` 200 OK pero `/api/profile` 500 | Falta `SUPABASE_URL` o `SUPABASE_ANON_KEY` en Railway | Settings → Variables → verificar |
| Build de Vercel falla con `Cannot find module` | `package-lock.json` desincronizado | Localmente `rm -rf node_modules package-lock.json && npm install`, commit y push |
| Build de Railway falla pip | Mismatch Python version | Verificar `runtime.txt` = `python-3.12.6` |
| Frontend muestra mocks en lugar de datos reales | `VITE_FORCE_PROGRESS_MOCK=true` activo o `VITE_API_URL` mal | Vercel env vars: NO definir `VITE_FORCE_PROGRESS_MOCK`, `VITE_API_URL=/api` |
| Backend devuelve `503` en `/api/interview/v2/*` | `INTERVIEW_V2_ENABLED=false` | Railway → Variables → `INTERVIEW_V2_ENABLED=true` → restart |
| Cold start lento en primer request | Railway instancia recién despertada | Esperar 10s en la primera request del día; subsecuentes son <500ms |

---

## 7 · Costos esperados (mes 1)

| Servicio | Plan | Costo estimado |
|----------|------|----------------|
| Supabase | Free | $0 (dentro de 500MB y 50k MAU) |
| Railway | Free trial → Hobby | $0 los primeros $5 de cómputo; luego ~$3–5/mes |
| Vercel | Hobby | $0 (dentro de 100 GB-Hours/mes) |
| Gemini API | Pay-as-you-go | ~$1–3/mes con uso de pitch |
| Adzuna/Jooble | Free tier | $0 |

**Total esperado para demo + post-pitch:** $4–8/mes.

---

## 8 · CI/CD (futuro)

Por ahora **deploy automático desde `main`** está activo en ambos hosts:

- Push a `main` → Vercel hace preview deploy automático en cada PR + production deploy al mergear.
- Push a `main` → Railway hace deploy automático (con `Watch Paths: backend/**`).

Para hardening pre-launch:

- Activar **Branch Protection** en GitHub para `main` (requiere PR review + status checks).
- Configurar **Vercel Preview URLs** con bots GH para comentar el URL en cada PR.
- Agregar **GitHub Actions** para correr `pytest` + `npm run lint` en cada PR (opcional, lo verificas tú localmente por ahora).

---

## 9 · Checklist final (imprimible)

```
[ ] backend/ tests pasan localmente (19 passed)
[ ] frontend/ lint y build OK
[ ] Migración 016 aplicada en Supabase
[ ] Railway project creado, env vars cargadas, dominio generado
[ ] curl /api/health responde 200 desde Railway
[ ] vercel.json actualizado con URL real del backend Railway
[ ] Commit + push del vercel.json corregido
[ ] Vercel project importado, env vars cargadas
[ ] Frontend deploy verde, sin errores en consola
[ ] CORS_ORIGINS en Railway actualizado con dominio Vercel
[ ] Backend reiniciado tras cambio de CORS
[ ] Smoke E2E §3 completo (1 a 8)
[ ] URLs registradas en este doc o en Notion del equipo
```

---

## 10 · Referencias rápidas

- **Schema DB:** [docs/SCHEMA.md](SCHEMA.md)
- **Endpoints API:** [docs/ENDPOINTS.md](ENDPOINTS.md)
- **Integración frontend:** [docs/FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
- **Plan entrevista V2:** [docs/INTERVIEW_REDESIGN_PLAN.md](INTERVIEW_REDESIGN_PLAN.md)
- **Estado del proyecto:** [docs/PROJECT_STATE.md](PROJECT_STATE.md)
- **Demo runbook:** [docs/DEMO_RUNBOOK.md](DEMO_RUNBOOK.md)
