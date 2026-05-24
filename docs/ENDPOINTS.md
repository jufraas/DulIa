# ENDPOINTS — Contrato de la API

> **Fuente de verdad para el frontend.** Contrato final — Fase 10 verificada.

**Última actualización:** 2026-05-24 · Backend B1–B7 + adaptador M3 (progreso Supabase con contrato público frontend)

## Resumen de endpoints (referencia rápida)

| Método | Ruta | Descripción | Auth | Rate limit |
|--------|------|-------------|------|------------|
| GET | `/health` | Health check | No | — |
| POST | `/profile` | Crear/actualizar perfil | No | 10/min |
| GET | `/profile/{session_id}` | Obtener perfil | No | — |
| POST | `/profile/{session_id}/analyze` | Análisis IA | No | 10/min |
| POST | `/profile/{session_id}/action-plan` | Plan 30-60-90 | No | 10/min |
| GET | `/jobs/recommended/{session_id}` | Vacantes scoreadas | No | — |
| GET | `/market/dashboard/{session_id}` | Termómetro personalizado | No | — |
| POST | `/coach/chat` | Coach (context-aware B6) | No | 10/min |
| GET | `/user/has-profile` | ¿Tiene perfil tras login? | No* | — |
| POST | `/auth/link-session` | Vincular session ↔ user | No | — |
| GET | `/progress/{session_id}` | Progreso del plan (shape M3) | No | — |
| PATCH | `/progress/task` | Marcar tarea `{ session_id, task_id, completed }` | No | — |
| POST | `/progress/init` | Init progreso `{ session_id }` | No | — |
| POST | `/progress/add-from-skills` | Tareas desde entrevista `{ session_id, weak_skills }` | No | — |
| POST | `/interview/start` | Iniciar entrevista | No | 5/min |
| POST | `/interview/{id}/answer` | Evaluar respuesta | No | 10/min |
| POST | `/interview/{id}/finish` | Cerrar entrevista | No | 3/min |
| GET | `/interview/history/{session_id}` | Historial | No | — |

\* `has-profile` recibe `user_id` en query (MVP sin JWT — ver decisión B2).

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
| Auth | Coach: ninguna (`session_id` en localStorage). Auth opcional Supabase en front; `POST /auth/link-session` vincula sesión; `GET /user/has-profile` consulta perfil tras login |
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
| `GET /jobs/recommended/{id}` | 2 vacantes mock (cualquier `session_id`) | Todas las compatibles scoreadas (cap opcional vía `RECOMMENDED_TOP_N`); `[]` sin perfil |
| `GET /market/dashboard` | Números fijos de ejemplo | Agrega global sobre `jobs` activos; alcance accesible por `city` |
| `GET /market/dashboard/{id}` | Mock personalizado | Pool filtrado por perfil (ciudad + sectores) + `top_skills_demandadas` |
| `GET /plan/{id}` | Plan mock genérico (legacy) | **Deprecado** — usar `POST .../action-plan` |
| `POST /coach/chat` | Respuesta simulada | Gemini + perfil en Supabase; 404 sin perfil |
| `POST /profile/.../analyze` | Análisis mock fijo | Gemini + tabla `profile_analysis` |
| `POST /profile/.../action-plan` | Plan mock 30-60-90 | Gemini + tabla `action_plans`; requiere análisis previo |
| `GET /profile/.../radar-data` | 5 dimensiones mock | Calculado desde perfil + análisis + mercado |
| `GET /profile/.../timeline-data` | Timeline mock | Desde plan de acción; 404 en real sin plan |
| `GET /user/has-profile` | Mock: user `11111111-…` → true; resto false | Query `profiles.user_id` en Supabase |
| `GET /progress/{id}` | Mock en memoria + plan mock | `plan_progress` Supabase → adaptador M3 |
| `PATCH /progress/task` | Mock en memoria | Actualiza `completed_tasks` JSONB (IDs internos B3) |
| `POST /progress/init` | Idempotente mock | Insert en `plan_progress` si falta |
| `POST /progress/add-from-skills` | Modifica plan mock in-memory | Update `action_plans.fase_30` |
| `POST /interview/start` | Caché demo por skill | Gemini + insert `mock_interviews` |
| `POST /interview/{id}/answer` | Evaluación mock heurística | Gemini + append `answers` jsonb |
| `POST /interview/{id}/finish` | Feedback mock fijo | Gemini + cierre entrevista |
| `GET /interview/history/{id}` | Dict en memoria | Query Supabase |
| `POST /coach/chat` | Mock con contexto progreso/entrevista si existe | Gemini + `_build_user_context` |

> Guía paso a paso para frontend: [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)

---

## Flujo recomendado (frontend)

### MVP actual (FRONT — implementado)

1. Al iniciar la app: crear o leer `session_id` → `localStorage` (`dulia_session_id`).
2. **Rehidratación** (`sessionHydration.js`): restaurar perfil/jobs/market/plan desde cache; si no hay cache, `GET /api/profile/{session_id}` (modo real).
3. Wizard paso 0 (opcional): subir CV → `POST /api/profile/parse-cv` → prellenar formulario.
4. Onboarding terminado → `POST /api/profile` con el mismo `session_id`.
5. Pantalla resultados → `loadResultsBundle` → store (`jobs`, `market`, `plan`, `radar`, `timeline`); `RadarMatch` + `MarketThermometer`.
6. `/vacantes` → semáforo; **Volver** → `/resultados` (perfil en store).
7. **Opcional:** login/registro Supabase → `AuthProvider` vincula `session_id` vía `POST /auth/link-session`.
7. Refresh en `/resultados` o `/vacantes` → rehidratación conserva sesión.

### Plan 2 — integrado en frontend (`loadResultsBundle`)

Tras `POST /profile`, el front ejecuta en secuencia:

1. `POST /api/profile/{session_id}/analyze`
2. `POST /api/profile/{session_id}/action-plan`
3. `GET /api/profile/{session_id}/radar-data` + `GET .../timeline-data`
4. `GET /api/jobs/recommended/{session_id}` + `GET /api/market/dashboard/{session_id}`

Fallbacks offline: `mockResultsBundle.js` (personalizado al perfil). Ver [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md).

### Claves `localStorage` (frontend)

| Clave | Contenido |
|-------|-----------|
| `dulia_session_id` | UUID de sesión anónima |
| `dulia_session_data` | Cache: `savedProfile`, `jobs`, `market`, `plan`, `radar`, `timeline`, `analysis`, `formSnapshot` |
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
| `422` | PDF ilegible, escaneado sin texto, o Gemini no interpretó el CV |
| `500` | Error interno Gemini/conversión |

**Backend (deps):** `markitdown[pdf]>=0.1.5` y `pdfplumber>=0.11.0` en `requirements.txt`. Uvicorn debe usar **`backend/.venv`**. Conversión: MarkItDown → tempfile → fallback **pdfplumber**. Modelo Gemini: `gemini-3.1-flash-lite` (alineado al resto de la API).

**Frontend (dev):** `VITE_API_URL=/api` + proxy Vite → evita CORS. `parseCvPdf()` usa **`fetch` + FormData** (no axios).

**Mock (`USE_MOCK_DATA=true`):** devuelve prefill simulado sin procesar el PDF.

**Frontend:** `CvUploadZone.jsx` → `parseCvPdf()` → `normalizeCvParseResponse()` en `mockCvPrefill.js`. Acepta PDF con MIME `application/octet-stream` en Windows. Merge en wizard vía `mergeCvPrefillIntoForm()` + `resolveLocationFields()` (alias ciudad/depto para selects DANE). Si el backend no responde, fallback a `MOCK_CV_PREFILL`.

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
| `habilidades_match` / `habilidades_faltantes` | Chips en `/vacantes` y preview; CTA de mejora |
| `url` | Link a la vacante (si el pipeline lo envía) |
| `repost_count` / `hires_youth` | Metadatos pipeline (fantasmas / jóvenes) |

> BD `jobs` en **inglés** (`title`, `company`, `status`, …). Ver `docs/PIPELINE_JOBS.md`. La API sigue en español.

**Scoring (referencia v1.1):**

| Componente | Puntos | Notas |
|------------|--------|-------|
| Skills | 0–40 | Match ratio × 40. Sin `skills_required` → **15** (no 40). |
| Ciudad/modalidad | 0–20 | Remoto **15**; misma ciudad **20**; mismo depto **10**. |
| Experiencia | 0–25 | Cumple → 25; si no, `max(0, 25 - brecha × 8)`. |
| Educación | 0–15 | Según nivel vs requerido. |
| Youth bonus | 0–5 | Perfil ≤2 años + `hires_youth=true`. |

- Score final redondeado a **múltiplos de 5** (cap 100).
- **Pre-filtro seniority:** perfiles ≤2 años exp no reciben vacantes senior/lead (salvo título junior explícito o `hires_youth`). El resto se ordena por score; sector suma puntos pero no excluye del listado.
- Ver `docs/PROMPTS.md` (`JOB_MATCHER_SYSTEM` v1.1) y [decisions/2026-05-24-jobs-seniority-scoring.md](./decisions/2026-05-24-jobs-seniority-scoring.md).

**Errores:** `500` error interno.

---

### Termómetro del mercado

#### `GET /api/market/dashboard` ✅

**Query params (opcionales):**

| Param | Ejemplo | Descripción |
|-------|---------|-------------|
| `city` | `Barranquilla` | Alcance accesible: local + remoto + Colombia (no solo `city` exacto) |
| `sector` | `tecnología` | Filtro por sector (ilike) |

**Response 200:**
```json
{
  "total_vacantes_activas": 375,
  "vacantes_locales": 3,
  "vacantes_remotas": 350,
  "top_sectores": [
    { "sector": "tecnología", "count": 87 },
    { "sector": "comercial", "count": 64 }
  ],
  "salario_promedio": 2800000,
  "top_empresas_verdes": ["Bancolombia", "Rappi", "Teleperformance"],
  "crecimiento_semanal_pct": 12.4,
  "ciudad_filtro": "Barranquilla",
  "sector_filtro": null,
  "por_modalidad": {
    "remoto": 58,
    "presencial": 198,
    "hibrido": 56
  },
  "por_fuente": {
    "getonbrd": 100,
    "remotive": 8,
    "mock": 204
  }
}
```

| Campo | Notas |
|-------|-------|
| `total_vacantes_activas` | Vacantes accesibles desde `city` (local + remoto + nacional CO) |
| `vacantes_locales` | Presenciales/híbridos en la ciudad filtrada |
| `vacantes_remotas` | Remoto o sin ciudad (Remotive internacional) |
| `salario_promedio` | Promedio del punto medio min/max; `null` si no hay salarios |
| `crecimiento_semanal_pct` | Variación por `scraped_at` (indexación en DulIA); `null` sin histórico |
| `ciudad_filtro` / `sector_filtro` | Eco de los query params enviados |
| `por_modalidad` | Conteo por `jobs.modality` normalizado: `remoto`, `presencial`, `hibrido` (siempre incluye las 3 claves, puede ser 0) |
| `por_fuente` | Conteo por `jobs.source` (ej. `getonbrd`, `remotive`, `mock`); ordenado por count descendente |
| `top_skills_demandadas` | Vacío en endpoint global; ver endpoint personalizado |
| `sectores_filtro` | Vacío en endpoint global; ver endpoint personalizado |

#### `GET /api/market/dashboard/{session_id}` ✅

Termómetro **personalizado al perfil**: métricas calculadas sobre vacantes dentro del scope del usuario (ciudad accesible + sectores de interés). Sin filtro de seniority (eso aplica solo en `/jobs/recommended`).

**Path param:** `session_id` — UUID de sesión con perfil guardado (`POST /profile`).

**Response 200:** mismo schema que el dashboard global, más:

```json
{
  "total_vacantes_activas": 375,
  "vacantes_locales": 3,
  "vacantes_remotas": 350,
  "vacantes_nacionales": 22,
  "sectores_filtro": ["technology", "user experience", "innovation"],
  "top_skills_demandadas": [
    { "skill": "Python", "count": 87, "tienes": false },
    { "skill": "SQL", "count": 76, "tienes": false },
    { "skill": "TypeScript", "count": 71, "tienes": true }
  ],
  "salario_promedio": 33190495,
  "crecimiento_semanal_pct": 100.0,
  "ciudad_filtro": "Barranquilla",
  "sector_filtro": null,
  "top_sectores": [{ "sector": "Programming", "count": 198 }],
  "por_modalidad": { "remoto": 350, "presencial": 23, "hibrido": 0 },
  "por_fuente": { "getonbrd": 346, "remotive": 18, "mock": 11 }
}
```

| Campo | Notas |
|-------|-------|
| `total_vacantes_activas` | Pool filtrado: alcance desde `perfil.ciudad` + match con `perfil.sectores_interes` |
| `sectores_filtro` | Eco de `profiles.sectores_interes` usados en el filtro |
| `top_skills_demandadas` | Top 8 skills en `skills_required` del pool; `tienes=true` si el perfil ya la tiene |
| `salario_promedio` | Promedio **del pool del perfil**, no global |
| `crecimiento_semanal_pct` | Variación por `scraped_at` **dentro del pool del perfil** |

**Errores:**

| Código | Cuándo |
|--------|--------|
| `404` | Perfil no encontrado para `session_id` |
| `500` | Error interno |

**Uso en frontend:** preferir este endpoint cuando hay `sessionId` + perfil; reservar `GET /market/dashboard?city=...` para fallback anónimo o landing.

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

**Frontend:** `loadResultsBundle()` → store → UI + `generateAnalysisPdf.jsx` (PDF por secciones, fondo oscuro uniforme).

---

#### `POST /api/coach/chat` ✅

Coach con contexto del perfil (`profiles`). System prompt en `docs/PROMPTS.md` (`CAREER_COACH_SYSTEM`).

**Request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "mensaje": "¿Qué debería aprender para mejorar mi perfil en logística?",
  "historial": [
    { "role": "usuario", "texto": "¿Cómo subo mi score de 65?" },
    { "role": "coach", "texto": "Para subir ese 65, enfócate en..." }
  ]
}
```

| Campo | Tipo | Notas |
|-------|------|-------|
| `session_id` | string | **Requerido.** Mismo UUID del onboarding |
| `mensaje` | string | **Requerido.** Pregunta del usuario |
| `historial` | array | Opcional. Turnos previos `{ role: "usuario"\|"coach", texto }` para continuidad (evita saludos repetidos) |

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

## Troubleshooting — modo real (`USE_MOCK_DATA=false`)

Si el front muestra textos genéricos o plan “de plantilla”, revisar la pestaña Network **antes** de culpar a la UI: los fallbacks en `api.js` rellenan mocks cuando la API falla.

### Cadena Plan 2 (orden obligatorio)

```
POST /profile  →  POST .../analyze  →  POST .../action-plan
                      ↓                      ↓
              GET .../radar-data     GET .../timeline-data
```

| Síntoma | Causa habitual | Solución |
|---------|----------------|----------|
| `POST .../analyze` → **500** | RLS en `profile_analysis` o JSONB mal serializado | Ejecutar `backend/migrations/004_plan2_backend_fixes.sql` en Supabase |
| `GET /market/dashboard` → **500** | Query a columna `jobs.location` inexistente | Migración 004 + código actualizado (`market_service.py`) |
| `POST .../action-plan` → **404** | Análisis previo no guardado | Arreglar analyze primero; mensaje: `"Análisis previo requerido..."` |
| `GET .../timeline-data` → **404** | Sin fila en `action_plans` | Completar action-plan |
| Termómetro con **0 vacantes** pero hay jobs | `jobs.city` null en pipeline | Backend hace fallback a todas las activas; enriquecer pipeline (`city` al insertar) |
| UI sigue con mocks tras arreglar API | Cache local o bundle anterior | Limpiar `localStorage` / rehacer wizard; reiniciar uvicorn |
| `POST /profile/parse-cv` → **422** “convertir CV…” | Uvicorn sin `.venv` / sin `markitdown[pdf]` | `.\.venv\Scripts\uvicorn.exe` en Windows; `pip install -r requirements.txt` |
| CV falla solo desde IP de red | CORS directo a `:8000` | `VITE_API_URL=/api` + proxy Vite |

### Smoke test local (Plan 2)

Con `.env` real y uvicorn en `:8000`:

```bash
cd backend && source venv/bin/activate
curl -s http://localhost:8000/api/health | jq .mock_data   # debe ser "false"

SESSION="<uuid-tras-post-profile>"
curl -s -X POST "http://localhost:8000/api/profile/$SESSION/analyze" | jq .session_id
curl -s -X POST "http://localhost:8000/api/profile/$SESSION/action-plan" | jq .plan.resumen_ejecutivo
curl -s "http://localhost:8000/api/profile/$SESSION/radar-data" | jq .radar.usuario
curl -s "http://localhost:8000/api/profile/$SESSION/timeline-data" | jq .timeline.inicio
```

Decisión técnica completa: [decisions/2026-05-23-backend-plan2-phase1-fixes.md](decisions/2026-05-23-backend-plan2-phase1-fixes.md).

---

## Checklist pipeline → backend

Para que el front vea datos reales (`USE_MOCK_DATA=false`):

1. Ejecutar en Supabase SQL Editor:
   - `backend/migrations/002_plan2_tables.sql`
   - `backend/migrations/004_plan2_backend_fixes.sql`
2. Insertar filas en `jobs` con `active=true`, `status`, `sector`, `city` (recomendado).
3. El usuario debe tener perfil (`POST /profile`).
4. Secuencia Plan 2: `analyze` → `action-plan` → `radar-data` / `timeline-data`.

Campos mínimos por vacante: ver `docs/SCHEMA.md` tabla `jobs`.

---

## Progreso del plan + mock interview ✅ (M3 E2E)

Cliente en `frontend/src/services/api.js` con fallback a `src/mocks/mockProgress.js` y `mockInterview.js`.

**Backend:** rutas públicas M3 en `routes/progress.py` → `progress_m3_service.py` → `progress_adapter.py` (mapeo IDs/shape) → `progress_service.py` (persistencia Supabase `plan_progress` + desbloqueo 80%). Entrevista: `routes/user.py` (contrato M3) o `interview_router.py` (B5) según despliegue.

| Método | Ruta | Descripción | Estado backend |
|--------|------|-------------|----------------|
| GET | `/user/has-profile?user_id=` | ¿Usuario ya tiene perfil coach? (UUID Supabase) | ✅ |
| GET | `/progress/{session_id}` | Estado progreso M3 (`tasks[]`, `global_pct`, `phases[]`); lazy-init | ✅ |
| PATCH | `/progress/task` | Marcar tarea `{ session_id, task_id, completed }` — **404** si tarea no existe | ✅ |
| POST | `/progress/init` | Inicializar progreso `{ session_id }` desde action-plan | ✅ |
| POST | `/progress/add-from-skills` | Agregar tareas desde weak skills entrevista | ✅ |
| POST | `/interview/start` | Iniciar entrevista `{ session_id, skill, role? }` | ✅ |
| POST | `/interview/{id}/answer` | Enviar respuesta — **404** si sesión no existe | ✅ |
| POST | `/interview/{id}/finish` | Cerrar y obtener score/feedback | ✅ |
| GET | `/interview/history?user_id=` | Últimas entrevistas (máx. 10 por usuario) | ✅ |

**Notas M3:**
- Progreso **persiste en Supabase** (`plan_progress.completed_tasks` con IDs internos `fase_30:semana_N:idx_M`); el adaptador expone IDs públicos `p30-t0-slug` al frontend.
- `has-profile`: devuelve `{ has_profile: false }` si `user_id` no es UUID válido o Supabase no está configurado.
- Frontend: `dataSource: 'api' | 'mock'` en stores; banner en `/progreso` si usa mock; `VITE_FORCE_PROGRESS_MOCK=true` fuerza demo local.

Regla unlock fases: **80%** de la fase anterior. Ver [decisions/2026-05-24-frontend-progress-foundation.md](decisions/2026-05-24-frontend-progress-foundation.md).

**Tests:** `npm run test:progress` (11 unit) · `npm run test:progress:api` (smoke contra :8000) · `pytest backend/tests/test_m3_progress_api.py` (progreso, 3+).

---

## Auth — vincular sesión anónima (opcional)

Tras login/registro en el frontend, best-effort para asociar el perfil coach al usuario.

### `POST /auth/link-session`

**Body:**

```json
{
  "session_id": "uuid-del-localStorage",
  "user_id": "uuid-de-auth.users"
}
```

**Respuesta 200:**

```json
{
  "linked": true,
  "profile_id": "uuid-del-perfil-coach",
  "already_linked": false
}
```

| Código | Cuándo |
|--------|--------|
| 404 | No existe `profiles` con ese `session_id` |
| 409 | El perfil ya está vinculado a otro `user_id` |
| 500 | Error interno |

Idempotente si el mismo `user_id` ya está vinculado (`already_linked: true`).

### `GET /user/has-profile`

Tras login/registro, el frontend decide si redirigir a `/comenzar` (sin perfil) o `/progreso` / `/resultados` (con perfil).

**Query params:**

| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `user_id` | UUID | sí | ID de `auth.users` (Supabase) |

**Ejemplo:** `GET /api/user/has-profile?user_id=550e8400-e29b-41d4-a716-446655440000`

**Respuesta 200 — con perfil:**

```json
{
  "has_profile": true,
  "session_id": "uuid-del-localStorage",
  "profile_id": "uuid-del-perfil-coach"
}
```

**Respuesta 200 — sin perfil (usuario nuevo o sin wizard):**

```json
{
  "has_profile": false,
  "session_id": null,
  "profile_id": null
}
```

| Código | Cuándo |
|--------|--------|
| 422 | `user_id` no es UUID válido |
| 500 | Error interno (ej. Supabase caído) |

**Seguridad (MVP):** el backend **no valida JWT** — confía en el `user_id` que envía el frontend. Endurecer post-hackathon decodificando el token Supabase en middleware.

**Mock (`USE_MOCK_DATA=true`):**

| `user_id` | Respuesta |
|-----------|-----------|
| `11111111-1111-4111-8111-111111111111` | `has_profile: true` (session/profile mock fijos) |
| Cualquier otro UUID | `has_profile: false` |

---

## Progreso — plan 30/60/90 (contrato público M3)

Persistencia en `plan_progress` (Supabase). Requiere perfil (`profiles`). El plan se lee de `action_plans`. Capa adaptadora: `progress_m3_service` + `progress_adapter`.

### Convención `task_id` (frontend)

```
p{30|60|90}-t{índice}-{slug-del-label}
```

Ejemplo: `p30-t0-completar-cv` = primera tarea de fase 30.

**Internamente** (JSONB `completed_tasks`): `fase_{30|60|90}:semana_{N}:idx_{M}` — el adaptador traduce en ambos sentidos.

**Desbloqueo de fases:** fase 60 si fase 30 ≥ 80% completada; fase 90 si fase 60 ≥ 80%.

### `GET /progress/{session_id}`

**Respuesta 200 (shape M3):**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "current_day": 12,
  "global_pct": 8,
  "active_phase": "30",
  "tasks": [
    {
      "id": "p30-t0-completar-cv",
      "label": "Completar CV",
      "phase": "30",
      "week": 1,
      "completed": false,
      "completed_at": null
    }
  ],
  "phases": [
    { "phase": "30", "pct": 8, "locked": false, "completed_count": 1, "total_count": 12 }
  ],
  "next_milestone": { "dia": 30, "logro": "Primer hito" },
  "unlock_threshold_pct": 80
}
```

| Código | Cuándo |
|--------|--------|
| 404 | No existe `profiles` con ese `session_id` |
| 500 | Error interno |

Lazy-init: crea fila en `plan_progress` si no existe.

### `POST /progress/init`

**Body:**

```json
{ "session_id": "550e8400-e29b-41d4-a716-446655440000" }
```

Idempotente — crea registro de progreso si falta. **Respuesta 200:** mismo shape M3 que `GET /progress/{session_id}`.

### `PATCH /progress/task`

**Body:**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "task_id": "p30-t0-completar-cv",
  "completed": true
}
```

**Respuesta 200:** shape M3 completo (stats recalculados). **404** si `task_id` no existe o progreso no encontrado.

### `POST /progress/add-from-skills`

Agrega tareas de refuerzo a `fase_30.acciones` del action plan (desde resultados de entrevista).

**Body:**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "weak_skills": ["Excel avanzado", "Comunicación verbal"]
}
```

**Respuesta 200:** shape M3 completo con tareas nuevas incluidas. **404** si no hay progreso/plan.

| Código | Cuándo |
|--------|--------|
| 404 | Sin perfil o sin action plan |
| 422 | Lista vacía |
| 500 | Error interno |

Tras agregar, `GET /progress/{session_id}` refleja las tareas nuevas en `tasks[]`.

---

## Mock Interview — simulador con IA

Flujo E2E: **start → 5× answer → finish → history**. Requiere perfil (`profiles`) existente. Preguntas: pool curado + Gemini (B4); fallback a caché demo en mock mode.

**Rate limits (por IP):**

| Endpoint | Límite |
|----------|--------|
| `POST /interview/start` | 5/min |
| `POST /interview/{id}/answer` | 10/min |
| `POST /interview/{id}/finish` | 3/min |
| `GET /interview/history/{session_id}` | Sin límite |

Ver decisión: [decisions/2026-05-24-interview-rate-limits.md](./decisions/2026-05-24-interview-rate-limits.md).

### `POST /interview/start`

**Body:**

```json
{
  "session_id": "uuid-del-localStorage",
  "target_skill": "Python",
  "target_role": "Desarrollador junior"
}
```

**Respuesta 200:**

```json
{
  "interview_id": "uuid-de-la-entrevista",
  "questions": [
    {
      "idx": 0,
      "texto": "Cuéntame sobre un proyecto donde hayas usado Python...",
      "tipo": "tecnica",
      "skill": "Python",
      "keywords_esperadas": ["proyecto", "código", "resultado"],
      "rubrica": {
        "keywords_clave": ["proyecto", "python"],
        "puntos_fuertes_esperados": ["Ejemplo concreto"],
        "red_flags": ["Respuesta vaga"]
      }
    }
  ],
  "created_at": "2026-05-24T12:00:00Z"
}
```

| Código | Cuándo |
|--------|--------|
| 404 | Sin perfil para `session_id` |
| 429 | Rate limit |
| 500 | Error interno / Gemini |

---

### `POST /interview/{interview_id}/answer`

**Body:**

```json
{
  "question_idx": 0,
  "answer": "En la universidad hice un proyecto con Python y pandas para analizar ventas..."
}
```

`answer` mínimo 20 caracteres.

**Respuesta 200:**

```json
{
  "question_idx": 0,
  "score": 78,
  "feedback": "Mencionaste puntos relevantes sobre Python...",
  "fortalezas": ["Claridad en la idea principal"],
  "areas_mejora": ["Python", "Ejemplos con métricas"]
}
```

| Código | Cuándo |
|--------|--------|
| 404 | Entrevista no encontrada |
| 409 | Entrevista ya finalizada **o** `question_idx` ya respondido |
| 422 | Índice fuera de rango o body inválido |
| 429 | Rate limit |
| 500 | Error interno |

---

### `POST /interview/{interview_id}/finish`

Sin body.

**Respuesta 200:**

```json
{
  "interview_id": "uuid",
  "global_score": 72,
  "weak_skills": ["Excel avanzado", "Comunicación verbal"],
  "feedback_general": "Completaste la simulación con 72/100...",
  "recomendacion_siguiente_paso": "Dedica 30 min diarios a practicar..."
}
```

| Código | Cuándo |
|--------|--------|
| 404 | Entrevista no encontrada |
| 409 | Ya finalizada **o** sin respuestas |
| 429 | Rate limit |
| 500 | Error interno |

---

### `GET /interview/history/{session_id}`

**Respuesta 200** (lista vacía `[]` si nunca entrevistó):

```json
[
  {
    "id": "uuid",
    "target_skill": "Python",
    "target_role": "Desarrollador junior",
    "global_score": 72,
    "created_at": "2026-05-24T12:00:00Z",
    "status": "completed"
  }
]
```

| Código | Cuándo |
|--------|--------|
| 500 | Error interno |

---

## Rutas frontend (SPA)

Implementado en `frontend/src/App.jsx` — kit ReBrand, pantallas separadas:

| Ruta | Pantalla |
|------|----------|
| `/` | Landing |
| `/sobre` | Sobre DulIA |
| `/comenzar` | Wizard onboarding (3 pasos) |
| `/resultados` | Análisis IA, plan (tabs 30/60/90), radar, timeline, coach, PDF |
| `/vacantes` | Semáforo, chips skills, links `url`; volver a `/resultados` |
| `/login` | Login email/password (+ Google pendiente config) |
| `/registro` | Registro + upsert `user_accounts` |
| `/perfil` | Cuenta de usuario (protegida); requiere sesión Supabase |
| `/progreso` | Mi progreso — plan checkeable (protegida); mock si API cae o `VITE_FORCE_PROGRESS_MOCK` |
| `/entrevistas` | Simulador entrevista mock (protegida) |

Cliente Axios: `frontend/src/services/api.js`. Fallbacks: `mockData.js`, `mockCvPrefill.js`, `mockProfileFromPayload.js`, `mockPlan.js`, `mockResultsBundle.js`, `mockCoachChat.js`, **`mockProgress.js`**, **`mockInterview.js`**. Persistencia: `sessionCache.js` + `sessionHydration.js`. Tests: `npm run test:progress`, `npm run test:progress:api`.

**Post-MVP:** [EXTRA_IDEAS/post-mvp-roadmap.md](./EXTRA_IDEAS/post-mvp-roadmap.md)
