# API con session_id, jobs y market separados

- **Fecha:** 2026-05-23
- **Área:** full-stack
- **Estado:** activa
- **Autor/es:** Carlos (backend) + Migue (frontend)

## Contexto

El frontend inicial asumía un solo `POST /profile` que devolvía score global, oportunidades y roadmap (con o sin multipart CV). El backend real de Carlos expone recursos separados y campos en español.

## Decisión

Contrato API acordado:

| Endpoint | Rol |
|----------|-----|
| `POST /profile` | Guardar perfil (JSON, `session_id`) |
| `GET /profile/{session_id}` | Recuperar perfil |
| `GET /jobs/recommended/{session_id}` | Vacantes con `score_compatibilidad` |
| `GET /market/dashboard` | Termómetro del mercado |
| `GET /health` | Incluye flag `mock_data` |

- Campos del perfil en **español** (`nombre`, `ciudad`, `habilidades`, …).
- Score **por vacante**, no score global único.
- Roadmap del coach pasa a **Fase 8**; en MVP se muestra termómetro de mercado + lista de jobs.

## Por qué

- Separación clara: persistir perfil vs. consultar recomendaciones vs. agregados de mercado.
- Frontend puede cargar jobs y market en paralelo tras el POST.
- Alineado con datos reales de BD (vacantes del pipeline).

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Respuesta monolítica en un POST | Acoplado; difícil cachear y escalar |
| Campos en inglés en API | Backend y dominio colombiano en español |
| Score global único | Menos útil que compatibilidad por vacante |

## Consecuencias

- **Frontend:** migrado (`api.js`, `buildProfilePayload.js`, `useOnboardingForm.js`, resultados, PDF).
- **Docs:** [ENDPOINTS.md](../ENDPOINTS.md), [ARCHITECTURE.md](../ARCHITECTURE.md).
- **Backend stub:** pendiente alinear `main.py` al nuevo contrato.
- **Mock:** `frontend/src/services/mockData.js` para jobs y market offline.
