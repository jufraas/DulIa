# ENDPOINTS — Contrato de la API

> Última actualización: 2026-05-23 — incluye importación de CV (PDF).

## Base URL

```
http://localhost:8000/api   ← desarrollo local
https://<dominio>/api       ← producción (por definir)
```

## Autenticación

**Sin auth en el MVP.** El usuario no inicia sesión; envía perfil (+ CV opcional) y recibe análisis en la misma visita.

## Endpoints

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/health` | Health check del servidor | 🔲 |
| POST | `/profile` | Enviar perfil (+ CV PDF opcional) | 🔲 |
| GET | `/recommendations/{id}` | Obtener recomendaciones (fase 2) | 🔲 |
| GET | `/jobs` | Listar ofertas laborales | 🔲 |

## Convenciones

- Errores: `{ "detail": "mensaje de error" }`.
- Sin persistencia de PDF en hackathon (procesar en memoria y descartar).

---

## `POST /profile`

Recibe el perfil del usuario y opcionalmente un **CV en PDF**. El backend convierte el PDF a Markdown (MarkItDown) y lo incluye en el prompt de Gemini.

### Modo A — Solo formulario (JSON)

Cuando el usuario **no** sube CV.

```
POST /api/profile
Content-Type: application/json
```

**Body:**

```json
{
  "name": "María González",
  "city": "Barranquilla",
  "age_range": "21-25",
  "current_situation": "recien_egresado",
  "education_level": "universitario",
  "education": "Comunicación social",
  "has_experience": false,
  "experience_summary": "",
  "skills": "Canva, edición de video, redacción",
  "soft_skills": "comunicación, creatividad",
  "interests": "Marketing digital, contenido para redes",
  "work_mode": "hibrido",
  "opportunity_type": "empleo",
  "availability": "inmediata",
  "tools": "Canva, CapCut",
  "portfolio_url": "https://linkedin.com/in/ejemplo"
}
```

> Implementado en frontend: wizard 3 pasos en `frontend/src/pages/OnboardingPage.jsx` + componentes en `frontend/src/components/onboarding/`.

### Modo B — Formulario + CV (multipart)

Cuando el usuario **importa CV en PDF**.

```
POST /api/profile
Content-Type: multipart/form-data
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `profile` | string | ✅ | JSON stringificado (mismo objeto que Modo A) |
| `cv` | file | ❌ | Archivo PDF, max 5 MB |

**Ejemplo curl:**

```bash
curl -X POST http://localhost:8000/api/profile \
  -F 'profile={"name":"María","city":"Barranquilla",...};type=application/json' \
  -F "cv=@/ruta/hoja_de_vida.pdf;type=application/pdf"
```

### Procesamiento backend (referencia)

1. Parsear `profile` (JSON).
2. Si hay `cv`: módulo `backend/markitdown/` → `cv_markdown`.
3. `build_gemini_prompt_vars(profile, cv_result)` — ver `docs/PROMPTS.md`.
4. Llamar Gemini.
5. Responder JSON de recomendaciones (`cv_parsed: true` si hubo CV).

---

## Respuesta de `POST /profile`

> Shape en `frontend/src/Mock_Response.js`. Frontend usa mock si backend no responde.

```json
{
  "profile": "Editor de contenido junior",
  "score": 74,
  "opportunities": [
    "Editar TikToks para negocios",
    "Diseño Canva para emprendedores"
  ],
  "roadmap": [
    "Crear portafolio",
    "Publicar en LinkedIn",
    "Buscar clientes locales"
  ],
  "cv_parsed": true
}
```

| Campo | Tipo | Notas |
|-------|------|-------|
| `profile` | string | Perfil sugerido por IA |
| `score` | number | Encaje 0–100 |
| `opportunities` | string[] | Oportunidades alineadas |
| `roadmap` | string[] | Pasos accionables |
| `cv_parsed` | boolean | Opcional; `true` si se procesó CV |

---

_Actualizar cuando backend confirme implementación._
