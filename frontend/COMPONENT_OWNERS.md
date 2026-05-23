# División de componentes — Frontend DulIA

Estructura para trabajar en paralelo sin conflictos.  
**Regla:** edita solo los archivos de tu zona. Las pages solo orquestan imports.

## Migue — onboarding, formulario, API

| Archivo | Descripción |
|---------|-------------|
| `src/components/onboarding/*` | Wizard completo + CvUpload |
| `src/hooks/useOnboardingForm.js` | Estado y validación del wizard |
| `src/utils/buildProfilePayload.js` | Payload JSON al backend |
| `src/utils/validateOnboardingStep.js` | Validación por paso |
| `src/utils/validateCvFile.js` | Validación PDF 5MB |
| `src/utils/formatProfileLabels.js` | Labels legibles del perfil |
| `src/constants/onboardingOptions.js` | Opciones de selects |
| `src/constants/emptyForm.js` | Estado inicial del form |
| `src/services/submitProfileWithCv.js` | Envío JSON + multipart |
| `src/services/api.js` | Cliente Axios (`VITE_API_URL`) |
| `src/components/ui/FileInput.jsx` | Input de archivo reutilizable |
| `src/components/shared/PrivacyNotice.jsx` | Aviso sin sesión |
| `src/store/useProfileStore.js` | Estado global (coordinar cambios) |

## Compañero — resultados, PDF, landing

| Archivo | Descripción |
|---------|-------------|
| `src/components/results/*` | Pantalla de resultados |
| `src/hooks/usePdfDownload.js` | Descarga PDF |
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
| Multipart profile + CV | ✅ frontend listo |
| UserProfileCard en resultados | ✅ |
| Mock con `cv_parsed` | ✅ |
| Deploy Vercel | 🔲 — root `frontend`, env `VITE_API_URL` |
| ProfileSummary enriquecido con texto IA del backend | 🔲 cuando Carlos conecte Gemini |
