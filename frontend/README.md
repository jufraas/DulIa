# DulIA — Frontend

SPA React + Vite para el coach de carrera DulIA (Barranqui-IA 2026). UI alineada al kit **ReBrand** con pantallas separadas.

**Animaciones landing:** splash inicial + Framer Motion (`RevealOnScroll`) — ver [decisión](../docs/decisions/2026-05-23-frontend-landing-animations.md).

## Arrancar

```bash
cd frontend          # importante: desde esta carpeta
npm install
npm run dev          # http://localhost:5173
npm run build        # verificar antes de push
npm run lint         # ESLint (solo src/ + config; ver abajo)
npm run test:progress        # progreso + entrevista quiz (13 tests, sin Vitest)
npm run test:api-fallback    # política API-first + landing splash (7 tests)
npm run test:interview-v2    # smoke entrevista conversacional V2 (5 tests)
npm run test:progress:api    # smoke E2E contra backend :8000 (opcional)
```

## Variables de entorno

El frontend usa **`frontend/.env.local`** (no el `backend/.env`). Copia la plantilla:

```bash
cp .env.example .env.local
```

Script opcional: `../scripts/setup-env.sh` copia `.env.example` → `.env` en backend y frontend.

| Variable | Default dev | Notas |
|----------|-------------|-------|
| `VITE_API_URL` | `/api` | Proxy Vite → `127.0.0.1:8000` (evita CORS si abres por IP de red) |
| `VITE_SUPABASE_URL` | — | Misma URL que `SUPABASE_URL` del backend (opcional) |
| `VITE_SUPABASE_ANON_KEY` | — | Misma anon key que `SUPABASE_KEY` del backend; **nunca** `service_role` |

**Dos `.env` en el repo:** credenciales del API/Gemini van en `backend/.env`; las del cliente Vite (prefijo `VITE_`) van aquí. Ninguno se commitea.

Sin las vars de Supabase, el flujo anónimo (`/comenzar`, `/resultados`, `/vacantes`) funciona; login/registro con Google requiere ambas `VITE_SUPABASE_*`.

Reinicia `npm run dev` después de editar `.env.local` o `vite.config.js`.

### Proxy API (desarrollo)

`vite.config.js` reenvía `/api/*` al backend local. El frontend llama `/api/profile`, no `localhost:8000` directo. En **producción** (Vercel) usa la URL absoluta del backend en `VITE_API_URL`.

**Backend en local:** debe correr en `:8000` con el venv del repo:

```powershell
cd backend
.\.venv\Scripts\uvicorn.exe main:app --reload --port 8000
```

Si arrancas `uvicorn` con Python del sistema, `POST /profile/parse-cv` devuelve **422** (falta `markitdown[pdf]`).

Llamadas con Gemini (`profile`, `analyze`, `action-plan`, `parse-cv`) usan timeout **120s** en `api.js`. La subida de CV usa **`fetch` + FormData** (no axios).

## Rutas de la app

| Ruta | Pantalla | Descripción |
|------|----------|-------------|
| `/` | Landing | Splash + hero + features + CTA; sesión Supabase → `/progreso` |
| `/sobre` | Sobre DulIA | Problema, audiencia, modelo, equipo |
| `/comenzar` | Onboarding | Wizard **3 pasos** + CV PDF; tags de habilidades; validaciones edad/coherencia |
| `/resultados` | Resultados | Nav por secciones, score+resumen alineados, termómetro, plan, radar, coach, PDF |
| `/vacantes` | Vacantes | Semáforo de confianza; **Volver a mi análisis** → `/resultados` |
| `/login` | Login | Email/password; **Volver al inicio**; banner demo si faltan envs Supabase |
| `/registro` | Registro | Upsert a `user_accounts` tras signUp; **Volver al inicio** |
| `/perfil` | Mi perfil | Protegida; datos cuenta + card análisis coach |
| `/progreso` | Mi progreso | Protegida; timeline, TaskList, CTA entrevista V2 |
| `/entrevistas` | Entrevista de práctica | Protegida; V2 chat (default) o quiz V1 (`?legacy=1`); acceso desde `/progreso` |

## Flujo de datos

1. Usuario completa wizard en `/comenzar` (departamento + municipio DANE; CV opcional; **habilidades en tags** con sugerencias; validación edad ≥15 y coherencia experiencia/tipo de oportunidad).
2. **POST** `/api/profile` con `session_id` (UUID en `localStorage`, clave `dulia_session_id`).
3. **`loadResultsBundle()`**: analyze → action-plan → jobs + market (`sessionId`) + radar + timeline.
4. Estado en Zustand (`savedProfile`, `jobs`, `market`, `plan`, `radar`, `timeline`, `analysis`).
5. Rehidratación al refresh vía `sessionHydration.js` + cache `dulia_session_data`.
6. `/resultados` refetch market + jobs al montar; `/vacantes` refetch solo jobs.
7. `/resultados` → análisis IA, plan (tabs), radar, timeline, coach; enlace a `/vacantes`.
8. PDF (`generateAnalysisPdf.jsx`): bloques por sección → html2canvas (PNG) → jsPDF; fondo oscuro en cada hoja (lazy).

Si el backend **no responde** (sin red), `api.js` usa mocks personalizados al perfil (`mockResultsBundle.js`, `mockProgress.js`, etc.). Errores HTTP (4xx/5xx) se propagan; respuestas vacías del API (`[]`, `null`) no se rellenan con demo. `current_day` del progreso: backend desde `started_at`; mock en `utils/progressDay.js`.

### API cliente (`services/api.js`)

| Función | Endpoint / rol |
|---------|----------------|
| `createProfile` | POST `/profile` |
| `getProfile` | GET `/profile/{session_id}` |
| `parseCvPdf` | POST `/profile/parse-cv` → `normalizeCvParseResponse` |
| `loadResultsBundle` | Plan 2: analyze + action-plan + jobs/market/radar/timeline |
| `getRecommendedJobs` | GET `/jobs/recommended/{session_id}` |
| `getMarketDashboard` | GET `/market/dashboard/{session_id}` (preferido) o `/market/dashboard?city=...` |
| `getRadarData` | GET `/profile/{id}/radar-data` |
| `postCoachChat` | POST `/coach/chat` |
| `linkSession` | POST `/auth/link-session` (tras login, best-effort) |
| `hasProfile` | GET `/user/has-profile` (guard post-login; offline → `has_profile: false`) |
| `getProgress` / `toggleTask` / `initProgress` | Progreso del plan 30-60-90 — API o mock (`dataSource` en store) |
| `startInterview` / `submitAnswer` / `finishInterview` | Mock interview quiz V1 por skill |
| `interviewV2Api` / `useInterviewV2Store` | Entrevista conversacional V2 — mock fallback hasta B8 |
| `interviewHistory` / `addTasksFromWeakSkills` | Historial + tareas desde skills débiles |

Ver mocks: `src/mocks/mockProgress.js`, `src/mocks/mockInterview.js`, `src/mocks/mockInterviewV2.js`. Stores: `useProgressStore`, `useInterviewStore`, `useInterviewV2Store`. UI progreso: `components/progress/`. Entrevista V2: `components/interview/v2/`, `pages/InterviewV2Page.jsx`. Utilidades: `utils/apiErrors.js` (`isBackendUnreachable`), `utils/progressDay.js`, `utils/progressScroll.js`, `utils/interviewV2Display.js`. Env: `VITE_FORCE_PROGRESS_MOCK=true` fuerza demo local; `VITE_INTERVIEW_VERSION=v2` (default).

### Nav global (`SiteHeader`)

| Enlace | Visible |
|--------|---------|
| Cómo funciona, Oportunidades (`/vacantes`), Sobre DulIA | Siempre |
| Mi progreso | Solo con sesión Supabase |
| Entrevistas | **No** en header — acceso desde `/progreso` |
| Iniciar sesión / Empezar | Según auth configurado |

### CTA «Registrar mi progreso» (`RegisterProgressButton`)

En `/resultados` (análisis + banner PDF): si hay sesión → `/progreso`; si no → `/login` con `state.from = /progreso`. Requiere `VITE_SUPABASE_*` configurado.

### Auth (opcional)

- `services/supabase.js` — cliente null-safe si faltan envs.
- `context/AuthProvider.jsx` + `hooks/useAuth.js` — sesión reactiva.
- `components/auth/ProtectedRoute.jsx` — `/perfil` y `/progreso` protegidas.
- `components/auth/AuthDisabledBanner.jsx` — aviso en login/registro sin envs.

## Estructura relevante

```
src/
├── pages/
├── components/         # about/, welcome/, onboarding/, results/, progress/, pdf/, vacancies/, motion/, …
├── components/motion/
│   └── RevealOnScroll.jsx   # Framer Motion: mount (hero) | scroll (secciones)
├── hooks/              # useOnboardingForm, useResultsSectionNav, useCoachContext, …
├── services/
│   ├── api.js
│   ├── mockResultsBundle.js   # fallbacks Plan 2 personalizados
│   ├── sessionHydration.js
│   └── mock*.js
├── constants/colombiaLocations.js, resultsSections.js
├── components/coach/AppCoachShell.jsx
├── context/CoachProvider.jsx
├── utils/coachPageContext.js
├── store/useProfileStore.js
├── utils/              # session, marketDisplay, analysisDisplay, coachSuggestions, planDisplay, …
└── styles/             # dulia-tokens.css, dulia-kit.css
```

Referencia de diseño (no producción): `ReBrand/DulIA Design System (1)/`.

## Animaciones (`/`)

| Capa | Implementación |
|------|------------------|
| Splash | `LandingSplash.jsx` + CSS — solo en **carga/refresco** de `/` (`utils/landingSplash.js`); navegación SPA al logo no repite splash |
| Auth en `/` | Usuario con sesión Supabase → `Navigate` a `/progreso` |
| Hero al cargar | `RevealOnScroll` con `trigger="mount"`; entra cuando termina el splash |
| Features / CTA | `RevealOnScroll` con `trigger="scroll"` (`whileInView`) |
| Dependencia | `framer-motion` — respeta `prefers-reduced-motion` |

Detalle técnico: [docs/decisions/2026-05-23-frontend-landing-animations.md](../docs/decisions/2026-05-23-frontend-landing-animations.md).

## Wizard (`/comenzar`)

| Paso | Campos destacados |
|------|-------------------|
| 0 — Quién eres | CV PDF opcional, DANE, edad (mín. 15) |
| 1 — Perfil laboral | `TagField` habilidades técnicas + sugerencias |
| 2 — Qué buscas | Sin "primer empleo junior" si ya tiene experiencia |

Validación: `onboardingValidation.js` + `validateOnboardingStep.js`.

Durante procesos lentos (lectura CV, envío del wizard) se muestra **`ProcessStatusBar`** — barra fija inferior con mensaje y nombre de archivo.

## Resultados (`/resultados`)

### Navegación por secciones

| Nav (6 ítems) | Contenido |
|---------------|-----------|
| Tu análisis | `AnalysisOverviewGrid` — score compacto + PDF (`pdf-card-in-grid`) + **Registrar mi progreso** (compacto) + resumen (580px desktop) |
| Mercado | `MarketThermometer` |
| Oportunidades | `OpportunitiesAndPlan` (vacantes + plan 30d) |
| Radar match | `RadarMatch` |
| Timeline | `CareerTimeline` |
| Descargar PDF | Banner final + **Registrar mi progreso** (compacto) |

- Desktop: `ResultsSectionNav` vertical sticky (`dulia-kit.css`).
- Móvil: chips horizontales sticky bajo el header.
- Anclas: `constants/resultsSections.js` + `useResultsSectionNav`.

### Coach (global en la SPA)

| Pieza | Rol |
|-------|-----|
| `AppCoachShell` | Envuelve rutas en `App.jsx`; oculto en login/registro/construcción |
| `CoachProvider` | Estado chat + contexto por ruta (`routePath`) |
| `coachPageContext.js` | Teaser y copy por pantalla |
| `CoachPromptBanner` | Aviso inline dismissible — **solo** `/resultados` |
| `CoachChatBubble` | FAB + teaser auto-ocultable + bienvenida personalizada |
| `CoachAskLink` | CTAs en landing, about, wizard, vacantes, score, plan, radar, mercado |
| `coachSuggestions.js` | Mensaje y chips iniciales desde perfil |

### Secciones (detalle)

| Sección | Componente |
|---------|------------|
| Tu análisis | `AnalysisOverviewGrid` — `ScoreCard` **`compactGrid`** + `PdfDownloadCard` **`pdf-card-in-grid`** + `RegisterProgressButton` compact (580px desktop, **congelado**) |
| Termómetro mercado | `MarketThermometer` — scope perfil, desglose geo, skills demandadas (`tienes`), modalidad/fuente (`marketDisplay.js`) |
| Vacantes + plan | `OpportunitiesAndPlan` — altura sync + scroll plan |
| Match radar | `RadarMatch` |
| Timeline + coach FAB | `CareerTimeline`, `CoachChatBubble` |
| PDF | `AnalysisPdfDocument` + `generateAnalysisPdf.jsx` — bloques `[data-pdf-block]`, `scrollHeight`, timeline/skills en export; `ScoreRing exportMode` |
| Carga larga | `ProcessStatusBar` — generación PDF |

## División de trabajo

Ver [COMPONENT_OWNERS.md](./COMPONENT_OWNERS.md).

Post-MVP (login, timeline plan, pitch): [../docs/EXTRA_IDEAS/post-mvp-roadmap.md](../docs/EXTRA_IDEAS/post-mvp-roadmap.md).

**Layout congelado:** diseño de `/resultados` aprobado — **no modificar** `.analysis-overview-grid*` ni `compactGrid` / `pdf-card-in-grid` sin pedido explícito. Ver `.cursor/rules/results-layout-frozen.mdc`.

### Auth (`/login`, `/registro`)

Botón ← sin texto: `navigate(-1)` si hay historial; fallback `/`.

## Deploy (Vercel)

- **Root directory:** `frontend`
- **Env:** `VITE_API_URL` apuntando al backend en producción
- SPA rewrites: `vercel.json` incluido

## ESLint

`eslint.config.js` ignora `dist/`, `.vite/**`, `ReBrand/**`, `node_modules/**` y **prototipos kit** (`src/pages/Landing.jsx`, `Results.jsx`, `Vacancies.jsx`, `Wizard.jsx`, `components/components.jsx`).  
`npm run lint` pasa en **0 errores** sobre el código de producción (`WelcomePage`, `ResultsPage`, hooks, etc.).

Tipos globales del kit (`window.DK`) en `src/vite-env.d.ts` para los prototipos Joufra.

## Documentación del proyecto

| Archivo | Contenido |
|---------|-----------|
| [ENDPOINTS.md](../docs/ENDPOINTS.md) | Contrato API |
| [PROJECT_STATE.md](../docs/PROJECT_STATE.md) | Estado del proyecto |
| [EXTRA_IDEAS/post-mvp-roadmap.md](../docs/EXTRA_IDEAS/post-mvp-roadmap.md) | Fase 2 y pitch |
