# MarkItDown — CV PDF → Markdown

Módulo backend para convertir **CV en PDF** a markdown y enriquecer prompts de Gemini.

> **Estado:** implementado, **diferido** en el MVP frontend. El contrato actual usa JSON-only (ver [docs/ENDPOINTS.md](../../docs/ENDPOINTS.md)). Este módulo se integrará en una fase posterior.

## Flujo previsto (fase posterior)

```
Frontend (multipart o endpoint CV)     Backend                    IA
─────────────────────────────────     ───────                    ──
profile: JSON                   →     parse JSON
cv: archivo PDF                 →     validate_cv_pdf()
                                 →     cv_file_to_markdown()  →  cv_markdown
                                 →     build_gemini_prompt_vars()
                                 →     Gemini (docs/PROMPTS.md)
```

## Uso en FastAPI (stub actual)

Integrado en `backend/main.py` (stub multipart legacy):

```python
from cv_parser import cv_file_to_markdown, build_gemini_prompt_vars

file_bytes = await cv.read()
cv_result = cv_file_to_markdown(file_bytes, filename=cv.filename, content_type=cv.content_type)
prompt_vars = build_gemini_prompt_vars(profile_data, cv_result)

# prompt_vars["cv_markdown"] → pegar en PROFILE_ANALYSIS_USER de PROMPTS.md
```

> `main.py` debe migrarse al contrato de [ENDPOINTS.md](../../docs/ENDPOINTS.md). MarkItDown quedará disponible cuando se reactive la subida de CV.

## API del módulo

| Función | Descripción |
|---------|-------------|
| `cv_file_to_markdown(bytes, filename, content_type)` | Valida + convierte PDF → `CvMarkdownResult` |
| `cv_markdown_for_prompt(result)` | String para `{cv_markdown}` (vacío si no hay CV) |
| `build_gemini_prompt_vars(profile, cv_result, job_offers)` | Dict listo para el prompt |

## Errores

| Excepción | HTTP sugerido | Cuándo |
|-----------|---------------|--------|
| `CvValidationError` | 400 | No PDF, > 5 MB, vacío |
| `CvConversionError` | 422 | PDF corrupto o MarkItDown falló |

## Instalación

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
# Requiere markitdown[pdf] (pdfplumber, pdfminer) — ver requirements.txt
uvicorn main:app --reload --port 8000
```

## Probar con curl (stub multipart)

```bash
curl -X POST http://localhost:8000/api/profile \
  -F 'profile={"name":"María","city":"Barranquilla","skills":"Canva, Excel"};type=application/json' \
  -F "cv=@./mi_cv.pdf;type=application/pdf"
```

## Reglas MVP (hackathon)

- Solo `.pdf`, máximo **5 MB**
- **No persistir** el PDF en disco ni BD
- El markdown solo vive en memoria para el request actual

## Siguiente paso

1. Alinear `backend/main.py` al contrato JSON de [ENDPOINTS.md](../../docs/ENDPOINTS.md).
2. Cuando se reactive CV: endpoint multipart o `POST /profile/cv`.
3. Conectar Gemini con [docs/PROMPTS.md](../../docs/PROMPTS.md).
