# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-23 — FRONT: RadarMatch, splash/scroll, ESLint limpio. Main: Plan 2 F1–F3 (analyze, action-plan, radar/timeline API). Deploy pospuesto.

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Ramas FRONT y Backend integradas |
| Backend (FastAPI) | 🚧 Fases 0–10 + Plan 2 F3 | `parse-cv`, coach, analyze/action-plan, radar/timeline API; deploy pendiente |
| Frontend (React+Vite) | 🚧 En progreso | Kit ReBrand (5 rutas), RadarMatch UI, rehidratación; pulido Joufra pendiente |
| Pipeline | 🔁 En progreso | Insertar vacantes en `jobs` (mock / Adzuna) |
| Integración Gemini | ✅ | Profile, coach, CV parse; rate limit 10/min |
| Base de datos | 🚧 Schema listo | Tablas en Supabase; datos pendientes pipeline |
| Deploy | 🔲 No iniciado | Backend: Railway/Render + `CORS_ORIGINS`; Front: Vercel |

## Frontend — avance detallado

### Rutas (kit ReBrand)

| Ruta | Pantalla | Dueño | Estado |
|------|----------|-------|--------|
| `/` | Landing (splash + hero + features scroll reveal) | Joufra / Migue | ✅ |
| `/sobre` | Sobre DulIA | Migue | ✅ |
| `/comenzar` | Wizard onboarding (3 pasos + CV) | Compartido | ✅ |
| `/resultados` | Score, perfil, jobs, plan 30d, **RadarMatch**, PDF | Joufra / Migue | 🚧 falta termómetro + chat UI |
| `/vacantes` | Panel semáforo (verde/amarillo/rojo) | Joufra | ✅ |

### Piezas transversales (Migue — API / sesión)

| Pieza | Estado | Notas |
|-------|--------|-------|
| Design system (`dulia-tokens.css`, `dulia-kit.css`) | ✅ | Basado en ReBrand |
| Landing — splash + animaciones (Framer Motion) | ✅ | `RevealOnScroll`, `WelcomePage` fases |
| `RadarMatch` en `/resultados` | ✅ | Joufra (UI) + `radarMatchData.js` (perfil/jobs); ejes estimados |
| Footers — copyright | ✅ | `© {year} DulIA` en `LandingFooter` y `SiteFooter` |
| Integración Axios → API | ✅ | `services/api.js` + fallbacks mock |
| `session_id` + rehidratación al refresh | ✅ | `sessionCache.js`, `sessionHydration.js` |
| Borrador wizard al refresh | ✅ | `dulia_wizard_draft` |
| Subida CV PDF | ✅ | `POST /profile/parse-cv` + fallback en `api.js` |
| POST `/profile` + mock fallback | ✅ | `mockProfileFromPayload.js` |
| GET jobs + market + plan en paralelo | ✅ | Tras guardar perfil / rehidratación |
| `postCoachChat()` | ✅ API | UI burbuja → Joufra |
| `getPlan()` | ✅ front | Backend Carlos pendiente |
| Descarga PDF (jsPDF) | ✅ | Perfil + jobs + mercado (plan en PDF pendiente) |
| ESLint | ✅ | `npm run lint` sin errores; ignora ReBrand + prototipos kit (`Landing.jsx`, …) |
| Deploy producción (Vercel) | 🔲 | Root: `frontend`, env `VITE_API_URL` |

### Pendiente UI (Joufra — pre-pitch)

| Pieza | Prioridad | Notas |
|-------|-----------|-------|
| `MarketThermometer` en `/resultados` | Alta | Componente existe; no montado |
| Burbuja chat coach | Alta | Usar `postCoachChat()` de `api.js` |
| Conectar radar/timeline API Plan 2 | Media | Backend listo; front usa `RadarMatch` mock — ver [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) |
| Copy con datos reales | Media | `total_vacantes_activas` vs “15.000” hardcode |
| Plan 30d en PDF | Baja | `generateAnalysisPdf.js` |
| RadarMatch en PDF | Baja | Gráfica solo en UI por ahora |
| Links `url` en vacantes | Baja | Campo en API |

Ver detalle y fase 2: [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md).

## Backend — fases

| Fase | Descripción | Estado |
|------|-------------|--------|
| 0–1 | Entorno + estructura + CORS | ✅ |
| 2 | Schema Supabase | 🚧 Tablas ✅, datos pendientes pipeline |
| 3–5 | Modelos + perfil + Gemini | ✅ |
| 6–7 | Jobs recomendados + mercado | ✅ |
| 8 | Coach conversacional | ✅ |
| 9–10 | Seguridad + smoke tests | ✅ |
| 11 | Deploy | 🔲 |
| — | `GET /api/plan/{session_id}` | 🔲 Contrato legacy; preferir Plan 2 `action-plan` |
| P2-F3 | Gráficas radar + timeline (API) | ✅ Backend |
| P2-F1 | Análisis + plan IA | ✅ Servicios, rutas y prompts |
| P2-F2 | Coach function calling | 🚧 Código en `app/services/coach/` |

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
1. Probar flujo wizard → resultados → refresh (rehidratación + mock o backend real)
2. Joufra: termómetro + burbuja coach en UI
3. Integrar Plan 2 API en radar/timeline cuando convenga — [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
4. Jose: vacantes reales en `jobs`
5. Deploy (backend + front): **pospuesto** — `VITE_API_URL` + `CORS_ORIGINS`

### Post-MVP (no bloquean pitch)
- Login opcional + timeline del plan con progreso → [post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md)
- Startup Analyzer (spinoff) → [ideallamativamacondo.md](EXTRA_IDEAS/ideallamativamacondo.md)

## Documentación

| Doc | Contenido |
|-----|-----------|
| [ENDPOINTS.md](ENDPOINTS.md) | Contrato API |
| [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) | Handoff Plan 2 (analyze, radar, timeline) |
| [EXTRA_IDEAS/README.md](EXTRA_IDEAS/README.md) | Ideas fuera del MVP |
| [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md) | Roadmap fase 2 + guion pitch |
