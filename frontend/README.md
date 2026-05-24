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
```

## Variables de entorno

| Variable | Default dev |
|----------|-------------|
| `VITE_API_URL` | `http://localhost:8000/api` |
| `VITE_SUPABASE_URL` | — (opcional; sin ella auth queda deshabilitada) |
| `VITE_SUPABASE_ANON_KEY` | — (misma anon key del backend; **nunca** `service_role`) |

Crear `frontend/.env` (o `.env.local`) copiando `.env.example`:

```
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Script opcional: `../scripts/setup-env.sh` copia `.env.example` → `.env` en backend y frontend.

Si el backend corre en otro puerto (p. ej. `8001`):

```
VITE_API_URL=http://127.0.0.1:8001/api
```

Llamadas con Gemini (`profile`, `analyze`, `action-plan`, `parse-cv`) usan timeout **120s** en `api.js`.

## Rutas de la app

| Ruta | Pantalla | Descripción |
|------|----------|-------------|
| `/` | Landing | Splash + hero + features + CTA (scroll reveal) |
| `/sobre` | Sobre DulIA | Problema, audiencia, modelo, equipo |
| `/comenzar` | Onboarding | Wizard **3 pasos** + CV PDF; tags de habilidades; validaciones edad/coherencia |
| `/resultados` | Resultados | Nav por secciones, score+resumen alineados, termómetro, plan, radar, coach, PDF |
| `/vacantes` | Vacantes | Termómetro + semáforo; **Volver a mi análisis** → `/resultados` |
| `/login` | Login | Email/password; banner demo si faltan envs Supabase |
| `/registro` | Registro | Upsert a `user_accounts` tras signUp |
| `/perfil` | Mi perfil | Protegida; datos cuenta + card análisis coach |

## Flujo de datos

1. Usuario completa wizard en `/comenzar` (departamento + municipio DANE; CV opcional; **habilidades en tags** con sugerencias; validación edad ≥15 y coherencia experiencia/tipo de oportunidad).
2. **POST** `/api/profile` con `session_id` (UUID en `localStorage`, clave `dulia_session_id`).
3. **`loadResultsBundle()`**: analyze → action-plan → jobs + market + radar + timeline.
4. Estado en Zustand (`savedProfile`, `jobs`, `market`, `plan`, `radar`, `timeline`, `analysis`).
5. Rehidratación al refresh vía `sessionHydration.js` + cache `dulia_session_data`.
6. `/resultados` → análisis IA, plan (tabs), radar, timeline, coach; enlace a `/vacantes`.
7. PDF (`generateAnalysisPdf.jsx`): bloques por sección → html2canvas (PNG) → jsPDF; fondo oscuro en cada hoja (lazy).

Si el backend/BD no responde, `mockResultsBundle.js` rellena datos personalizados al perfil. El plan 30d en mock usa plantilla (`mockPlan.js`); con backend OK llega desde `POST .../action-plan`.

### API cliente (`services/api.js`)

| Función | Endpoint / rol |
|---------|----------------|
| `createProfile` | POST `/profile` |
| `getProfile` | GET `/profile/{session_id}` |
| `parseCvPdf` | POST `/profile/parse-cv` → `normalizeCvParseResponse` |
| `loadResultsBundle` | Plan 2: analyze + action-plan + jobs/market/radar/timeline |
| `getRecommendedJobs` | GET `/jobs/recommended/{session_id}` |
| `getMarketDashboard` | GET `/market/dashboard` |
| `getRadarData` | GET `/profile/{id}/radar-data` |
| `postCoachChat` | POST `/coach/chat` |
| `linkSession` | POST `/auth/link-session` (tras login, best-effort) |

### Auth (opcional)

- `services/supabase.js` — cliente null-safe si faltan envs.
- `context/AuthProvider.jsx` + `hooks/useAuth.js` — sesión reactiva.
- `components/auth/ProtectedRoute.jsx` — solo `/perfil` protegida.
- `components/auth/AuthDisabledBanner.jsx` — aviso en login/registro sin envs.

## Estructura relevante

```
src/
├── pages/
├── components/         # about/, welcome/, onboarding/, results/, pdf/, vacancies/, motion/, …
├── components/motion/
│   └── RevealOnScroll.jsx   # Framer Motion: mount (hero) | scroll (secciones)
├── hooks/              # useOnboardingForm, useResultsSectionNav, useCoachContext, …
├── services/
│   ├── api.js
│   ├── mockResultsBundle.js   # fallbacks Plan 2 personalizados
│   ├── sessionHydration.js
│   └── mock*.js
├── constants/colombiaLocations.js, resultsSections.js
├── context/CoachProvider.jsx
├── store/useProfileStore.js
├── utils/              # session, marketDisplay, coachSuggestions, planDisplay, …
└── styles/             # dulia-tokens.css, dulia-kit.css
```

Referencia de diseño (no producción): `ReBrand/DulIA Design System (1)/`.

## Animaciones (`/`)

| Capa | Implementación |
|------|------------------|
| Splash | `LandingSplash.jsx` + CSS (`dulia-kit.css`) — fases en `WelcomePage.jsx` |
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
| Tu análisis | `AnalysisOverviewGrid` — contenedor único izq. (score + PDF) = resumen (580px desktop) |
| Mercado | `MarketThermometer` |
| Vacantes y plan | `OpportunitiesAndPlan` |
| Radar match | `RadarMatch` |
| Timeline | `CareerTimeline` |
| Descargar PDF | Banner final |

- Desktop: `ResultsSectionNav` vertical sticky (`dulia-kit.css`).
- Móvil: chips horizontales sticky bajo el header.
- Anclas: `constants/resultsSections.js` + `useResultsSectionNav`.

### Coach (solo `/resultados`)

| Pieza | Rol |
|-------|-----|
| `CoachProvider` | Estado chat + banner/teaser |
| `CoachPromptBanner` | Aviso inline dismissible (no sticky) |
| `CoachChatBubble` | FAB + teaser auto-ocultable + bienvenida personalizada |
| `CoachAskLink` | CTAs en score, resumen, mercado, radar, plan |
| `coachSuggestions.js` | Mensaje y chips iniciales desde perfil |

### Secciones (detalle)

| Sección | Componente |
|---------|------------|
| Tu análisis | `AnalysisOverviewGrid` — `card-dl` izq. (`ScoreCard` embedded + `PdfDownloadCard`) vs `ProfileSummary` |
| Termómetro mercado | `MarketThermometer` — modalidad/fuente (`marketDisplay.js`) |
| Vacantes + plan | `OpportunitiesAndPlan` — altura sync + scroll plan |
| Match radar | `RadarMatch` |
| Timeline + coach FAB | `CareerTimeline`, `CoachChatBubble` |
| PDF | `AnalysisPdfDocument` + `generateAnalysisPdf.jsx` — captura por `[data-pdf-block]`, fondo uniforme |
| Carga larga | `ProcessStatusBar` — generación PDF |

## División de trabajo

Ver [COMPONENT_OWNERS.md](./COMPONENT_OWNERS.md).

Post-MVP (login, timeline plan, pitch): [../docs/EXTRA_IDEAS/post-mvp-roadmap.md](../docs/EXTRA_IDEAS/post-mvp-roadmap.md).

**Layout congelado:** el diseño visual de `/resultados` no se modifica sin pedido explícito — ver `.cursor/rules/results-layout-frozen.mdc`.

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
