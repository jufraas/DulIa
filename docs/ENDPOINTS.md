# ENDPOINTS — Contrato de la API

> Estado: **Pendiente** — definir junto con el frontend antes de implementar.

## Base URL

```
http://localhost:8000/api   ← desarrollo local
https://<dominio>/api       ← producción (por definir)
```

## Endpoints previstos

_Llenar cuando backend y frontend acuerden el contrato._

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

## Respuesta prevista de `POST /profile` (borrador frontend)

> Shape acordado provisionalmente en el mock del frontend (`frontend/src/Mock_Response.js`). Backend debe confirmar o ajustar.

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

_Actualizar este archivo antes de que el frontend empiece a consumir la API._
