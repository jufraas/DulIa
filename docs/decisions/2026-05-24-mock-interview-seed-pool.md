# Híbrido seed-pool + Gemini para mock interviews

- **Fecha:** 2026-05-24
- **Área:** backend | ia
- **Estado:** activa
- **Autor/es:** CTO backend (hackathon)

## Contexto

El simulador de entrevistas necesita preguntas realistas para jóvenes colombianos en múltiples sectores (no solo tech). Datasets públicos (ej. HuggingFace) cubren principalmente entrevistas técnicas en inglés. En 48h no hay tiempo para curar 500+ preguntas ni entrenar un modelo propio.

## Decisión

1. Tabla **`interview_questions_seed`**: banco curado de **120 preguntas** (10 sectores × 12: 4 técnicas + 4 behavioral + 4 situacionales, nivel `junior`, español CO).
2. Flujo de generación: el servicio toma **8 candidatas del pool** por sector del perfil → **Gemini personaliza y selecciona 5** (3 técnicas + 2 behavioral).
3. Evaluación de respuestas y feedback final también vía Gemini, con fallback al pool/mock si la API falla.

## Por qué

- Cobertura sectorial y cultural inmediata para la demo (retail, salud, admin, etc.).
- Gemini aporta personalización (“dado que trabajaste como cajero…”) sin escribir 120 prompts a mano por usuario.
- Fallback al pool garantiza demo estable si hay rate limit o JSON inválido de Gemini.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Solo HuggingFace / dataset tech EN | No cubre sectores locales ni español |
| 100% Gemini sin pool | Latencia, costo y alucinaciones en rubricas; demo frágil |
| Tabla relacional `interview_questions` por sesión | Overkill para hackathon; JSONB en `mock_interviews` suficiente |

## Consecuencias

- Seed debe mantenerse en `backend/migrations/013_seed_interview_questions.sql` y aplicarse en prod.
- Endpoints de entrevista requieren rate limiting (slowapi) y `USE_MOCK_DATA=true`.
- Post-hackathon: ampliar pool mid/senior y más skills por sector.
