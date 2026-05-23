# División de componentes — Frontend DulIA

Estructura para trabajar en paralelo sin conflictos.  
**Regla:** edita solo los archivos de tu zona. Las pages solo orquestan imports.

## Migue — Sobre DulIA (+ onboarding/API si aplica)

| Archivo | Descripción |
|---------|-------------|
| `src/pages/AboutPage.jsx` | Orquestador fino — **tu pantalla principal** |
| `src/components/about/*` | Secciones de Sobre DulIA (hero, problema, audiencia, modelo, equipo, CTA) |
| `src/components/onboarding/*` | Wizard (si sigues en API) |
| `src/hooks/useOnboardingForm.js` | POST profile + jobs |
| `src/services/api.js` | Cliente Axios |
| `src/store/useProfileStore.js` | Estado global (coordinar cambios) |

## Compañero — landing, resultados, vacantes

| Archivo | Descripción |
|---------|-------------|
| `src/components/welcome/*` | Pantalla 01 — Landing (kit ReBrand) |
| `src/components/layout/LandingFooter.jsx` | Footer landing |
| `src/pages/VacanciesPage.jsx` | Pantalla 04 — Panel vacantes |
| `src/components/vacancies/*` | Semáforo, filtros, filas |
| `src/components/results/*` | Pantalla 03 — Resultados (ScoreCard, PdfDownloadCard, …) |
| `src/components/layout/SiteHeader.jsx` | Header compartido (avisar antes de tocar) |
| `src/components/layout/SiteFooter.jsx` | Footer global |

## Compartido (avisar antes de tocar)

| Archivo | Notas |
|---------|-------|
| `src/pages/WelcomePage.jsx` | Landing — compañero |
| `src/pages/OnboardingPage.jsx` | Wizard |
| `src/pages/ResultsPage.jsx` | Resultados |
| `src/App.jsx` | Rutas (`/sobre` = Migue) |
| `src/index.css` / `src/styles/*` | Design system (`dulia-tokens.css`, `dulia-kit.css`) |
| `ReBrand/` | Referencia visual — no editar para producción |

## Archivos huérfanos (limpieza pendiente)

Contenido movido al kit ReBrand o a `/sobre`; no importados en la app:

- `src/components/welcome/ProblemSection.jsx`, `AudienceSection.jsx`, `BusinessModelSection.jsx`
- `src/components/results/ResultsHeader.jsx`, `ResultsHeroTitle.jsx`, `ResultsBottomCta.jsx`, `OpportunitiesList.jsx`, `MarketThermometer.jsx`, `UserProfileCard.jsx`

## Rutas del kit

| Ruta | Pantalla | Dueño |
|------|----------|-------|
| `/` | Landing | Compañero |
| `/sobre` | **Sobre DulIA** | **Migue** |
| `/comenzar` | Wizard | Compartido |
| `/resultados` | Resultados | Compañero |
| `/vacantes` | Vacantes | Compañero |

## Flujo Git

1. `git checkout FRONT && git pull`
2. Implementar en **tus** archivos (`components/about/*`)
3. `npm run build` antes de push
4. Merge a `FRONT` → luego `main`
