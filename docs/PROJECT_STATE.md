# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-23 — Plan 2 F1–F3 documentado; prompts en PROMPTS.md; guía frontend en FRONTEND_INTEGRATION.md. Deploy pospuesto.

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Ramas FRONT y Backend integradas |
| Backend (FastAPI) | 🚧 Fases 0–10 + Plan 2 F3 | Gráficas radar/timeline listas; deploy pendiente |
| Frontend (React+Vite) | 🚧 En progreso | UI kit ReBrand (5 rutas); falta deploy y pulido |
| Pipeline | 🔁 En progreso | Insertar vacantes en `jobs` (mock / Adzuna) |
| Integración Gemini | ✅ | Profile, coach; rate limit 10/min |
| Base de datos | 🚧 Schema listo | Tablas en Supabase; datos pendientes pipeline |
| Deploy | 🔲 No iniciado | Backend: Railway/Render + `CORS_ORIGINS`; Front: Vercel |

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
| Integración Axios → API | ✅ | `services/api.js` + fallback `mockData.js` |
| `session_id` en localStorage | ✅ | Clave `dulia_session_id` |
| POST `/profile` al completar wizard | ✅ | Alineado a contrato JSON en `ENDPOINTS.md` |
| GET jobs + market en paralelo | ✅ | Tras guardar perfil |
| Descarga PDF (jsPDF) | ✅ | Incluye jobs + mercado si están en store |
| Deploy producción (Vercel) | 🔲 | Root: `frontend`, env `VITE_API_URL` |

### Deuda técnica frontend

| Item | Prioridad | Detalle |
|------|-----------|---------|
| Refresh en `/resultados` pierde estado | Media | Implementar `GET /profile/{session_id}` |
| Termómetro mercado no visible en UI | Baja | Datos van al PDF; `MarketThermometer.jsx` huérfano |
| Plan 30 días estático | Media | Consumir `POST .../action-plan` + `GET .../timeline-data` (ver FRONTEND_INTEGRATION.md) |
| Gráficas radar/timeline | Media | Consumir `GET .../radar-data` y `timeline-data` (recharts) |
| ESLint ruidoso | Baja | Excluir `.vite/**` y `ReBrand/**` |

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
| P2-F3 | Gráficas radar + timeline | ✅ |
| P2-F1 | Análisis + plan IA | ✅ Servicios, rutas y prompts (`PROFILE_ANALYSIS`, `ACTION_PLAN_GENERATOR`) |
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

### Integración
1. Frontend: seguir [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) — flujo Plan 2 en `/resultados`
2. Levantar backend con `USE_MOCK_DATA=true` y probar en Swagger (`/docs`)
3. Deploy (backend + front): **pospuesto** — cuando toque, `VITE_API_URL` + `CORS_ORIGINS`

### Frontend
1. Migue: pulir `/sobre`
2. Compañero: pulir landing, resultados, vacantes
3. Implementar rehidratación con `GET /profile/{session_id}`

### Pipeline
1. Insertar vacantes en tabla `jobs` para modo real
