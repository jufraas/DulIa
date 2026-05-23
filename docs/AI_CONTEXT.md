# AI_CONTEXT — DulIA

> Lee esto primero si eres un LLM asistiendo en este proyecto.

## ¿Qué es DulIA?

Plataforma web con IA — coach de carrera para jóvenes colombianos. **Sin login de usuario:** el visitante completa un wizard, recibe vacantes recomendadas con score de compatibilidad, ve el termómetro del mercado laboral y descarga un PDF con su plan.

DulIA:
1. Captura perfil en wizard (4 pasos, campos en español en la API).
2. Backend guarda perfil por `session_id` (UUID anónimo en `localStorage`).
3. Backend calcula matching con vacantes de BD y expone dashboard de mercado.
4. Frontend muestra resultados y genera PDF descargable (jsPDF).
5. **Fase 8 (pendiente):** coach conversacional con Gemini.

## Contexto del hackathon

- **Evento:** Barranqui-IA 2026
- **Duración:** 48 horas
- **Equipo:** 4-5 personas en paralelo

## Stack

`FastAPI` + `React/Vite/Tailwind` + scrapers Python + `Gemini API` (+ módulo `MarkItDown` reservado para CV en fase posterior)

## Modelo de uso (sin login, con session_id anónimo)

```
Landing → Onboarding (wizard) → POST /profile
    → GET /jobs/recommended/{session_id} + GET /market/dashboard
    → Resultados → PDF
```

- No hay registro ni cuentas.
- `session_id` en `localStorage` (`dulia_session_id`) identifica la visita, no un usuario autenticado.
- Estado de UI en Zustand; refresh en `/resultados` sin perfil redirige a `/comenzar`.

## Estado actual

| Módulo | Estado |
|--------|--------|
| Frontend | ✅ Migrado al contrato Carlos; falta deploy Vercel |
| Backend | 🚧 Stub multipart legacy; debe alinearse a `ENDPOINTS.md` |
| Pipeline | 🔲 No iniciado |
| Gemini / coach | 🔲 Fase 8 |

Ver detalle en [PROJECT_STATE.md](PROJECT_STATE.md).

## Principios

- API REST simple; endpoints separados (perfil, jobs, mercado).
- SPA mobile first, flujo lineal.
- Frontend captura y muestra; backend persiste perfil y calcula matching.
- Mock en frontend (`mockData.js`) si backend no responde.
- Prompts en [PROMPTS.md](PROMPTS.md) — coach y CV son fases posteriores.

## Archivos clave

| Archivo | Para qué |
|---------|----------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Módulos y flujo de datos |
| [ENDPOINTS.md](ENDPOINTS.md) | Contrato API (session_id, JSON, jobs + market) |
| [PROJECT_STATE.md](PROJECT_STATE.md) | Qué está hecho |
| [frontend/COMPONENT_OWNERS.md](../frontend/COMPONENT_OWNERS.md) | División de trabajo frontend |
| [decisions/](decisions/) | Una decisión por archivo |
| [PROMPTS.md](PROMPTS.md) | Prompts Gemini (coach, fase posterior) |

## Variables de entorno

| Variable | Dónde | Valor dev |
|----------|-------|-----------|
| `VITE_API_URL` | frontend | `http://localhost:8000/api` |
