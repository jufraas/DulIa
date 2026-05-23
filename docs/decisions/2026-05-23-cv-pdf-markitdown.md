# Importar CV (PDF) + conversión con MarkItDown

- **Fecha:** 2026-05-23
- **Área:** frontend + backend + ia
- **Estado:** **diferida** — módulo backend listo; no en contrato MVP frontend
- **Autor/es:** Equipo DulIA

## Contexto

El wizard captura perfil manualmente, pero muchos jóvenes ya tienen hoja de vida en PDF. Queremos enriquecer el análisis de IA con ese contenido sin pedirles reescribir todo.

## Decisión original

1. **Frontend:** opción de importar CV en PDF (multipart).
2. **Backend:** MarkItDown → `cv_markdown` → Gemini.
3. Un solo `POST /api/profile` con `multipart/form-data`.

## Cambio (2026-05-23 — migración API Carlos)

El **frontend MVP** migró a contrato JSON-only con endpoints separados (perfil, jobs, market). La subida de CV **no está en el flujo actual** del frontend.

El módulo `backend/markitdown/` **sigue implementado** y puede integrarse cuando:
- Backend exponga multipart o endpoint dedicado de CV, y
- El equipo decida priorizarlo sobre el wizard solo.

## Por qué se difiere

- Contrato acordado con backend: `session_id` + JSON + jobs/market separados.
- Menor complejidad para demo del hackathon con wizard de 4 pasos.
- MarkItDown ya está listo; integración es incremental.

## Alternativas descartadas (original)

| Alternativa | Por qué no |
|-------------|------------|
| PyPDF2 / extracción manual | Más código; peor estructura para IA |
| Conversión en frontend | PDF parsing en browser es frágil |
| Endpoint separado solo para CV | Dos round-trips; posible en fase 2 |

## Consecuencias actuales

- **Frontend:** sin `CvUpload` ni multipart en el submit.
- **Backend stub (`main.py`):** aún multipart legacy — debe alinearse a [ENDPOINTS.md](../ENDPOINTS.md).
- **MarkItDown:** ver [backend/markitdown/README.md](../../backend/markitdown/README.md).
- **PROMPTS.md:** `{cv_markdown}` documentado para fase posterior.

## Límites acordados (cuando se reactive)

| Regla | Valor |
|-------|-------|
| Formatos | Solo `.pdf` |
| Tamaño máximo | 5 MB |
| Persistencia del PDF | No en hackathon |
