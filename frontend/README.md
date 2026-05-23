# DulIA — Frontend

SPA React + Vite para el coach de carrera DulIA (Barranqui-IA 2026). UI alineada al kit **ReBrand** con pantallas separadas.

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

Crear `frontend/.env.local` si el backend corre en otro puerto:

```
VITE_API_URL=http://localhost:8000/api
```

## Rutas de la app

| Ruta | Pantalla | Descripción |
|------|----------|-------------|
| `/` | Landing | Hero + splash + footer |
| `/sobre` | Sobre DulIA | Problema, audiencia, modelo, equipo |
| `/comenzar` | Onboarding | Wizard **3 pasos** + CV PDF opcional |
| `/resultados` | Resultados | Score, perfil, top jobs, plan 30d, PDF |
| `/vacantes` | Vacantes | Panel con semáforo verde/amarillo/rojo |

## Flujo de datos

1. Usuario completa wizard en `/comenzar` (opcional: sube CV → `parseCvPdf`).
2. **POST** `/api/profile` con `session_id` (UUID en `localStorage`, clave `dulia_session_id`).
3. En paralelo: **GET** jobs + market + plan.
4. Estado en Zustand (`useProfileStore`: `savedProfile`, `jobs`, `market`, `plan`).
5. Rehidratación al refresh vía `sessionHydration.js` + cache `dulia_session_data`.
6. `/resultados` y `/vacantes` consumen el store; PDF con jsPDF.

Si el backend no responde, fallbacks en `src/services/mock*.js`.

### API cliente (`services/api.js`)

| Función | Endpoint |
|---------|----------|
| `createProfile` | POST `/profile` |
| `getProfile` | GET `/profile/{session_id}` |
| `parseCvPdf` | POST `/profile/parse-cv` |
| `getRecommendedJobs` | GET `/jobs/recommended/{session_id}` |
| `getMarketDashboard` | GET `/market/dashboard` |
| `getPlan` | GET `/plan/{session_id}` (backend pendiente) |
| `postCoachChat` | POST `/coach/chat` (UI burbuja pendiente Joufra) |

## Estructura relevante

```
src/
├── pages/
├── components/         # about/, welcome/, onboarding/, results/, vacancies/, …
├── hooks/              # useOnboardingForm, useResultsData, useSessionHydration, …
├── services/
│   ├── api.js
│   ├── sessionHydration.js
│   └── mock*.js        # fallbacks offline
├── store/useProfileStore.js
├── utils/              # session, sessionCache, planDisplay, …
└── styles/             # dulia-tokens.css, dulia-kit.css
```

Referencia de diseño (no producción): `ReBrand/DulIA Design System (1)/`.

## División de trabajo

Ver [COMPONENT_OWNERS.md](./COMPONENT_OWNERS.md).

Post-MVP (login, timeline plan, pitch): [../docs/EXTRA_IDEAS/post-mvp-roadmap.md](../docs/EXTRA_IDEAS/post-mvp-roadmap.md).

## Deploy (Vercel)

- **Root directory:** `frontend`
- **Env:** `VITE_API_URL` apuntando al backend en producción
- SPA rewrites: `vercel.json` incluido

## ESLint

`eslint.config.js` ignora `dist/`, `.vite/**`, `ReBrand/**` y `node_modules/**`.  
`npm run lint` analiza principalmente `src/`. Quedan ~8 avisos reales en código de producción (effects, imports sin usar).

## Documentación del proyecto

| Archivo | Contenido |
|---------|-----------|
| [ENDPOINTS.md](../docs/ENDPOINTS.md) | Contrato API |
| [PROJECT_STATE.md](../docs/PROJECT_STATE.md) | Estado del proyecto |
| [EXTRA_IDEAS/post-mvp-roadmap.md](../docs/EXTRA_IDEAS/post-mvp-roadmap.md) | Fase 2 y pitch |
