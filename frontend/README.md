# DulIA — Frontend

SPA React + Vite para el coach de carrera DulIA (Barranqui-IA 2026). UI alineada al kit **ReBrand** con pantallas separadas.

## Arrancar

```bash
cd frontend          # importante: desde esta carpeta
npm install
npm run dev          # http://localhost:5173
npm run build        # verificar antes de push
npm run lint         # ESLint (ver nota abajo)
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
| `/` | Landing | Hero + Features + footer |
| `/sobre` | Sobre DulIA | Problema, audiencia, modelo, equipo |
| `/comenzar` | Onboarding | Wizard **3 pasos** |
| `/resultados` | Resultados | Score, perfil, top jobs, plan 30d, PDF |
| `/vacantes` | Vacantes | Panel con semáforo verde/amarillo/rojo |

## Flujo de datos

1. Usuario completa wizard en `/comenzar`.
2. **POST** `/api/profile` con `session_id` (UUID en `localStorage`, clave `dulia_session_id`).
3. En paralelo: **GET** jobs recomendados + dashboard de mercado.
4. Estado guardado en Zustand (`useProfileStore`).
5. `/resultados` muestra score y vacantes; `/vacantes` lista completa con filtros.
6. PDF descargable con jsPDF (incluye datos de mercado si están en store).

Si el backend no responde, el frontend usa mocks en `src/services/mockData.js`.

## Estructura relevante

```
src/
├── pages/              # Una page por ruta
├── components/
│   ├── about/          # /sobre
│   ├── welcome/        # Landing
│   ├── onboarding/     # Wizard (3 pasos)
│   ├── results/        # Resultados + PDF
│   ├── vacancies/      # Semáforo
│   ├── layout/         # Header, footers
│   ├── brand/          # Logo, ScoreRing
│   └── ui/             # Primitivos
├── hooks/
│   ├── useOnboardingForm.js
│   ├── useResultsData.js
│   └── usePdfDownload.js
├── services/
│   ├── api.js
│   └── mockData.js
├── store/
│   └── useProfileStore.js
├── styles/
│   ├── dulia-tokens.css
│   └── dulia-kit.css
└── utils/
    ├── session.js
    ├── buildProfilePayload.js
    └── generateAnalysisPdf.js
```

Referencia de diseño (no producción): `ReBrand/DulIA Design System (1)/`.

## División de trabajo

Ver [COMPONENT_OWNERS.md](./COMPONENT_OWNERS.md).

## Deploy (Vercel)

- **Root directory:** `frontend`
- **Env:** `VITE_API_URL` apuntando al backend en producción
- SPA rewrites: `vercel.json` incluido

## ESLint

`npm run lint` ejecuta `eslint .`. Si ves cientos de errores, suele ser porque analiza:

- `.vite/deps/` — caché de dependencias pre-empaquetadas de Vite
- `ReBrand/` — archivos de referencia del design system

Esos no son bugs del código de `src/`. Pendiente: excluir esas carpetas en `eslint.config.js`.

## Documentación del proyecto

| Archivo | Contenido |
|---------|-----------|
| [ENDPOINTS.md](../docs/ENDPOINTS.md) | Contrato API |
| [ARCHITECTURE.md](../docs/ARCHITECTURE.md) | Arquitectura |
| [PROJECT_STATE.md](../docs/PROJECT_STATE.md) | Estado del proyecto |
