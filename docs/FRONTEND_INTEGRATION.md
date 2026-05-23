# FRONTEND_INTEGRATION — Guía de integración con el backend

> **Para el equipo frontend.** Contrato técnico completo en [ENDPOINTS.md](ENDPOINTS.md).  
> **Deploy:** pendiente — usar backend local hasta tener URL de producción.

**Última actualización:** 2026-05-23 · Plan 2 integrado en frontend + termómetro en UI.

---

## Estado de integración frontend (2026-05-23)

| Pieza | Estado | Notas |
|-------|--------|-------|
| `loadResultsBundle()` | ✅ | Tras wizard y rehidratación |
| `POST .../analyze` | ✅ | Fallback: `buildMockAnalysisFromProfile` |
| `POST .../action-plan` | ✅ | `ThirtyDayPlan` ← `fase_30` |
| `GET .../radar-data` | ✅ | `RadarMatch.jsx` (5 dimensiones) |
| `GET .../timeline-data` | ✅ API | UI timeline pendiente (datos en store) |
| `GET market/dashboard` | ✅ | `MarketThermometer` en `/resultados` y `/vacantes` |
| Fallbacks offline | ✅ | `mockResultsBundle.js` — rellena huecos al perfil |
| Wizard ubicación | ✅ | 32 deptos / 1.119 municipios (DANE) |
| Navegación vacantes | ✅ | `returnTo: '/resultados'`; botón **Volver a mi análisis** |

Ver decisión: [decisions/2026-05-23-frontend-plan2-locations-thermometer.md](decisions/2026-05-23-frontend-plan2-locations-thermometer.md).

---

## Configuración local

| Variable | Valor dev |
|----------|-----------|
| `VITE_API_URL` | `http://localhost:8000/api` |
| Backend | `cd backend && USE_MOCK_DATA=true uvicorn main:app --reload` |
| Swagger | http://localhost:8000/docs |

**`session_id`:** UUID en `localStorage` bajo la clave `dulia_session_id`. Enviarlo en body o path según el endpoint.

---

## Flujo completo recomendado

```
/comenzar (wizard)
    │
    ▼
POST /api/profile                    ← guardar perfil
    │
    ├── POST /api/profile/{id}/analyze      ← análisis IA (Plan 2)
    ├── POST /api/profile/{id}/action-plan  ← plan 30-60-90 (Plan 2)
    │
    ├── GET /api/jobs/recommended/{id}      ← vacantes con score
    ├── GET /api/market/dashboard?city=...  ← termómetro
    │
    ├── GET /api/profile/{id}/radar-data    ← gráfica radar (Plan 2)
    └── GET /api/profile/{id}/timeline-data ← gráfica timeline (Plan 2)
    │
    ▼
/resultados  ·  /vacantes  ·  coach (POST /api/coach/chat)
```

En **mock** (`USE_MOCK_DATA=true`): no hace falta Supabase; analyze, action-plan, radar y timeline responden con datos de ejemplo.

En **modo real**: orden estricto para timeline → `profile` → `analyze` → `action-plan` → `radar-data` / `timeline-data`.

---

## Endpoints MVP (ya integrados)

| Cuándo | Método | Ruta | Qué recibes |
|--------|--------|------|-------------|
| Tras wizard | POST | `/profile` | Perfil (`ProfileOut`) |
| Recargar perfil | GET | `/profile/{session_id}` | Mismo shape (404 en mock) |
| Pantalla vacantes | GET | `/jobs/recommended/{session_id}` | Array de vacantes + score |
| Termómetro / PDF | GET | `/market/dashboard?city=...` | Stats agregadas |
| Coach chat | POST | `/coach/chat` | `{ respuesta, sugerencias_rapidas }` |

Detalle JSON: [ENDPOINTS.md](ENDPOINTS.md).

---

## Plan 2 — qué consumir en `/resultados`

### 1. Análisis del perfil

```
POST /api/profile/{session_id}/analyze
POST /api/profile/{session_id}/analyze?regenerate=true   ← forzar nuevo
```

**Response:**
```json
{
  "session_id": "...",
  "analisis": {
    "fortalezas": [{ "area": "...", "descripcion": "...", "nivel": "alto" }],
    "debilidades": [{ "area": "...", "descripcion": "...", "impacto": "medio" }],
    "gaps_mercado": [{ "habilidad": "python", "demanda": "alta", "tu_nivel": "medio", "brecha": "..." }],
    "oportunidades": [{ "sector": "...", "razon": "...", "potencial": "alto", "accion_inmediata": "..." }],
    "nivel_preparacion": { "overall": 72, "descripcion": "...", "comparativa": "..." },
    "recomendaciones": ["...", "..."]
  },
  "generado_en": "2026-05-23T..."
}
```

**UI sugerida:** cards de fortalezas/debilidades; badge con `nivel_preparacion.overall` (0–100).

---

### 2. Plan de acción 30-60-90

```
POST /api/profile/{session_id}/action-plan
```

**Response:**
```json
{
  "session_id": "...",
  "plan": {
    "resumen_ejecutivo": "...",
    "fase_30": {
      "titulo": "Fundamentos y Preparación",
      "objetivo": "...",
      "acciones": [{ "semana": 1, "tarea": "...", "duracion_estimada": "...", "recursos_necesarios": [], "como_verificar": "..." }],
      "metricas": ["..."]
    },
    "fase_60": { "...": "..." },
    "fase_90": { "...": "..." },
    "recursos_recomendados": [{ "tipo": "curso", "nombre": "...", "descripcion": "...", "duracion": "...", "costo_aprox": "Gratis" }],
    "milestones": [{ "dia": 30, "logro": "..." }]
  },
  "generado_en": "..."
}
```

**UI sugerida:** reemplazar el plan 30 días estático (`ThirtyDayPlan.jsx`) por `plan.fase_30` + tabs 60/90.

---

### 3. Gráfica radar (recharts)

```
GET /api/profile/{session_id}/radar-data
```

**Response:**
```json
{
  "session_id": "...",
  "radar": {
    "usuario": {
      "habilidades_tecnicas": 75,
      "experiencia": 60,
      "educacion": 80,
      "ubicacion_modalidad": 90,
      "preparacion": 72
    },
    "mercado_promedio": {
      "habilidades_tecnicas": 70,
      "experiencia": 60,
      "educacion": 75,
      "ubicacion_modalidad": 80,
      "preparacion": 65
    },
    "descripcion_dimensiones": {
      "habilidades_tecnicas": "Alineación de tus skills con la demanda actual del mercado",
      "experiencia": "...",
      "educacion": "...",
      "ubicacion_modalidad": "...",
      "preparacion": "..."
    }
  }
}
```

**Mapeo a recharts** (ejemplo):

```javascript
const { radar } = await api.get(`/profile/${sessionId}/radar-data`);

const labels = {
  habilidades_tecnicas: "Habilidades técnicas",
  experiencia: "Experiencia",
  educacion: "Educación",
  ubicacion_modalidad: "Ubicación / modalidad",
  preparacion: "Preparación",
};

const radarData = Object.keys(radar.usuario).map((key) => ({
  subject: labels[key],
  A: radar.usuario[key],           // usuario
  B: radar.mercado_promedio[key], // mercado
  fullMark: 100,
}));
```

Librería sugerida: `recharts` → `<RadarChart>` con dos series `A` y `B`.

---

### 4. Timeline de evolución

```
GET /api/profile/{session_id}/timeline-data
```

**404** si no hay plan (modo real) — mensaje: `"Plan de acción no encontrado..."`.

**Response:**
```json
{
  "session_id": "...",
  "timeline": {
    "inicio": "2026-05-23",
    "fases": [
      {
        "dia": 0,
        "tipo": "inicio",
        "titulo": "Hoy",
        "descripcion": "...",
        "metricas": { "score_promedio": 72, "vacantes_match": 2, "habilidades": 3 }
      },
      {
        "dia": 30,
        "tipo": "milestone",
        "titulo": "Día 30: Fundamentos y Preparación",
        "descripcion": "...",
        "metricas_esperadas": { "score_promedio": 82, "vacantes_match": 7, "habilidades": 5 },
        "acciones_completadas": ["Actualizar CV...", "..."]
      }
    ],
    "proyeccion": {
      "descripcion": "Con este plan, esperamos aumentar tu score...",
      "tasa_crecimiento_semanal": 1.7
    }
  }
}
```

**UI sugerida:** línea horizontal o steps con `dia` 0 → 30 → 60 → 90; mostrar `metricas` vs `metricas_esperadas`.

---

## Ejemplo Axios (secuencia Plan 2)

```javascript
import { loadResultsBundle } from "./services/api";

const sessionId = localStorage.getItem("dulia_session_id");

// Tras POST /profile en el wizard:
const { jobs, market, plan, radar, timeline, analysis } =
  await loadResultsBundle(sessionId, savedProfile);

// jobs → vacantes · market → MarketThermometer · plan → ThirtyDayPlan
// radar → RadarMatch · timeline → (UI pendiente)
```

---

## Rate limits y errores

| Endpoint | Límite |
|----------|--------|
| POST `/profile` | 10 req/min por IP |
| POST `/profile/.../analyze` | 10 req/min por IP |
| POST `/profile/.../action-plan` | 10 req/min por IP |
| POST `/coach/chat` | 10 req/min por IP |

Errores: `{ "detail": "mensaje" }` — códigos 404, 429, 500.

---

## Mock vs producción

| | Mock (`USE_MOCK_DATA=true`) | Producción (pendiente deploy) |
|--|----------------------------|-------------------------------|
| URL | `localhost:8000/api` | `https://<backend>/api` (TBD) |
| Perfil GET | 404 — guardar estado local tras POST | 200 desde Supabase |
| Analyze / plan / radar / timeline | Datos fijos realistas | Gemini + BD |
| Jobs | 2 vacantes ejemplo | Pipeline + Supabase |

**Deploy backend:** Fase 11 pendiente. Cuando exista URL prod, solo cambiar `VITE_API_URL` y configurar `CORS_ORIGINS` en el backend.

---

## Referencias

| Doc | Contenido |
|-----|-----------|
| [ENDPOINTS.md](ENDPOINTS.md) | Contrato JSON completo |
| [SCHEMA.md](SCHEMA.md) | Tablas Supabase |
| [frontend/COMPONENT_OWNERS.md](../frontend/COMPONENT_OWNERS.md) | Dueños por pantalla |
