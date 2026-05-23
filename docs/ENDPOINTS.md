# ENDPOINTS — Contrato de la API

> Estado: **Pendiente** — definir junto con el frontend antes de implementar.

## Base URL

```
http://localhost:8000/api   ← desarrollo local
https://<dominio>/api       ← producción (por definir)
```

## Endpoints previstos

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/health` | Health check del servidor | 🔲 |
| POST | `/profile` | Enviar perfil del usuario | 🔲 |
| GET | `/recommendations/{id}` | Obtener recomendaciones | 🔲 |
| GET | `/jobs` | Listar ofertas laborales | 🔲 |

## Convenciones

- Todos los cuerpos en JSON (`Content-Type: application/json`).
- Errores siguen el formato: `{ "detail": "mensaje de error" }`.
- Autenticación: por definir (probablemente sin auth en el hackathon).

## Cuerpo de `POST /profile` (borrador frontend)

> Implementado en `frontend/src/pages/OnboardingPage.jsx` (wizard 3 pasos). Backend debe confirmar o ajustar.

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

## Respuesta prevista de `POST /profile` (borrador frontend)

> Shape en `frontend/src/Mock_Response.js`. Si el backend no responde, el frontend usa mock.

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
  ]
}
```

---

_Actualizar este archivo cuando backend confirme el contrato._
