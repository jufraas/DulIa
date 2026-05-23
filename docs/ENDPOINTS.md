# ENDPOINTS — Contrato de la API

> **Fuente de verdad para el frontend.** Contrato final — Fase 10 verificada.

**Última actualización:** 2026-05-23 · Fases 1–10 completadas. Todos los endpoints probados vía Swagger + curl con `USE_MOCK_DATA=true`.

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
| Rate limit | `POST /profile` y `POST /coach/chat`: **10 req/min por IP** (429 si excedes) |
| Mock | `USE_MOCK_DATA=true` en backend → respuestas de ejemplo sin Supabase/Gemini |

### Comportamiento con `USE_MOCK_DATA`

| Endpoint | `true` (dev) | `false` (real) |
|----------|--------------|----------------|
| `GET /health` | `mock_data: "true"` | `mock_data: "false"` |
| `POST /profile` | Responde perfil simulado, **no guarda** en BD | Gemini + Supabase |
| `GET /profile/{id}` | Siempre **404** | 200 si existe, 404 si no |
| `GET /jobs/recommended/{id}` | 2 vacantes mock (cualquier `session_id`) | Top 20 reales; `[]` sin perfil o sin jobs |
| `GET /market/dashboard` | Números fijos de ejemplo | Agrega sobre `jobs` activos |
| `POST /coach/chat` | Respuesta simulada | Gemini + perfil en Supabase; 404 sin perfil |

---

## Flujo recomendado (frontend)

1. Al iniciar la app: crear o leer `session_id` → `localStorage`.
2. Onboarding terminado → `POST /api/profile` con el mismo `session_id`.
3. Pantalla vacantes → `GET /api/jobs/recommended/{session_id}`.
4. Pantalla mercado → `GET /api/market/dashboard?city=...`.
5. Recargar perfil (solo modo real) → `GET /api/profile/{session_id}`.

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

### Coach conversacional

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

Cliente Axios: `frontend/src/services/api.js`. Fallback local en `mockData.js` para jobs/market si el backend no responde.
