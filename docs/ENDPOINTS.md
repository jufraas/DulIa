# ENDPOINTS — Contrato de la API

> Fuente de verdad para el frontend. Actualizar antes de implementar cada endpoint.

## Base URL

```
http://localhost:8000/api   ← desarrollo local
https://<dominio>/api       ← producción (por definir al deployar)
```

## Convenciones

- Todos los cuerpos en JSON (`Content-Type: application/json`).
- Errores: `{ "detail": "mensaje de error" }` (formato FastAPI estándar).
- Sin autenticación — el frontend envía `session_id` (UUID en localStorage) en el body o como path param.
- Swagger interactivo disponible en `http://localhost:8000/docs`.

---

## Endpoints

### Sistema

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/api/health` | Health check — devuelve status y env activo | ✅ Fase 1 |

---

### Perfil de usuario

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| POST | `/api/profile` | Recibe respuestas del onboarding, extrae perfil con Gemini, guarda en Supabase | 🔲 Fase 4 |
| GET | `/api/profile/{session_id}` | Devuelve perfil existente del usuario | 🔲 Fase 4 |

**POST /api/profile — Request:**
```json
{
  "session_id": "uuid-generado-por-frontend",
  "respuestas_onboarding": {
    "nombre": "Juan Pérez",
    "ciudad": "Barranquilla",
    "nivel_educativo": "universitario",
    "carrera": "Ingeniería Industrial",
    "experiencia_anios": 1,
    "habilidades": ["Excel", "Python", "Logística"],
    "sectores_interes": ["tecnología", "logística"],
    "salario_esperado": 2500000,
    "modalidad": "hibrido"
  }
}
```

**POST /api/profile — Response:**
```json
{
  "id": "uuid",
  "session_id": "uuid",
  "nombre": "Juan Pérez",
  "ciudad": "Barranquilla",
  "habilidades": ["excel", "python", "logística"],
  "score_base": 62,
  "created_at": "2026-05-23T10:00:00Z"
}
```

---

### Vacantes recomendadas

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/api/jobs/recommended/{session_id}` | Top 20 vacantes ordenadas por score de compatibilidad | 🔲 Fase 6 |

**Response:**
```json
[
  {
    "id": "uuid",
    "titulo": "Analista de Datos Junior",
    "empresa": "Bancolombia",
    "ciudad": "Barranquilla",
    "salario_min": 2200000,
    "salario_max": 3000000,
    "sector": "fintech",
    "semaforo": "green",
    "score_compatibilidad": 84,
    "habilidades_match": ["Python", "Excel"],
    "habilidades_faltantes": ["SQL"],
    "url": "https://..."
  }
]
```

---

### Termómetro del mercado

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/api/market/dashboard` | Estadísticas agregadas del mercado laboral | 🔲 Fase 7 |

**Query params:** `?city=Barranquilla&sector=tecnología` (opcionales)

**Response:**
```json
{
  "total_vacantes_activas": 312,
  "top_sectores": [
    { "sector": "tecnología", "count": 87 },
    { "sector": "comercial", "count": 64 }
  ],
  "salario_promedio": 2800000,
  "top_empresas_verdes": ["Bancolombia", "Rappi", "Teleperformance"],
  "crecimiento_semanal_pct": 12.4
}
```

---

### Coach conversacional

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| POST | `/api/coach/chat` | Envía mensaje al coach, recibe respuesta con contexto del perfil | 🔲 Fase 8 |

**Request:**
```json
{
  "session_id": "uuid",
  "mensaje": "¿Qué debería aprender para mejorar mi perfil en logística?"
}
```

**Response:**
```json
{
  "respuesta": "Basado en tu perfil, te recomiendo...",
  "sugerencias_rapidas": ["Ver vacantes de logística", "Mejorar Excel avanzado"]
}
```
