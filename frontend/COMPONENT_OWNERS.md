# División de componentes — Frontend DulIA

Estructura para trabajar en paralelo sin conflictos.  
**Regla:** edita solo los archivos de tu zona. Las pages solo orquestan imports.

## Migue — Sobre DulIA (+ onboarding/API si aplica)

| Archivo | Descripción |
|---------|-------------|
| `src/pages/AboutPage.jsx` | Orquestador fino — **tu pantalla principal** |
| `src/components/about/*` | Secciones de Sobre DulIA (hero, problema, audiencia, modelo, equipo, CTA) |
| `src/components/onboarding/*` | Wizard + subida CV (`CvUploadZone`) |
| `src/hooks/useOnboardingForm.js` | POST profile + `loadResultsBundle` + borrador wizard |
| `src/services/api.js` | Cliente Axios + Plan 2 + fallbacks |
| `src/services/mockResultsBundle.js` | Mocks personalizados (jobs, market, plan, radar, timeline) |
| `src/constants/colombiaLocations.js` | 32 deptos / 1.119 municipios DANE |
| `src/services/sessionHydration.js` | Lógica rehidratación (cache + bundle) |
| `src/services/mockCvPrefill.js` | Fallback parse-cv offline |
| `src/services/mockCoachChat.js` | Fallback coach offline |
| `src/services/mockPlan.js` | Fallback plan 30d offline |
| `src/utils/planDisplay.js` | Normaliza action-plan → UI (tabs 30/60/90) |
| `src/utils/analysisDisplay.js` | Parser respuesta analyze |
| `src/utils/timelineDisplay.js` | Parser timeline API |
| `src/utils/radarApi.js` | Parser radar API |
| `src/utils/generateAnalysisPdf.js` | PDF completo (analyze, plan, radar, …) |
| `src/store/useProfileStore.js` | Estado global + persistencia cache |
| `src/utils/sessionCache.js` | Lectura/escritura localStorage sesión |

## Joufra — landing, resultados, vacantes

| Archivo | Descripción |
|---------|-------------|
| `src/components/welcome/*` | Pantalla 01 — Landing (kit ReBrand): splash, hero, features |
| `src/components/motion/RevealOnScroll.jsx` | Framer Motion — scroll reveal y entrada al montar |
| `src/components/layout/LandingFooter.jsx` | Footer landing (copyright) |
| `src/components/layout/SiteFooter.jsx` | Footer global (copyright + contacto) |
| `src/pages/VacanciesPage.jsx` | Pantalla 04 — semáforo; **Volver a mi análisis** → `/resultados` |
| `src/components/vacancies/*` | Semáforo, filtros, filas |
| `src/components/results/*` | Resultados: `RadarMatch`, `ThirtyDayPlan`, `CareerTimeline`, `CoachChatBubble`, … |
| `src/components/layout/SiteHeader.jsx` | Header compartido (avisar antes de tocar) |
| `src/components/layout/SiteFooter.jsx` | Footer global |

## Compartido (avisar antes de tocar)

| Archivo | Notas |
|---------|-------|
| `src/pages/WelcomePage.jsx` | Landing — splash + fases (`splash`/`exit`/`done`) |
| `src/pages/OnboardingPage.jsx` | Wizard |
| `src/pages/ResultsPage.jsx` | Resultados — orquesta score, analyze, plan, radar, timeline, coach, PDF |
| `src/App.jsx` | Rutas (`/sobre` = Migue) |
| `src/index.css` / `src/styles/*` | Design system (`dulia-tokens.css`, `dulia-kit.css`) |
| `ReBrand/` | Referencia visual — no editar para producción |

## Archivos huérfanos (limpieza pendiente)

Contenido movido al kit ReBrand o a `/sobre`; no importados en la app:

- `src/components/welcome/ProblemSection.jsx`, `AudienceSection.jsx`, `BusinessModelSection.jsx`
- `src/components/results/ResultsHeader.jsx`, `ResultsHeroTitle.jsx`, `ResultsBottomCta.jsx`, `OpportunitiesList.jsx`, `UserProfileCard.jsx`
- `src/pages/Landing.jsx`, `Results.jsx`, `Vacancies.jsx`, `Wizard.jsx` — prototipos kit (`window.DK`); la app usa `*Page.jsx`

## Rutas del kit

| Ruta | Pantalla | Dueño |
|------|----------|-------|
| `/` | Landing | Joufra |
| `/sobre` | **Sobre DulIA** | **Migue** |
| `/comenzar` | Wizard | Compartido |
| `/resultados` | Resultados | Joufra |
| `/vacantes` | Vacantes | Joufra |

## Post-MVP y pitch

Deploy prod, login, pipeline jobs reales: [docs/EXTRA_IDEAS/post-mvp-roadmap.md](../docs/EXTRA_IDEAS/post-mvp-roadmap.md).

**Coach:** `CoachChatBubble` + `useCoachChat.js` — implementado en `/resultados`.

## Flujo Git

1. `git checkout FRONT && git pull`
2. Implementar en **tus** archivos (`components/about/*`)
3. `npm run build` antes de push
4. Merge a `FRONT` → luego `main`
