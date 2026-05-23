# DulIA — Frontend

SPA React + Vite para el coach de carrera DulIA (Barranqui-IA 2026).

## Arrancar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # verificar antes de push
```

## Variables de entorno

| Variable | Default dev |
|----------|-------------|
| `VITE_API_URL` | `http://localhost:8000/api` |

Crear `frontend/.env.local` si el backend corre en otro puerto:

```
VITE_API_URL=http://localhost:8000/api
```

## Flujo de la app

1. **Landing** (`/`) — pitch y CTA
2. **Onboarding** (`/comenzar`) — wizard 4 pasos
3. **POST** `/api/profile` con `session_id` (UUID en `localStorage`)
4. **GET** jobs recomendados + dashboard de mercado (en paralelo)
5. **Resultados** (`/resultados`) — vacantes, termómetro, perfil
6. **PDF** — descarga con jsPDF

Si el backend no responde, el frontend usa mocks en `src/services/mockData.js`.

## Estructura relevante

```
src/
├── components/
│   ├── onboarding/   # Wizard
│   ├── results/        # Vacantes, mercado, perfil
│   ├── welcome/        # Landing
│   └── layout/         # Header, footer
├── hooks/
│   ├── useOnboardingForm.js
│   ├── useResultsData.js
│   └── usePdfDownload.js
├── services/
│   ├── api.js          # Cliente Axios
│   └── mockData.js     # Fallback offline
├── store/
│   └── useProfileStore.js
└── utils/
    ├── session.js
    ├── buildProfilePayload.js
    └── generateAnalysisPdf.js
```

## División de trabajo

Ver [COMPONENT_OWNERS.md](./COMPONENT_OWNERS.md).

## Documentación del proyecto

| Archivo | Contenido |
|---------|-----------|
| [ENDPOINTS.md](../docs/ENDPOINTS.md) | Contrato API |
| [ARCHITECTURE.md](../docs/ARCHITECTURE.md) | Arquitectura |
| [PROJECT_STATE.md](../docs/PROJECT_STATE.md) | Estado del proyecto |
