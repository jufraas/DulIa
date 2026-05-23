# MarkItDown — CV PDF → Markdown

Módulo para el flujo DulIA cuando el usuario **sube su CV en PDF** en el onboarding.

## Flujo completo

```
Frontend (multipart)          Backend                    IA
─────────────────────         ───────                    ──
profile: JSON string    →     parse JSON
cv: archivo PDF         →     validate_cv_pdf()
                         →     cv_file_to_markdown()  →  cv_markdown
                         →     build_gemini_prompt_vars()
                         →     Gemini (docs/PROMPTS.md)
                         ←     JSON score + oportunidades + roadmap
```

Contrato frontend: `docs/ENDPOINTS.md` (Modo B multipart).

## Uso en FastAPI

Ya integrado en `backend/main.py`:

```python
from markitdown import cv_file_to_markdown, build_gemini_prompt_vars

file_bytes = await cv.read()
cv_result = cv_file_to_markdown(file_bytes, filename=cv.filename, content_type=cv.content_type)
prompt_vars = build_gemini_prompt_vars(profile_data, cv_result)

# prompt_vars["cv_markdown"] → pegar en PROFILE_ANALYSIS_USER de PROMPTS.md
```

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
uvicorn main:app --reload --port 8000
```

## Probar con curl

```bash
curl -X POST http://localhost:8000/api/profile \
  -F 'profile={"name":"María","city":"Barranquilla","skills":"Canva, Excel"};type=application/json' \
  -F "cv=@./mi_cv.pdf;type=application/pdf"
```

Respuesta incluye `cv_parsed: true` si MarkItDown extrajo texto.

## Reglas MVP (hackathon)

- Solo `.pdf`, máximo **5 MB**
- **No persistir** el PDF en disco ni BD
- El markdown solo vive en memoria para el request actual

## Siguiente paso (Carlos / IA)

1. Crear `backend/gemini/analyze.py` (o similar).
2. Cargar prompts desde `docs/PROMPTS.md`.
3. Reemplazar `_mock_analysis()` en `main.py` por la llamada real.
4. Quitar el campo `_debug` de la respuesta en producción.
