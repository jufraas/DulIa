# Importar CV (PDF) + conversión con MarkItDown

- **Fecha:** 2026-05-23
- **Área:** frontend + backend + ia
- **Estado:** activa
- **Autor/es:** Equipo DulIA

## Contexto

El wizard captura perfil manualmente, pero muchos jóvenes ya tienen hoja de vida en PDF. Queremos enriquecer el análisis de IA con ese contenido sin pedirles reescribir todo.

## Decisión

1. **Frontend:** en onboarding, opción de **importar CV en PDF** (opcional, junto al formulario).
2. **Backend:** recibe el archivo, lo convierte a Markdown con **[MarkItDown](https://github.com/microsoft/markitdown)** (Python).
3. **IA:** Gemini recibe el JSON del formulario + `cv_markdown` (si existe) + ofertas de BD.

Un solo endpoint: `POST /api/profile` con `multipart/form-data` cuando hay CV.

## Por qué

- MarkItDown es Python nativo → encaja con FastAPI.
- Markdown es ideal para prompts de LLM (estructurado, compacto).
- Frontend solo sube el archivo; no convierte ni parsea PDF.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| PyPDF2 / extracción manual | Más código; peor estructura para IA |
| Conversión en frontend | PDF parsing en browser es frágil; duplica lógica |
| Endpoint separado solo para CV | Dos round-trips; más complejo para demo |

## Consecuencias

- **Frontend:** input file, validación `.pdf` + tamaño max (~5 MB), `FormData`.
- **Backend:** `pip install markitdown`; no persistir PDF tras análisis (MVP hackathon).
- **ENDPOINTS.md:** documentar multipart. Ver contrato actualizado.
- Si solo sube CV sin formulario completo: backend extrae lo posible del markdown (fase 2).

## Límites acordados (MVP)

| Regla | Valor |
|-------|-------|
| Formatos | Solo `.pdf` |
| Tamaño máximo | 5 MB (ajustable) |
| Archivos por request | 1 |
| Persistencia del PDF | No en hackathon |
