# Backup pre-pull — Mi Progreso (Migue) · 2026-05-24

> **Rama de respaldo en GitHub:** `backup/migue-front-pre-pull-20260524`  
> **Commit congelado:** `bd7aa27` — *Merge pull request #19 from jufraas/FRONT*  
> **Tu `FRONT` local antes del pull:** `bd7aa27` (limpio, = PR #19 mergeado)

Usar este doc + la rama backup para recuperar o comparar después de `git pull origin FRONT` o merge con `main`.

---

## Qué hay en remoto (lo que vas a traer)

### `origin/FRONT` → `40dd1f7` (2 commits de Jufra: `si`, `si2`)

**Añade (frontend J1–J2):**

| Archivo | Rol |
|---------|-----|
| `frontend/src/hooks/useProfileCheck.js` | J1 — guard post-login |
| `frontend/src/components/auth/RedirectIfHasProfile.jsx` | redirect si ya tiene perfil |
| `frontend/src/components/RedirectIfHasProfile.jsx` | ⚠️ duplicado en otra ruta — revisar cuál usar |
| `frontend/src/pages/InterviewPage.jsx` | J2 — UI entrevista |
| `frontend/src/components/interview/Interview*.jsx` | launcher, session, results, history |
| `frontend/src/components/GeminiLoader.jsx` | loader (distinto de `GeminiThinkingLoader.jsx`) |
| `frontend/src/mocks/mockInterview.js` | cambios adicionales |

**⚠️ Problema conocido en `origin/FRONT`:**

`frontend/src/pages/ProgressPage.jsx` tiene **dos páginas pegadas**: tu implementación M2/M3 (líneas 1–108) + un **mock viejo duplicado** añadido al final (~197 líneas). Eso rompe build/lint. **Después del pull hay que borrar el bloque duplicado** y quedarse solo con la versión Migue.

`App.jsx` en `origin/FRONT` **no** registra aún `/entrevista` ni `RedirectIfHasProfile` — hay que cablear rutas al integrar.

### `origin/main` → `3c02a3f` (PR #21 Backend)

**Backend Supabase + entrevistas reales (Jufra B1–B7):**

| Pieza | Archivo |
|-------|---------|
| Progreso Supabase | `progress_service.py`, `progress_adapter.py`, `progress_m3_service.py` |
| Entrevistas pool | `interview_service.py` (reescrito), `interview_router.py` |
| Usuario | `user_router.py`, `user_service.py` |
| Migraciones | `012_progress_and_interviews.sql`, `013`–`015` |
| Routers | `main.py` usa `user_router` + `interview_router` (no `user.py` plano) |

Choca con tu M3 in-memory si se mergean sin cuidado.

---

## Inventario Mi Progreso (Migue) — preservar en conflictos

Commits: `3165e46` … `3de2513` (foundation → M3).

### Frontend (no tocar layout `/resultados`)

```
frontend/src/pages/ProgressPage.jsx          ← versión bd7aa27 (SIN mock duplicado al final)
frontend/src/components/progress/
  PlanTimeline.jsx, ProgressOverview.jsx, PhaseLockOverlay.jsx,
  TaskList.jsx, ProgressDataSourceBanner.jsx
frontend/src/store/useProgressStore.js
frontend/src/store/useInterviewStore.js      ← dataSource + withProgressFallback
frontend/src/services/api.js                 ← withProgressFallback, ProgressApiResult
frontend/src/mocks/mockProgress.js
frontend/src/utils/progressScroll.js, apiErrors.js
frontend/src/hooks/useAnimatedNumber.js, useProgressBarWidth.js
frontend/src/components/interview/GeminiThinkingLoader.jsx
frontend/scripts/test-progress-foundation.mjs
frontend/scripts/test-progress-api.mjs
```

### Backend M3 (in-memory — backup; main trae Supabase)

```
backend/app/routes/progress.py
backend/app/routes/user.py                   ← main puede usar user_router.py
backend/app/services/progress_service.py     ← main: versión Supabase
backend/app/services/interview_service.py    ← main: versión pool/Gemini
backend/tests/test_m3_progress_api.py
```

---

## Cómo hacer pull (recomendado)

```bash
git fetch origin
git checkout FRONT

# Opcional: rama local extra por si acaso
git branch backup/migue-local-$(date +%Y%m%d) 

git pull origin FRONT
# Si pide merge/rebase y hay conflictos → ver abajo
```

Para alinear también con backend en `main`:

```bash
git merge origin/main
# o después del pull: git merge origin/main
```

---

## Resolución de conflictos — reglas

| Archivo | Prioridad |
|---------|-----------|
| `ProgressPage.jsx` | **Tu versión** (`bd7aa27`) + integrar tabs/links de Jufra si hacen falta; **eliminar mock duplicado** |
| `components/progress/*` | **Tu versión** |
| `PlanTimeline`, `ThirtyDayPlan` en `/resultados` | **No cambiar** ThirtyDayPlan (layout congelado) |
| `useProfileCheck`, `InterviewPage`, `Interview*.jsx` | **Versión Jufra** (nuevo) |
| `api.js` | Combinar: tu `withProgressFallback` + endpoints que use el backend nuevo |
| `mockInterview.js` | Combinar con cuidado; probar `npm run test:progress` |
| `progress_service.py` / `interview_service.py` | **`main`/Backend** (Supabase); re-ejecutar pytest |
| `main.py` | **`main`** (`user_router`, `interview_router`) |

### Restaurar un archivo desde backup

```bash
git checkout backup/migue-front-pre-pull-20260524 -- frontend/src/pages/ProgressPage.jsx
git checkout backup/migue-front-pre-pull-20260524 -- frontend/src/components/progress/
```

### Restaurar todo el snapshot Migue (solo frontend progreso)

```bash
git checkout backup/migue-front-pre-pull-20260524 -- frontend/src/pages/ProgressPage.jsx \
  frontend/src/components/progress/ frontend/src/store/useProgressStore.js \
  frontend/src/utils/progressScroll.js frontend/src/utils/apiErrors.js
```

---

## Verificación post-merge

```bash
# Frontend
cd frontend
npm run test:progress
npm run test:progress:api    # backend :8000
npm run lint
npm run build

# Backend (desde main mergeado)
cd backend
pip install -r requirements.txt
pytest tests/test_m3_progress_api.py -v
# Migraciones 012–015 en Supabase si USE_MOCK_DATA=false
```

**Manual:** login → `/progreso` (timeline + TaskList, sin banner mock si API ok) → entrevista si ruta cableada.

---

## Commits de referencia

| SHA | Descripción |
|-----|-------------|
| `bd7aa27` | **Backup** — FRONT mergeado PR #19 |
| `3de2513` | M3 E2E API + fallback mock |
| `3165e46` | Foundation Mi Progreso |
| `40dd1f7` | origin/FRONT Jufra (si2) — incluye ProgressPage roto |
| `3c02a3f` | origin/main PR #21 Backend |

---

## Para el agente (Cursor) después del pull

1. Leer `git status` y listar archivos en conflicto.
2. Arreglar `ProgressPage.jsx` primero (quitar duplicado mock).
3. Cablear `InterviewPage` + `useProfileCheck` en `App.jsx` / login si faltan.
4. Reconciliar `api.js` con contrato en `docs/ENDPOINTS.md` post-PR #21.
5. Correr tests de la sección Verificación.
