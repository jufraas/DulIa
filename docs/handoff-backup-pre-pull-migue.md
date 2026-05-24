# Backup pre-pull ÔÇö Mi Progreso (Migue) ┬À 2026-05-24

> **Rama de respaldo en GitHub:** `backup/migue-front-pre-pull-20260524`  
> **Commit congelado:** `bd7aa27` ÔÇö *Merge pull request #19 from jufraas/FRONT*  
> **Tu `FRONT` local antes del pull:** `bd7aa27` (limpio, = PR #19 mergeado)

Usar este doc + la rama backup para recuperar o comparar despu├®s de `git pull origin FRONT` o merge con `main`.

---

## Qu├® hay en remoto (lo que vas a traer)

### `origin/FRONT` ÔåÆ `40dd1f7` (2 commits de Jufra: `si`, `si2`)

**A├▒ade (frontend J1ÔÇôJ2):**

| Archivo | Rol |
|---------|-----|
| `frontend/src/hooks/useProfileCheck.js` | J1 ÔÇö guard post-login |
| `frontend/src/components/auth/RedirectIfHasProfile.jsx` | redirect si ya tiene perfil |
| `frontend/src/components/RedirectIfHasProfile.jsx` | ÔÜá´©Å duplicado en otra ruta ÔÇö revisar cu├íl usar |
| `frontend/src/pages/InterviewPage.jsx` | J2 ÔÇö UI entrevista |
| `frontend/src/components/interview/Interview*.jsx` | launcher, session, results, history |
| `frontend/src/components/GeminiLoader.jsx` | loader (distinto de `GeminiThinkingLoader.jsx`) |
| `frontend/src/mocks/mockInterview.js` | cambios adicionales |

**ÔÜá´©Å Problema conocido en `origin/FRONT`:**

`frontend/src/pages/ProgressPage.jsx` tiene **dos p├íginas pegadas**: tu implementaci├│n M2/M3 (l├¡neas 1ÔÇô108) + un **mock viejo duplicado** a├▒adido al final (~197 l├¡neas). Eso rompe build/lint. **Despu├®s del pull hay que borrar el bloque duplicado** y quedarse solo con la versi├│n Migue.

`App.jsx` en `origin/FRONT` **no** registra a├║n `/entrevista` ni `RedirectIfHasProfile` ÔÇö hay que cablear rutas al integrar.

### `origin/main` ÔåÆ `3c02a3f` (PR #21 Backend)

**Backend Supabase + entrevistas reales (Jufra B1ÔÇôB7):**

| Pieza | Archivo |
|-------|---------|
| Progreso Supabase | `progress_service.py`, `progress_adapter.py`, `progress_m3_service.py` |
| Entrevistas pool | `interview_service.py` (reescrito), `interview_router.py` |
| Usuario | `user_router.py`, `user_service.py` |
| Migraciones | `012_progress_and_interviews.sql`, `013`ÔÇô`015` |
| Routers | `main.py` usa `user_router` + `interview_router` (no `user.py` plano) |

Choca con tu M3 in-memory si se mergean sin cuidado.

---

## Inventario Mi Progreso (Migue) ÔÇö preservar en conflictos

Commits: `3165e46` ÔÇª `3de2513` (foundation ÔåÆ M3).

### Frontend (no tocar layout `/resultados`)

```
frontend/src/pages/ProgressPage.jsx          ÔåÉ versi├│n bd7aa27 (SIN mock duplicado al final)
frontend/src/components/progress/
  PlanTimeline.jsx, ProgressOverview.jsx, PhaseLockOverlay.jsx,
  TaskList.jsx, ProgressDataSourceBanner.jsx
frontend/src/store/useProgressStore.js
frontend/src/store/useInterviewStore.js      ÔåÉ dataSource + withProgressFallback
frontend/src/services/api.js                 ÔåÉ withProgressFallback, ProgressApiResult
frontend/src/mocks/mockProgress.js
frontend/src/utils/progressScroll.js, apiErrors.js
frontend/src/hooks/useAnimatedNumber.js, useProgressBarWidth.js
frontend/src/components/interview/GeminiThinkingLoader.jsx
frontend/scripts/test-progress-foundation.mjs
frontend/scripts/test-progress-api.mjs
```

### Backend M3 (in-memory ÔÇö backup; main trae Supabase)

```
backend/app/routes/progress.py
backend/app/routes/user.py                   ÔåÉ main puede usar user_router.py
backend/app/services/progress_service.py     ÔåÉ main: versi├│n Supabase
backend/app/services/interview_service.py    ÔåÉ main: versi├│n pool/Gemini
backend/tests/test_m3_progress_api.py
```

---

## C├│mo hacer pull (recomendado)

```bash
git fetch origin
git checkout FRONT

# Opcional: rama local extra por si acaso
git branch backup/migue-local-$(date +%Y%m%d) 

git pull origin FRONT
# Si pide merge/rebase y hay conflictos ÔåÆ ver abajo
```

Para alinear tambi├®n con backend en `main`:

```bash
git merge origin/main
# o despu├®s del pull: git merge origin/main
```

---

## Resoluci├│n de conflictos ÔÇö reglas

| Archivo | Prioridad |
|---------|-----------|
| `ProgressPage.jsx` | **Tu versi├│n** (`bd7aa27`) + integrar tabs/links de Jufra si hacen falta; **eliminar mock duplicado** |
| `components/progress/*` | **Tu versi├│n** |
| `PlanTimeline`, `ThirtyDayPlan` en `/resultados` | **No cambiar** ThirtyDayPlan (layout congelado) |
| `useProfileCheck`, `InterviewPage`, `Interview*.jsx` | **Versi├│n Jufra** (nuevo) |
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

## Verificaci├│n post-merge

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
# Migraciones 012ÔÇô015 en Supabase si USE_MOCK_DATA=false
```

**Manual:** login ÔåÆ `/progreso` (timeline + TaskList, sin banner mock si API ok) ÔåÆ entrevista si ruta cableada.

---

## Commits de referencia

| SHA | Descripci├│n |
|-----|-------------|
| `bd7aa27` | **Backup** ÔÇö FRONT mergeado PR #19 |
| `3de2513` | M3 E2E API + fallback mock |
| `3165e46` | Foundation Mi Progreso |
| `40dd1f7` | origin/FRONT Jufra (si2) ÔÇö incluye ProgressPage roto |
| `3c02a3f` | origin/main PR #21 Backend |

---

## Para el agente (Cursor) despu├®s del pull

1. Leer `git status` y listar archivos en conflicto.
2. Arreglar `ProgressPage.jsx` primero (quitar duplicado mock).
3. Cablear `InterviewPage` + `useProfileCheck` en `App.jsx` / login si faltan.
4. Reconciliar `api.js` con contrato en `docs/ENDPOINTS.md` post-PR #21.
5. Correr tests de la secci├│n Verificaci├│n.
