# MarkItDown — CV PDF → Markdown

Módulo backend para convertir **CV en PDF** a markdown y prellenar el wizard vía `POST /api/profile/parse-cv`.

> **Estado:** ✅ integrado — ver [ENDPOINTS.md](../../docs/ENDPOINTS.md) y [decisions/2026-05-23-cv-pdf-markitdown.md](../../docs/decisions/2026-05-23-cv-pdf-markitdown.md).

## Flujo

```
Frontend (CvUploadZone)          Backend                         IA
────────────────────────         ───────                         ──
POST /api/profile/parse-cv  →    validate_cv_pdf()
  multipart: cv (PDF)       →    cv_file_to_markdown()      →   Gemini extrae prefill
                            →    CvParseOut → JSON           →   wizard paso 0
Usuario revisa → POST /profile (JSON)
```

## Uso en FastAPI

Ruta: `backend/app/routes/profile.py` → `cv_service.parse_cv_pdf()`.

```python
from cv_parser import cv_file_to_markdown

cv_result = cv_file_to_markdown(file_bytes, filename="cv.pdf", content_type="application/pdf")
# cv_result.markdown → prompt Gemini en cv_service.py
```

## API del módulo

| Función | Descripción |
|---------|-------------|
| `cv_file_to_markdown(bytes, filename, content_type)` | Valida + convierte PDF → `CvMarkdownResult` |
| `cv_markdown_for_prompt(result)` | String para `{cv_markdown}` (vacío si no hay CV) |
| `build_gemini_prompt_vars(profile, cv_result, job_offers)` | Dict listo para el prompt |

## Errores

| Excepción | HTTP | Cuándo |
|-----------|------|--------|
| `CvValidationError` | 400 | No PDF, > 5 MB, vacío |
| `CvConversionError` | 422 | PDF corrupto, escaneado sin texto, MarkItDown falló |

## Instalación y arranque

```bash
cd backend
python -m venv .venv
# Windows:
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\uvicorn.exe main:app --reload --port 8000
```

Requiere `markitdown[pdf]` y `pdfplumber` (fallback). **No uses** `uvicorn` del Python del sistema — devuelve 422 al subir PDFs.

## Probar con curl

```bash
curl -X POST http://localhost:8000/api/profile/parse-cv \
  -F "cv=@./mi_cv.pdf;type=application/pdf"
```

## Reglas MVP (hackathon)

- Solo `.pdf`, máximo **5 MB**
- **No persistir** el PDF en disco ni BD
- El markdown solo vive en memoria para el request actual
- Rate limit: 10 req/min (bucket Gemini compartido)

## Frontend

- `CvUploadZone.jsx` → `parseCvPdf()` (`fetch` + FormData)
- Dev: `VITE_API_URL=/api` + proxy Vite en `vite.config.js`
