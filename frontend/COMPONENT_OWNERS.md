# División de componentes — Frontend DulIA

Estructura para trabajar en paralelo sin conflictos.  
**Regla:** edita solo los archivos de tu zona. Las pages solo orquestan imports.

## Migue — onboarding, formulario, API

| Archivo | Descripción |
|---------|-------------|
| `src/components/onboarding/*` | Wizard completo (4 pasos) |
| `src/hooks/useOnboardingForm.js` | Estado, validación y POST profile |
| `src/utils/buildProfilePayload.js` | Payload JSON → POST /api/profile |
| `src/utils/session.js` | session_id en localStorage |
| `src/utils/validateOnboardingStep.js` | Validación por paso |
| `src/utils/formatProfileLabels.js` | Labels legibles del perfil |
| `src/constants/onboardingOptions.js` | Opciones de selects |
| `src/constants/emptyForm.js` | Estado inicial del form |
| `src/services/api.js` | Cliente Axios (`VITE_API_URL`) |
| `src/services/mockData.js` | Fallback cuando backend usa mock |
| `src/components/shared/PrivacyNotice.jsx` | Aviso sin sesión |
| `src/store/useProfileStore.js` | Estado global (coordinar cambios) |

## Compañero — resultados, PDF, landing

| Archivo | Descripción |
|---------|-------------|
| `src/components/results/*` | Pantalla de resultados |
| `src/hooks/usePdfDownload.js` | Descarga PDF |
| `src/hooks/useResultsData.js` | Carga jobs + market |
| `src/utils/generateAnalysisPdf.js` | Generación jsPDF |
| `src/components/welcome/*` | Landing sections |
| `src/components/layout/SiteHeader.jsx` | Header landing |
| `src/components/layout/SiteFooter.jsx` | Footer |

## Compartido (avisar antes de tocar)

| Archivo | Notas |
|---------|-------|
| `src/pages/OnboardingPage.jsx` | Solo imports |
| `src/pages/ResultsPage.jsx` | Solo imports |
| `src/pages/WelcomePage.jsx` | Solo imports |
| `src/App.jsx` | Rutas |
| `src/index.css` / `src/styles/*` | Design system |

## Flujo Git

1. `git checkout FRONT && git pull`
2. Implementar en **tus** archivos
3. `npm run build` antes de push
4. Merge a `FRONT` → luego `main`

## Hecho vs pendiente

| Pieza | Estado |
|-------|--------|
| POST /api/profile (JSON) + session_id | ✅ |
| GET jobs + market dashboard | ✅ |
| UserProfileCard + OpportunitiesList + MarketThermometer | ✅ |
| PDF con jobs y termómetro | ✅ |
| Deploy Vercel | 🔲 — root `frontend`, env `VITE_API_URL` |
| Coach / chat (Fase 8) | 🔲 pendiente backend |
