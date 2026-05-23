# ENDPOINTS — Contrato de la API

> Última actualización: 2026-05-23 — contrato Carlos (session_id, JSON, jobs + market separados).

## Base URL

```
http://localhost:8000/api   ← desarrollo local
https://<dominio>/api       ← producción (por definir)
```

## Autenticación

**Sin auth en el MVP.** El frontend genera un `session_id` (UUID) en `localStorage` (`dulia_session_id`) y lo envía en cada request de perfil.

## Endpoints

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/health` | Health check (`mock_data` indica modo mock) | 🚧 |
| POST | `/profile` | Guardar perfil del usuario (JSON) | 🚧 |
| GET | `/profile/{session_id}` | Recuperar perfil guardado | 🚧 |
| GET | `/jobs/recommended/{session_id}` | Vacantes recomendadas con score | 🚧 |
| GET | `/market/dashboard` | Termómetro del mercado (`?city=&sector=`) | 🚧 |

## Convenciones

- Errores: `{ "detail": "mensaje de error" }`.
- Campos del perfil en **español** (ver payload abajo).
- Frontend usa `frontend/src/services/mockData.js` como fallback si jobs/market fallan.

---

## `GET /health`

```json
{
  "status": "ok",
  "mock_data": true
}
```

---

## `POST /profile`

Guarda el perfil del usuario. **Solo JSON** (sin multipart ni CV en este contrato).

```
POST /api/profile
Content-Type: application/json
```

**Body:**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "nombre": "María González",
  "edad": 23,
  "ciudad": "Barranquilla",
  "departamento": "Atlántico",
  "nivel_educativo": "universitario",
  "carrera": "Comunicación social",
  "experiencia_anios": 0,
  "habilidades": ["Canva", "edición de video", "redacción"],
  "sectores_interes": ["Marketing digital", "contenido para redes"],
  "salario_esperado_min": 2000000,
  "salario_esperado_max": 3500000,
  "modalidad": "hibrido",
  "texto_libre": "Situación: recien_egresado · Herramientas: Canva, CapCut"
}
```

**Respuesta:** objeto `SavedProfile` con los mismos campos + `id`, `created_at`.

> Implementado en frontend: wizard en `frontend/src/components/onboarding/` → `buildProfilePayload.js` → `useOnboardingForm.js`.

---

## `GET /jobs/recommended/{session_id}`

Array de vacantes con compatibilidad calculada.

```json
[
  {
    "id": "job-1",
    "titulo": "Desarrollador Backend Python",
    "empresa": "Sophos Solutions",
    "ciudad": "Barranquilla",
    "departamento": "Atlántico",
    "salario_min": 2500000,
    "salario_max": 3500000,
    "habilidades_requeridas": ["python", "fastapi"],
    "sector": "tecnología",
    "experiencia_requerida": 1,
    "nivel_educativo_req": "universitario",
    "modalidad": "hibrido",
    "semaforo": "green",
    "descripcion": "...",
    "publicado_at": "2026-05-23T10:00:00Z",
    "score_compatibilidad": 84,
    "habilidades_match": ["python"],
    "habilidades_faltantes": ["fastapi"]
  }
]
```

| Campo | Tipo | Notas |
|-------|------|-------|
| `score_compatibilidad` | number | 0–100 por vacante |
| `semaforo` | string | `green` \| `yellow` \| `red` |

---

## `GET /market/dashboard`

Query params opcionales: `city`, `sector`.

```json
{
  "total_vacantes_activas": 312,
  "top_sectores": [{ "sector": "tecnología", "count": 87 }],
  "salario_promedio": 2800000,
  "top_empresas_verdes": ["Bancolombia", "Rappi"],
  "crecimiento_semanal_pct": 12.4,
  "ciudad_filtro": "Barranquilla",
  "sector_filtro": null
}
```

---

## Flujo frontend

1. `GET /health` → detectar `mock_data`.
2. `POST /profile` con `session_id`.
3. En paralelo: `GET /jobs/recommended/{session_id}` + `GET /market/dashboard?city=...`.
4. Pantalla de resultados + PDF con jobs y termómetro.

---

## Nota: CV / MarkItDown

El módulo `backend/markitdown/` existe para procesar PDFs, pero **no forma parte del contrato actual** entre frontend y backend de Carlos. Puede integrarse en una fase posterior.
