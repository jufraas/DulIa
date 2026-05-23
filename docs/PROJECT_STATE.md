# PROJECT_STATE — Estado del proyecto

_Actualiza este archivo cada vez que un módulo pase de estado._

## Última actualización

2026-05-23 — Rehidratación de sesión, subida CV PDF, splash landing, pulido `/sobre`.

## Estado por módulo

| Módulo | Estado | Notas |
|--------|--------|-------|
| Repositorio | ✅ Listo | Ramas FRONT y Backend integradas |
| Backend (FastAPI) | 🚧 Fases 0–10 | API completa + `parse-cv`; falta deploy (Fase 11) |
| Frontend (React+Vite) | 🚧 En progreso | UI kit ReBrand (5 rutas); sesión persistente; falta deploy |
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
| `/resultados` | Score, perfil, top jobs, plan 30d, PDF | Joufra | ✅ |
| `/vacantes` | Panel semáforo (verde/amarillo/rojo) | Joufra | ✅ |

### Piezas transversales

| Pieza | Estado | Notas |
|-------|--------|-------|
| Design system (`dulia-tokens.css`, `dulia-kit.css`) | ✅ | Basado en ReBrand |
| Integración Axios → API | ✅ | `services/api.js` + fallback `mockData.js` |
| `session_id` en localStorage | ✅ | Clave `dulia_session_id` |
| Rehidratación de sesión al refresh | ✅ | `sessionCache.js` + `sessionHydration.js` + `GET /profile` |
| Borrador wizard al refresh | ✅ | Clave `dulia_wizard_draft` |
| Subida CV PDF (paso 0 wizard) | ✅ | `POST /profile/parse-cv` + fallback mock |
| POST `/profile` al completar wizard | ✅ | Alineado a contrato JSON en `ENDPOINTS.md` |
| GET jobs + market en paralelo | ✅ | Tras guardar perfil |
| Descarga PDF (jsPDF) | ✅ | Incluye jobs + mercado si están en store |
| Deploy producción (Vercel) | 🔲 | Root: `frontend`, env `VITE_API_URL` |

### Deuda técnica frontend

| Item | Prioridad | Detalle |
|------|-----------|---------|
| Fallback mock en `createProfile` | — | ✅ `mockProfileFromPayload.js` |
| Termómetro mercado no visible en UI | Baja | Datos van al PDF; `MarketThermometer.jsx` huérfano |
| Plan 30 días dinámico | — | ✅ front listo (`getPlan`); backend Carlos pendiente |
| ESLint ruidoso | — | ✅ Ignora `.vite/**`, `ReBrand/**`, `node_modules/**` |

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
1. Levantar backend con `USE_MOCK_DATA=true` y probar flujo wizard → resultados → refresh
2. Frontend: deploy Vercel (`VITE_API_URL` apuntando al backend)
3. Backend Fase 11: deploy con `CORS_ORIGINS=<url-front>`

### Frontend
1. Migue: commit + push a rama `FRONT`
2. Joufra: pulir landing, resultados, vacantes; termómetro en UI; plan 30d dinámico

### Pipeline
1. Insertar vacantes en tabla `jobs` para modo real
