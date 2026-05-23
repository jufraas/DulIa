# AI_CONTEXT — DulIA

> Lee esto primero si eres un LLM asistiendo en este proyecto.

## ¿Qué es DulIA?

Plataforma web con IA — coach de carrera para jóvenes colombianos. **Sin login:** el usuario entra, da su información y recibe análisis + PDF en la misma visita.

DulIA:
1. Captura perfil (formulario y/o **CV en PDF**).
2. Backend convierte CV → Markdown (MarkItDown) y llama a **Gemini**.
3. Sugiere rutas, oportunidades (scrapers → BD) y roadmap accionable.
4. Frontend muestra resultados y PDF descargable.

## Contexto del hackathon

- **Evento:** Barranqui-IA 2026
- **Duración:** 48 horas
- **Equipo:** 4-5 personas en paralelo

## Stack

`FastAPI` + `MarkItDown` + `React/Vite/Tailwind` + scrapers Python + `Gemini API`

## Modelo de uso (sin sesión)

```
Landing → Onboarding (form ± CV PDF) → POST /profile → Resultados → PDF
```

No hay registro ni cuentas. Estado en memoria (Zustand) en frontend.

## Estado actual

Frontend: landing, wizard, resultados, PDF, mock API. **Pendiente:** upload CV, deploy.

Backend: no iniciado. Ver [PROJECT_STATE.md](PROJECT_STATE.md).

## Principios

- API REST simple; sin over-engineering.
- SPA mobile first, flujo lineal.
- Frontend captura y muestra; backend procesa IA y CV.
- Prompts en [PROMPTS.md](PROMPTS.md).

## Archivos clave

| Archivo | Para qué |
|---------|----------|
| ARCHITECTURE.md | Módulos y flujo con CV |
| ENDPOINTS.md | Contrato JSON + multipart |
| PROJECT_STATE.md | Qué está hecho |
| decisions/ | Una decisión por archivo |
| PROMPTS.md | Prompts Gemini |
