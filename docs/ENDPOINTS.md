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

---

_Actualizar este archivo antes de que el frontend empiece a consumir la API._
