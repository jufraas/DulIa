# Importar CV (PDF) + conversión con MarkItDown

- **Fecha:** 2026-05-23
- **Área:** frontend + backend + ia
- **Estado:** **activa** — integrado en wizard paso 0
- **Autor/es:** Equipo DulIA (Migue frontend, Carlos backend)

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

## Implementación actual (2026-05-23 tarde)

Se adoptó **endpoint dedicado** en lugar de multipart en `POST /profile`:

| Pieza | Ubicación |
|-------|-----------|
| `POST /api/profile/parse-cv` | `backend/app/routes/profile.py` |
| Servicio MarkItDown + Gemini | `backend/app/services/cv_service.py` |
| Modelos respuesta | `backend/app/models/cv.py` (`CvParseOut`, `CvWizardPrefill`) |
| UI paso 0 wizard | `frontend/src/components/onboarding/CvUploadZone.jsx` |
| Cliente API | `parseCvPdf()` en `frontend/src/services/api.js` |
| Fallback offline | `frontend/src/services/mockCvPrefill.js` |

Flujo: usuario sube PDF → backend extrae campos → frontend merge en formulario → usuario revisa → `POST /profile` JSON al finalizar.

## Por qué endpoint separado

- Mantiene `POST /profile` JSON-only (contrato acordado con Carlos).
- El CV es opcional y no bloquea el submit final.
- MarkItDown + Gemini pueden fallar sin perder el wizard manual.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| PyPDF2 / extracción manual | Más código; peor estructura para IA |
| Conversión en frontend | PDF parsing en browser es frágil |
| Multipart en POST /profile | Rompe contrato JSON del MVP |

## Consecuencias actuales

- **Frontend:** `CvUploadZone` en paso 0 de `/comenzar`.
- **Docs:** contrato en [ENDPOINTS.md](../ENDPOINTS.md) sección `POST /profile/parse-cv`.
- **Mock:** backend devuelve prefill simulado; frontend tiene `mockCvPrefill.js` si no hay red.

## Límites acordados

| Regla | Valor |
|-------|-------|
| Formatos | Solo `.pdf` |
| Tamaño máximo | 5 MB |
| Persistencia del PDF | No — solo se usa para extracción |
| Rate limit | 10 req/min (mismo bucket Gemini) |
