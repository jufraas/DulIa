# ENDPOINTS — Contrato de la API

> **Fuente de verdad para el frontend.** Contrato final — Fase 10 verificada.

**Última actualización:** 2026-05-23 · Fases 1–10 + `POST /profile/parse-cv` + rehidratación de sesión en frontend.

## Base URL

```
http://localhost:8000/api   ← desarrollo local
https://<dominio>/api       ← producción (por definir al deployar)
```

**Swagger:** `http://localhost:8000/docs`

---

## Convenciones

| Tema | Detalle |
|------|---------|
| Formato | JSON (`Content-Type: application/json`) |
| Auth | Ninguna. `session_id` = UUID en `localStorage` (clave sugerida: `dulia_session_id`) |
| Errores | `{ "detail": "mensaje" }` — 404, 422, 429, 500 según FastAPI |
| CORS | Dev: `*` o `CORS_ORIGINS`; prod: solo `CORS_ORIGINS` (ver `.env.example`) |
| Rate limit | `POST /profile`, `POST /profile/parse-cv`, `POST /profile/.../analyze`, `POST /profile/.../action-plan`, `POST /coach/chat`: **10 req/min por IP** (429 si excedes) |
| Mock | `USE_MOCK_DATA=true` en backend → respuestas de ejemplo sin Supabase/Gemini |

### Comportamiento con `USE_MOCK_DATA`

| Endpoint | `true` (dev) | `false` (real) |
|----------|--------------|----------------|
| `GET /health` | `mock_data: "true"` | `mock_data: "false"` |
| `POST /profile` | Responde perfil simulado, **no guarda** en BD | Gemini + Supabase |
| `POST /profile/parse-cv` | Prefill simulado (sin leer PDF real) | MarkItDown + Gemini |
| `GET /profile/{id}` | Siempre **404** | 200 si existe, 404 si no |
| `GET /jobs/recommended/{id}` | 2 vacantes mock (cualquier `session_id`) | Top 20 reales; `[]` sin perfil o sin jobs |
| `GET /market/dashboard` | Números fijos de ejemplo | Agrega sobre `jobs` activos |
| `GET /plan/{id}` | Plan mock genérico (frontend fallback) | Gemini + perfil; **pendiente implementación backend** |
| `POST /coach/chat` | Respuesta simulada | Gemini + perfil en Supabase; 404 sin perfil |
| `POST /profile/.../analyze` | Análisis mock fijo | Gemini + tabla `profile_analysis` |
| `POST /profile/.../action-plan` | Plan mock 30-60-90 | Gemini + tabla `action_plans`; requiere análisis previo |
| `GET /profile/.../radar-data` | 5 dimensiones mock | Calculado desde perfil + análisis + mercado |
| `GET /profile/.../timeline-data` | Timeline mock | Desde plan de acción; 404 en real sin plan |

> Guía paso a paso para frontend: [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)

---

## Flujo recomendado (frontend)

### MVP actual (FRONT — implementado)

1. Al iniciar la app: crear o leer `session_id` → `localStorage` (`dulia_session_id`).
2. **Rehidratación** (`sessionHydration.js`): restaurar perfil/jobs/market/plan desde cache; si no hay cache, `GET /api/profile/{session_id}` (modo real).
3. Wizard paso 0 (opcional): subir CV → `POST /api/profile/parse-cv` → prellenar formulario.
4. Onboarding terminado → `POST /api/profile` con el mismo `session_id`.
5. Pantalla resultados → `loadResultsBundle` → store (`jobs`, `market`, `plan`, `radar`, `timeline`); `RadarMatch` + `MarketThermometer`.
6. Refresh en `/resultados` o `/vacantes` → no redirige si la rehidratación recuperó el perfil.

### Plan 2 (backend listo — integración pendiente en UI)

Tras `POST /profile`, opcionalmente:

1. `POST /api/profile/{session_id}/analyze`
2. `POST /api/profile/{session_id}/action-plan`
3. `GET /api/profile/{session_id}/radar-data` + `GET .../timeline-data`

Ver [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md).

### Claves `localStorage` (frontend)

| Clave | Contenido |
|-------|-----------|
| `dulia_session_id` | UUID de sesión anónima |
| `dulia_session_data` | Cache: `savedProfile`, `jobs`, `market`, `plan`, `formSnapshot` |
| `dulia_wizard_draft` | Borrador del wizard si refresca en `/comenzar` |

> En mock, `GET /profile` devuelve 404 — el frontend confía en `dulia_session_data` tras completar el wizard.

---

## Endpoints

### Sistema

#### `GET /api/health` ✅

**Response 200:**
```json
{
  "status": "ok",
  "env": "development",
  "mock_data": "true"
}
```

---

### Perfil

#### `POST /api/profile` ✅

Recibe el onboarding (campos **planos** en el body), extrae/enriquece con Gemini (o fallback), guarda en Supabase si no es mock.

**Request body** — todos opcionales excepto `session_id`:

| Campo | Tipo | Notas |
|-------|------|-------|
| `session_id` | string | **Requerido.** UUID del frontend |
| `nombre` | string | |
| `edad` | integer | |
| `ciudad` | string | ej. `"Barranquilla"` |
| `departamento` | string | ej. `"Atlántico"` |
| `nivel_educativo` | string | `bachiller` \| `tecnico` \| `tecnologo` \| `universitario` \| `posgrado` |
| `carrera` | string | |
| `experiencia_anios` | number | default `0` |
| `habilidades` | string[] | El backend las normaliza a minúsculas |
| `sectores_interes` | string[] | |
| `salario_esperado_min` | integer | COP |
| `salario_esperado_max` | integer | COP |
| `modalidad` | string | `presencial` \| `remoto` \| `hibrido` \| `indiferente` |
| `texto_libre` | string | Contexto extra para Gemini |

**Ejemplo request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "nombre": "María López",
  "edad": 22,
  "ciudad": "Barranquilla",
  "departamento": "Atlántico",
  "nivel_educativo": "universitario",
  "carrera": "Ingeniería de Sistemas",
  "experiencia_anios": 1,
  "habilidades": ["Python", "Excel", "Git"],
  "sectores_interes": ["tecnología", "logística"],
  "salario_esperado_min": 2500000,
  "salario_esperado_max": 3500000,
  "modalidad": "hibrido",
  "texto_libre": "Me interesa data y startups del Caribe"
}
```

**Response 200** — solo estos campos se devuelven al front (`ProfileOut`):

```json
{
  "id": "uuid",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "nombre": "María López",
  "ciudad": "Barranquilla",
  "nivel_educativo": "universitario",
  "carrera": "Ingeniería de Sistemas",
  "experiencia_anios": 1,
  "habilidades": ["python", "excel", "git"],
  "sectores_interes": ["tecnología", "logística"],
  "modalidad": "hibrido",
  "created_at": "2026-05-23T15:00:00Z"
}
```

> `edad`, `departamento` y salarios se guardan en BD pero **no** vienen en esta respuesta. Si el front los necesita en UI, conservar estado local tras el POST o pedir ampliar `ProfileOut`.

**Errores:** `500` si falla Gemini/Supabase.

---

#### `GET /api/profile/{session_id}` ✅

**Response 200:** mismo shape que `POST /api/profile`.

**Response 404:** `{ "detail": "Perfil no encontrado" }`

> En `USE_MOCK_DATA=true` siempre 404. El frontend usa cache local (`dulia_session_data`) para sobrevivir refresh.

---

#### `POST /api/profile/parse-cv` ✅

Convierte un CV en PDF a markdown (MarkItDown) y extrae campos para **prellenar el wizard** (paso 0 de `/comenzar`). No guarda el PDF ni crea perfil — el usuario revisa y envía con `POST /profile`.

**Content-Type:** `multipart/form-data`

| Campo | Tipo | Notas |
|-------|------|-------|
| `cv` | file | **Requerido.** Solo PDF, máx. **5 MB** |

**Response 200:**

```json
{
  "parsed": true,
  "fields_found": ["name", "city", "skills", "education"],
  "prefill": {
    "name": "María López",
    "city": "Barranquilla",
    "departamento": "Atlántico",
    "edad": null,
    "age_range": "21-25",
    "current_situation": "recien_egresado",
    "education_level": "universitario",
    "education": "Ingeniería de Sistemas",
    "has_experience": "si",
    "experience_years": "1",
    "experience_summary": "Práctica en desarrollo web",
    "skills": "Python, Excel, Git",
    "soft_skills": "Trabajo en equipo, comunicación",
    "interests": "tecnología, startups",
    "work_mode": "hibrido",
    "opportunity_type": "empleo",
    "availability": "inmediata",
    "tools": "VS Code, Figma",
    "portfolio_url": null
  },
  "message": "Detectamos 12 campos. Revisa y continúa."
}
```

| Campo respuesta | Notas |
|-----------------|-------|
| `parsed` | `true` si hubo extracción usable |
| `fields_found` | Claves del `prefill` con valor no vacío |
| `prefill` | Claves alineadas al formulario React (`name`, `city`, …) — ver `CvWizardPrefill` en backend |
| `message` | Copy opcional para la UI |

**Errores:**

| Código | Cuándo |
|--------|--------|
| `400` | Archivo inválido (no PDF, supera 5 MB) |
| `422` | PDF ilegible o sin texto extraíble |
| `500` | Error interno Gemini/conversión |

**Mock (`USE_MOCK_DATA=true`):** devuelve prefill simulado sin procesar el PDF.

**Frontend:** `CvUploadZone.jsx` → `parseCvPdf()` en `api.js`. Si el backend no responde, fallback a `mockCvPrefill.js`.

---

### Vacantes recomendadas

#### `GET /api/jobs/recommended/{session_id}` ✅

Hasta **20** vacantes ordenadas por `score_compatibilidad` (0–100). Excluye `semaforo = "red"`. Solo vacantes con `activo = true`.

**Response 200:** array (puede ser vacío `[]`).

```json
[
  {
    "id": "uuid",
    "titulo": "Desarrollador Backend Python",
    "empresa": "Sophos Solutions",
    "ciudad": "Barranquilla",
    "departamento": "Atlántico",
    "salario_min": 2500000,
    "salario_max": 3500000,
    "habilidades_requeridas": ["python", "fastapi", "postgresql", "git"],
    "sector": "tecnología",
    "experiencia_requerida": 1,
    "nivel_educativo_req": "universitario",
    "modalidad": "hibrido",
    "semaforo": "green",
    "descripcion": "Backend con Python para proyectos fintech.",
    "publicado_at": "2026-05-23T10:00:00Z",
    "score_compatibilidad": 84,
    "habilidades_match": ["python", "fastapi"],
    "habilidades_faltantes": ["postgresql"]
  }
]
```

| Campo | UI |
|-------|-----|
| `semaforo` | `green` 🟢 · `yellow` 🟡 · `red` 🔴 (las rojas no aparecen en esta lista) |
| `score_compatibilidad` | 0–100, calculado en backend |
| `habilidades_match` / `habilidades_faltantes` | Para chips y CTA de mejora |
| `url` | Link a la vacante (si el pipeline lo envía) |
| `repost_count` / `hires_youth` | Metadatos pipeline (fantasmas / jóvenes) |

> BD `jobs` en **inglés** (`title`, `company`, `status`, …). Ver `docs/PIPELINE_JOBS.md`. La API sigue en español.

**Scoring (referencia):** 40% skills + 20% ciudad + 25% experiencia + 15% educación. Ver `docs/SCHEMA.md`.

**Errores:** `500` error interno.

---

### Termómetro del mercado

#### `GET /api/market/dashboard` ✅

**Query params (opcionales):**

| Param | Ejemplo | Descripción |
|-------|---------|-------------|
| `city` | `Barranquilla` | Filtro por ciudad (ilike) |
| `sector` | `tecnología` | Filtro por sector (ilike) |

**Response 200:**
```json
{
  "total_vacantes_activas": 312,
  "top_sectores": [
    { "sector": "tecnología", "count": 87 },
    { "sector": "comercial", "count": 64 }
  ],
  "salario_promedio": 2800000,
  "top_empresas_verdes": ["Bancolombia", "Rappi", "Teleperformance"],
  "crecimiento_semanal_pct": 12.4,
  "ciudad_filtro": "Barranquilla",
  "sector_filtro": null
}
```

| Campo | Notas |
|-------|-------|
| `salario_promedio` | Promedio del punto medio min/max; `null` si no hay salarios |
| `crecimiento_semanal_pct` | Esta semana vs anterior; `null` sin histórico |
| `ciudad_filtro` / `sector_filtro` | Eco de los query params enviados |

---

### Plan de 30 días

#### `GET /api/plan/{session_id}` 🚧 _(contrato acordado — pendiente backend Carlos)_

Devuelve el plan personalizado de 4 semanas para el usuario. Requiere perfil previo (`POST /profile`).

**Response 200:**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "semanas": [
    {
      "numero": 1,
      "titulo": "Pon tu portfolio en línea",
      "tareas": [
        "Sube 3 proyectos a Behance",
        "Conecta tu LinkedIn",
        "Reescribe tu bio"
      ]
    },
    {
      "numero": 2,
      "titulo": "Aplica a 10 vacantes (con cariño)",
      "tareas": [
        "Carta personalizada cada una",
        "Sigue a 5 reclutadores en LinkedIn"
      ]
    }
  ]
}
```

| Campo | Notas |
|-------|-------|
| `semanas` | 4 semanas típicas; cada una con `titulo` + `tareas[]` |
| `numero` | 1–4, usado en UI como "Semana N" |

**Errores:** `404` sin perfil · `500` error interno.

**Frontend:** `loadResultsBundle()` → `postActionPlan()` → store `plan` → `ThirtyDayPlan.jsx`. Fallback: `mockResultsBundle.js` / `mockPlan.js` (personalizado con nombre/ciudad/skills).

---

#### `POST /api/coach/chat` ✅

Coach con contexto del perfil (`profiles`). System prompt en `docs/PROMPTS.md` (`CAREER_COACH_SYSTEM`).

**Request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "mensaje": "¿Qué debería aprender para mejorar mi perfil en logística?"
}
```

| Campo | Tipo | Notas |
|-------|------|-------|
| `session_id` | string | **Requerido.** Mismo UUID del onboarding |
| `mensaje` | string | **Requerido.** Pregunta del usuario |

**Response 200:**
```json
{
  "respuesta": "Basado en tu perfil en Barranquilla...",
  "sugerencias_rapidas": ["Ver vacantes logística", "Curso Excel", "Actualizar CV"]
}
```

| Código | Cuándo |
|--------|--------|
| `404` | Sin perfil previo (`POST /api/profile` en modo real) |
| `500` | Error interno Gemini/BD |

> En mock responde siempre sin exigir perfil. En modo real: primero `POST /api/profile`, luego el chat.

---

### Plan 2 — Análisis, plan y gráficas

Ver [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md).

#### `POST /api/profile/{session_id}/analyze` ✅

Genera análisis IA (fortalezas, gaps, nivel_preparacion). Prompt: `PROFILE_ANALYSIS` en `docs/PROMPTS.md`.

**Query params:**

| Param | Default | Descripción |
|-------|---------|-------------|
| `regenerate` | `false` | `true` → regenera aunque exista en BD |

**Response 200:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "analisis": {
    "fortalezas": [
      { "area": "habilidades_tecnicas", "descripcion": "...", "nivel": "alto" }
    ],
    "debilidades": [
      { "area": "experiencia", "descripcion": "...", "impacto": "medio" }
    ],
    "gaps_mercado": [
      { "habilidad": "python", "demanda": "alta", "tu_nivel": "medio", "brecha": "..." }
    ],
    "oportunidades": [
      { "sector": "tecnología", "razon": "...", "potencial": "alto", "accion_inmediata": "..." }
    ],
    "nivel_preparacion": {
      "overall": 72,
      "descripcion": "...",
      "comparativa": "..."
    },
    "recomendaciones": ["...", "..."]
  },
  "generado_en": "2026-05-23T15:00:00Z"
}
```

| Código | Cuándo |
|--------|--------|
| `404` | Sin perfil previo (modo real) |
| `429` | Rate limit (10/min) |
| `500` | Error Gemini/BD |

---

#### `POST /api/profile/{session_id}/action-plan` ✅

Plan 30-60-90 días. Prompt: `ACTION_PLAN_GENERATOR` en `docs/PROMPTS.md`. En modo real requiere análisis previo (`POST .../analyze`).

**Query params:** `regenerate=true` (opcional)

**Response 200:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "plan": {
    "resumen_ejecutivo": "...",
    "fase_30": {
      "titulo": "Fundamentos y Preparación",
      "objetivo": "...",
      "acciones": [
        {
          "semana": 1,
          "tarea": "Actualizar CV con proyectos recientes",
          "duracion_estimada": "5 horas",
          "recursos_necesarios": ["Plantilla CV"],
          "como_verificar": "CV completo y profesional"
        }
      ],
      "metricas": ["CV actualizado", "LinkedIn 100%"]
    },
    "fase_60": { "titulo": "...", "objetivo": "...", "acciones": [], "metricas": [] },
    "fase_90": { "titulo": "...", "objetivo": "...", "acciones": [], "metricas": [] },
    "recursos_recomendados": [
      {
        "tipo": "curso",
        "nombre": "...",
        "descripcion": "...",
        "duracion": "40 horas",
        "costo_aprox": "Gratis"
      }
    ],
    "milestones": [
      { "dia": 30, "logro": "CV actualizado con nuevas habilidades" },
      { "dia": 60, "logro": "..." },
      { "dia": 90, "logro": "..." }
    ]
  },
  "generado_en": "2026-05-23T15:00:00Z"
}
```

| Código | Cuándo |
|--------|--------|
| `404` | Sin perfil o sin análisis previo (modo real) |
| `429` | Rate limit |
| `500` | Error Gemini/BD |

---

#### `GET /api/profile/{session_id}/radar-data` ✅ Fase 3

Datos para gráfica radar (recharts): usuario vs mercado en 5 dimensiones 0-100.

**Response 200:**
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
    "descripcion_dimensiones": { "...": "..." }
  }
}
```

#### `GET /api/profile/{session_id}/timeline-data` ✅ Fase 3

Timeline del plan de acción (días 0, 30, 60, 90).

**Response 200:**
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

**404** si no hay plan (`POST .../action-plan` primero en modo real). En mock devuelve plan simulado.

**Flujo front sugerido:**
```
POST /profile → POST /analyze → POST /action-plan → GET /radar-data + GET /timeline-data
```

Ver mapeo recharts y ejemplo Axios en [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md).

---

## Ejemplo de integración (JavaScript)

```javascript
const API = "http://localhost:8000/api";

const sessionId =
  localStorage.getItem("dulia_session_id") ?? crypto.randomUUID();
localStorage.setItem("dulia_session_id", sessionId);

// Onboarding
await fetch(`${API}/profile`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    session_id: sessionId,
    nombre: "María López",
    ciudad: "Barranquilla",
    habilidades: ["Python", "Excel"],
    sectores_interes: ["tecnología"],
    modalidad: "hibrido",
  }),
});

// Vacantes
const jobs = await fetch(`${API}/jobs/recommended/${sessionId}`).then((r) =>
  r.json()
);

// Mercado
const market = await fetch(
  `${API}/market/dashboard?city=Barranquilla`
).then((r) => r.json());
```

---

## Checklist pipeline → backend

Para que el front vea datos reales (`USE_MOCK_DATA=false`):

1. Insertar filas en `jobs` con `activo=true`, `semaforo`, `sector`, `ciudad`, salarios opcionales.
2. El usuario debe tener perfil (`POST /profile` con mock off).
3. `GET /jobs/recommended/{session_id}` necesita ese perfil en `profiles`.

Campos mínimos por vacante: ver `docs/SCHEMA.md` tabla `jobs`.

---

## Rutas frontend (SPA)

Implementado en `frontend/src/App.jsx` — kit ReBrand, pantallas separadas:

| Ruta | Pantalla |
|------|----------|
| `/` | Landing |
| `/sobre` | Sobre DulIA |
| `/comenzar` | Wizard onboarding (3 pasos) |
| `/resultados` | Score, perfil, top jobs, plan 30d, PDF |
| `/vacantes` | Panel semáforo |

Cliente Axios: `frontend/src/services/api.js`. Fallbacks: `mockData.js`, `mockCvPrefill.js`, `mockProfileFromPayload.js`, `mockPlan.js`, `mockCoachChat.js`. Persistencia: `sessionCache.js` + `sessionHydration.js`.

**Post-MVP:** [EXTRA_IDEAS/post-mvp-roadmap.md](./EXTRA_IDEAS/post-mvp-roadmap.md)
