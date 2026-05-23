# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-23 — Coach API, plan 30d (front), mocks unificados, ESLint, roadmap post-MVP documentado.

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Ramas FRONT y Backend integradas |
| Backend (FastAPI) | 🚧 Fases 0–10 | API + `parse-cv` + coach; falta `GET /plan` y deploy (Fase 11) |
| Frontend (React+Vite) | 🚧 En progreso | MVP funcional con mocks; pulido UI Joufra pendiente |
| Pipeline | 🔁 En progreso | Insertar vacantes en `jobs` (mock / Adzuna) |
| Integración Gemini | ✅ | Profile, coach, CV parse; rate limit 10/min |
| Base de datos | 🚧 Schema listo | Tablas en Supabase; datos pendientes pipeline |
| Deploy | 🔲 No iniciado | Backend: Railway/Render + `CORS_ORIGINS`; Front: Vercel |

## Frontend — avance detallado

### Rutas (kit ReBrand)

| Ruta | Pantalla | Dueño | Estado |
|------|----------|-------|--------|
| `/` | Landing (Hero + splash + footer) | Joufra | ✅ |
| `/sobre` | Sobre DulIA | Migue | ✅ |
| `/comenzar` | Wizard onboarding (3 pasos + CV) | Compartido | ✅ |
| `/resultados` | Score, perfil, top jobs, plan 30d, PDF | Joufra | 🚧 falta termómetro + chat UI |
| `/vacantes` | Panel semáforo (verde/amarillo/rojo) | Joufra | ✅ |

### Piezas transversales (Migue — API / sesión)

| Pieza | Estado | Notas |
|-------|--------|-------|
| Design system (`dulia-tokens.css`, `dulia-kit.css`) | ✅ | Basado en ReBrand |
| Integración Axios → API | ✅ | `services/api.js` + fallbacks mock |
| `session_id` + rehidratación al refresh | ✅ | `sessionCache.js`, `sessionHydration.js` |
| Borrador wizard al refresh | ✅ | `dulia_wizard_draft` |
| Subida CV PDF | ✅ | `POST /profile/parse-cv` + fallback en `api.js` |
| POST `/profile` + mock fallback | ✅ | `mockProfileFromPayload.js` |
| GET jobs + market + plan en paralelo | ✅ | Tras guardar perfil / rehidratación |
| `postCoachChat()` | ✅ API | UI burbuja → Joufra |
| `getPlan()` | ✅ front | Backend Carlos pendiente |
| Descarga PDF (jsPDF) | ✅ | Perfil + jobs + mercado (plan en PDF pendiente) |
| ESLint | ✅ | Ignora `.vite/**`, `ReBrand/**`, `node_modules/**` |
| Deploy producción (Vercel) | 🔲 | Root: `frontend`, env `VITE_API_URL` |

### Pendiente UI (Joufra — pre-pitch)

| Pieza | Prioridad | Notas |
|-------|-----------|-------|
| `MarketThermometer` en `/resultados` | Alta | Componente existe; no montado |
| Burbuja chat coach | Alta | Usar `postCoachChat()` de `api.js` |
| Copy con datos reales | Media | `total_vacantes_activas` vs “15.000” hardcode |
| Plan 30d en PDF | Baja | `generateAnalysisPdf.js` |
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
| — | `GET /api/plan/{session_id}` | 🔲 Contrato en ENDPOINTS; front listo |

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
1. Probar flujo wizard → resultados → refresh (mock o backend real)
2. Joufra: termómetro + burbuja coach en UI
3. Carlos: `GET /plan/{session_id}` + deploy backend (si aplica)
4. Jose: vacantes reales en `jobs`

### Post-MVP (no bloquean pitch)
- Login opcional + timeline del plan con progreso → [post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md)
- Startup Analyzer (spinoff) → [ideallamativamacondo.md](EXTRA_IDEAS/ideallamativamacondo.md)

## Documentación

| Doc | Contenido |
|-----|-----------|
| [ENDPOINTS.md](ENDPOINTS.md) | Contrato API |
| [EXTRA_IDEAS/README.md](EXTRA_IDEAS/README.md) | Ideas fuera del MVP |
| [EXTRA_IDEAS/post-mvp-roadmap.md](EXTRA_IDEAS/post-mvp-roadmap.md) | Roadmap fase 2 + guion pitch |
