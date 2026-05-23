# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-23 — Frontend alineado al kit ReBrand (5 rutas, pantallas separadas); documentación sincronizada.

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Estructura creada |
| Backend (FastAPI) | 🚧 En progreso | Contrato session_id + jobs/market; stub legacy en `main.py` |
| Frontend (React+Vite) | 🚧 En progreso | UI kit ReBrand integrada; falta deploy y pulido |
| Pipeline (scrapers) | 🔲 No iniciado | — |
| Integración Gemini | 🔲 No iniciado | Ver PROMPTS.md (Fase 8) |
| Base de datos | 🔲 No definida | Ver SCHEMA.md |
| Deploy | 🔲 No iniciado | `frontend/vercel.json` listo |

## Frontend — avance detallado

### Rutas (kit ReBrand)

| Ruta | Pantalla | Dueño | Estado |
|------|----------|-------|--------|
| `/` | Landing (Hero + Features + footer) | Compañero | ✅ |
| `/sobre` | Sobre DulIA | Migue | ✅ |
| `/comenzar` | Wizard onboarding (3 pasos) | Compartido | ✅ |
| `/resultados` | Score, perfil, top jobs, plan 30d, PDF | Compañero | ✅ |
| `/vacantes` | Panel semáforo (verde/amarillo/rojo) | Compañero | ✅ |

### Piezas transversales

| Pieza | Estado | Notas |
|-------|--------|-------|
| Design system (`dulia-tokens.css`, `dulia-kit.css`) | ✅ | Basado en ReBrand |
| `SiteHeader` / nav kit | ✅ | Cómo funciona, Oportunidades, Sobre DulIA, Empezar |
| Integración Axios → API Carlos (fallback mock) | ✅ | `services/api.js` + `mockData.js` |
| `session_id` en localStorage | ✅ | Clave `dulia_session_id` |
| POST `/profile` al completar wizard | ✅ | `useOnboardingForm.js` |
| GET jobs + market en paralelo | ✅ | Tras guardar perfil y en `/resultados` si falta estado |
| Descarga PDF (jsPDF) | ✅ | Incluye jobs + datos de mercado si están en store |
| Scaffolding por componentes | ✅ | Ver `frontend/COMPONENT_OWNERS.md` |
| Deploy producción (Vercel) | 🔲 | Root: `frontend`, env `VITE_API_URL` |
| Commit rama `FRONT` | 🔲 | — |

### Deuda técnica / pendiente frontend

| Item | Prioridad | Detalle |
|------|-----------|---------|
| Refresh en `/resultados` pierde estado | Media | Zustand solo en memoria; `GET /profile/{session_id}` existe en contrato pero no se usa aún |
| Termómetro mercado no visible en UI | Baja | `MarketThermometer.jsx` existe; datos de market van al PDF, no a la pantalla de resultados |
| Plan 30 días estático | Baja | `ThirtyDayPlan.jsx` — copy fijo, no generado por Gemini |
| Archivos huérfanos | Baja | `welcome/ProblemSection`, `AudienceSection`, `BusinessModelSection`; varios en `results/` del layout anterior |
| ESLint ruidoso | Baja | `eslint .` analiza `.vite/deps/` y `ReBrand/` — ignorar en config o excluir carpetas |
| Pulido visual/copy | Media | Migue: `/sobre`; compañero: landing, resultados, vacantes |

## Backend — pendiente (referencia para coordinación)

| Pieza | Estado |
|-------|--------|
| `GET /health` con `mock_data` | 🚧 |
| `POST /profile` (JSON + session_id) | 🚧 |
| `GET /profile/{session_id}` | 🚧 |
| `GET /jobs/recommended/{session_id}` | 🚧 |
| `GET /market/dashboard` | 🚧 |
| Migrar `main.py` del stub multipart legacy | 🚧 |
| MarkItDown PDF → markdown | ✅ módulo listo (fase posterior) |
| Coach / chat (Fase 8) | 🔲 |

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completo |
| 🚧 | En progreso |
| 🔲 | No iniciado |
| ❌ | Bloqueado |

## Próximos pasos inmediatos

### Frontend
1. Deploy Vercel (root: `frontend`, env `VITE_API_URL`)
2. Commit rama `FRONT`
3. Migue: pulir `/sobre` (`components/about/*`)
4. Compañero: pulir landing, resultados y vacantes
5. (Opcional) Excluir `.vite/**` y `ReBrand/**` en `eslint.config.js`

### Backend (Carlos)
1. Implementar endpoints según `docs/ENDPOINTS.md`
2. Conectar Gemini con PROMPTS.md
3. Coach / chat cuando esté listo Fase 8
