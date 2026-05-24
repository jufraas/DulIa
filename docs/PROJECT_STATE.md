# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-24 — **Backend:** scoring v1.1 + termómetro híbrido (~380 jobs). **Front:** termómetro personalizado por perfil, refetch vacantes/resultados, labels analyze humanizados, auth Supabase opcional, PDF ampliado.

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Ramas FRONT y Backend integradas |
| Backend (FastAPI) | ✅ Fase 1 Plan 2 | Cadena real verificada (migración 004); deploy pendiente |
| Frontend (React+Vite) | ✅ MVP UI | Plan 2 en pantalla; mocks si API falla |
| Pipeline | ✅ Híbrido | getonbrd + remotive; `run_queue.py` + `run_baseline.py`; cache-first en backend |
| Base de datos | ✅ Datos + schema | Plan 2 + migraciones 004, **008**, **009**; ~380 jobs activos |
| Deploy | 🔲 No iniciado | Backend: Railway/Render + `CORS_ORIGINS`; Front: Vercel |

## Frontend — avance detallado

### Rutas (kit ReBrand)

| Ruta | Pantalla | Dueño | Estado |
|------|----------|-------|--------|
| `/` | Landing (splash + hero + features scroll reveal) | Joufra / Migue | ✅ |
| `/sobre` | Sobre DulIA | Migue | ✅ |
| `/comenzar` | Wizard onboarding (3 pasos + CV) | Compartido | ✅ |
| `/resultados` | Score, perfil, **termómetro**, jobs, plan 30-60-90, **RadarMatch**, timeline, **coach**, PDF completo | Joufra / Migue | ✅ |
| `/vacantes` | **Termómetro** + semáforo; **Volver → `/resultados`** | Joufra | ✅ |

### Piezas transversales (Migue — API / sesión)

| Pieza | Estado | Notas |
|-------|--------|-------|
| Design system (`dulia-tokens.css`, `dulia-kit.css`) | ✅ | Basado en ReBrand |
| Landing — splash + animaciones (Framer Motion) | ✅ | `RevealOnScroll`, `WelcomePage` fases |
| Wizard — ubicación DANE | ✅ | 32 deptos + 1.119 municipios; selects cascada |
| `RadarMatch` en `/resultados` | ✅ | `GET .../radar-data` + fallback `mockResultsBundle` |
| `MarketThermometer` | ✅ | `/resultados` y `/vacantes`; endpoint `GET /market/dashboard/{session_id}`; geo + skills demandadas + modalidad/fuente; refetch sin cache stale |
| `ProcessStatusBar` | ✅ | Barra fija inferior — CV, submit wizard, descarga PDF |
| Plan 2 frontend | ✅ | `loadResultsBundle`: analyze → action-plan → jobs/market/radar/timeline |
| Plan 30d — fuente de datos | ✅ | API `action-plan` (fase_30) o mock `buildMockPlanFromProfile` (nombre, ciudad, 1 tarea/ skill) |
| Navegación resultados ↔ vacantes | ✅ | `OpportunitiesPreview` → `/vacantes`; botón **Volver a mi análisis** → `/resultados` |
| Footers — copyright | ✅ | `© {year} DulIA` en `LandingFooter` y `SiteFooter` |
| Integración Axios → API | ✅ | `services/api.js` + `mockResultsBundle.js` |
| `session_id` + rehidratación al refresh | ✅ | `sessionCache.js`, `sessionHydration.js` |
| Borrador wizard al refresh | ✅ | `dulia_wizard_draft` |
| Subida CV PDF | ✅ | `parseCvPdf`; `markitdown[pdf]` + pdfplumber; validación MIME Windows |
| Layout `/resultados` | ✅ | **Congelado** — `AnalysisOverviewGrid` 580px; nuevos bloques solo entre/al final; regla `.cursor/rules/results-layout-frozen.mdc` |
| Nav secciones `/resultados` | ✅ | `ResultsSectionNav` — vertical sticky (desktop) / chips (móvil); 6 anclas agrupadas |
| Wizard — habilidades tags | ✅ | `TagField` + sugerencias; sin comas manuales |
| Wizard — validaciones | ✅ | Edad mín. 15; sin `primer_empleo` si `has_experience=si`; submit valida 3 pasos |
| POST `/profile` + mock fallback | ✅ | `mockProfileFromPayload.js` |
| GET jobs + market + plan + radar en bundle | ✅ | `loadResultsBundle()` tras wizard / rehidratación |
| `analysis` en UI + store | ✅ | Fortalezas/debilidades con labels humanizados (`humanizeArea`); score `nivel_preparacion` |
| Refetch market + jobs | ✅ | `VacanciesPage` + `useResultsData` — siempre al montar; evita 1 vacante vieja en localStorage |
| Coach chat UI | ✅ | `CoachProvider` + banner, teaser FAB, chips iniciales, `CoachAskLink` en tarjetas |
| Timeline Plan 2 UI | ✅ | `CareerTimeline` — días 0/30/60/90 |
| Tabs plan 60/90 | ✅ | `ThirtyDayPlan` — pestañas + milestones/recursos |
| Copy vacantes dinámico | ✅ | `OpportunitiesPreview` ← `market.total_vacantes_activas` |
| Links `url` en vacantes | ✅ | Preview + panel semáforo; mock con URLs demo |
| Descarga PDF | ✅ | Por secciones `[data-pdf-block]` · fondo `#0D0D0D` en cada hoja · PNG · `flushSync` (`react-dom`) · alerta si falla |
| ESLint | ✅ | `npm run lint` sin errores; ignora ReBrand + prototipos kit (`Landing.jsx`, …) |
| Deploy producción (Vercel) | 🔲 | Root: `frontend`, env `VITE_API_URL` |

### Pendiente UI (pre-pitch)

| Pieza | Prioridad | Notas |
|-------|-----------|-------|
| Deploy Vercel + backend prod | Alta | `VITE_API_URL`, CORS |
| Prueba E2E back real | Alta | `USE_MOCK_DATA=false` |
| Copy landing hardcode | Baja | Prototipos kit `Landing.jsx` / `Wizard.jsx` (huérfanos) |

Ver detalle post-MVP: [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md).

## Backend — fases

| Fase | Descripción | Estado |
|------|-------------|--------|
| 0–1 | Entorno + estructura + CORS | ✅ |
| 2 | Schema Supabase | ✅ Tablas + datos pipeline (~380 jobs) |
| 3–5 | Modelos + perfil + Gemini | ✅ |
| 6–7 | Jobs recomendados + mercado | ✅ (+ `por_modalidad`, `por_fuente` en dashboard) |
| 8 | Coach conversacional | ✅ |
| 9–10 | Seguridad + smoke tests | ✅ |
| 11 | Deploy | 🔲 |
| — | `GET /api/plan/{session_id}` | ⚠️ Legacy — front usa `POST .../action-plan` |
| P2-F1 | Análisis + plan IA | ✅ Real verificado (migración 004) |
| P2-F3 | Gráficas radar + timeline (API) | ✅ Real verificado |
| P2-F2 | Coach function calling | 🚧 Código en `app/services/coach/` |
| Híbrido | Cache-first + scrape_queue | ✅ Migraciones 008–009, `queue_service`, `run_queue.py` |
| Scoring v1.1 | Seniority filter + scores expresivos | ✅ Fases A–D (2026-05-24) |

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completo |
| 🚧 | En progreso |
| 🔲 | No iniciado |
| 🔁 | Cambio de alcance |
| ❌ | Bloqueado |

## Próximos pasos inmediatos

### Pitch / demo
1. **Backend:** `USE_MOCK_DATA=false`, migraciones 002+004, uvicorn `:8000` — smoke en [ENDPOINTS.md](ENDPOINTS.md#troubleshooting--modo-real-use_mock_datafalse)
2. **E2E:** wizard → resultados — Network con 200 en Plan 2; UI ya consume `analysis`/plan real
3. Pipeline: `run_queue.py --batch 5` tras perfiles exóticos; ver [PIPELINE_HYBRID.md](PIPELINE_HYBRID.md)
4. Deploy: **pospuesto** — `VITE_API_URL` + `CORS_ORIGINS`

### Post-MVP (no bloquean pitch)
- Login opcional + timeline del plan con progreso → [post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md)
- Startup Analyzer (spinoff) → [ideallamativamacondo.md](EXTRA_IDEAS/ideallamativamacondo.md)

## Documentación

| Doc | Contenido |
|-----|-----------|
| [ENDPOINTS.md](ENDPOINTS.md) | Contrato API + troubleshooting Plan 2 |
| [decisions/2026-05-23-backend-plan2-phase1-fixes.md](decisions/2026-05-23-backend-plan2-phase1-fixes.md) | Fixes RLS, dashboard, JSONB |
| [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) | Handoff Plan 2 (analyze, radar, timeline) |
| [PIPELINE_HYBRID.md](PIPELINE_HYBRID.md) | Cache-first, cola manual, CLIs |
| [handoff-frontend-analysis-labels.md](handoff-frontend-analysis-labels.md) | Labels humanos en resumen analyze (Migue) |
| [decisions/2026-05-24-jobs-seniority-scoring.md](decisions/2026-05-24-jobs-seniority-scoring.md) | Scoring v1.1 + filtro junior |
| [EXTRA_IDEAS/README.md](EXTRA_IDEAS/README.md) | Ideas fuera del MVP |
| [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md) | Roadmap fase 2 + guion pitch |
