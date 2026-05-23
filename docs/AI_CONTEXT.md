# AI_CONTEXT — DulIA

> Lee esto primero si eres un LLM asistiendo en este proyecto.

## ¿Qué es DulIA?

Plataforma web con IA que actúa como coach de carrera para jóvenes colombianos. El usuario describe su perfil (estudios, habilidades, intereses) y DulIA:
1. Sugiere rutas de carrera personalizadas.
2. Conecta con ofertas laborales reales (scrapeadas de portales colombianos).
3. Da feedback accionable sobre el perfil del usuario usando Gemini.

## Contexto del hackathon

- **Evento:** Barranqui-IA 2026
- **Duración:** 48 horas
- **Fecha de inicio:** 2026-05-23
- **Equipo:** 4-5 personas trabajando en paralelo

## Stack en una línea

`FastAPI` (backend) + `React/Vite/Tailwind` (frontend) + `Python scrapers` (pipeline) + `Gemini API` (IA)

## Estado actual

Frontend en progreso: **landing page responsive** implementada (`frontend/src/pages/WelcomePage.jsx`). Mock de respuesta IA en `frontend/src/Mock_Response.js`. Backend, pipeline y BD aún no iniciados. Ver [PROJECT_STATE.md](PROJECT_STATE.md).

## Principios de diseño

- API REST simple, sin over-engineering dado el tiempo del hackathon.
- Frontend en SPA con flujo lineal: **bienvenida → onboarding → resultados** (mobile first).
- Pipeline desacoplado: corre independiente y alimenta la BD.
- Prompts de Gemini centralizados en [PROMPTS.md](PROMPTS.md).
- Prioridad demo: lo visual y demostrable antes que arquitectura compleja.

## Archivos clave para entender el proyecto

| Archivo | Para qué |
|---------|----------|
| ARCHITECTURE.md | Cómo se conectan los módulos |
| SCHEMA.md | Estructura de datos |
| ENDPOINTS.md | Contrato de la API |
| DECISIONS.md | Por qué se tomó cada decisión importante |
