import json
import os

from fastapi import HTTPException

from app.db.gemini import get_gemini_model
from app.models.cv import CvParseOut, CvWizardPrefill
from app.utils.logger import get_logger
from cv_parser import CvConversionError, CvValidationError, cv_file_to_markdown

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"

PROMPT_CV = """
Eres un asistente que extrae datos de CVs de jóvenes colombianos para un formulario de onboarding laboral.

A partir del CV en markdown, devuelve ÚNICAMENTE un JSON válido con esta estructura (usa null si no aparece):
{{
  "name": string|null,
  "city": string|null,
  "departamento": string|null,
  "edad": string|null,
  "age_range": "16-20"|"21-25"|"26-30"|"31+"|null,
  "current_situation": "estudiante"|"recien_egresado"|"primer_empleo"|"desempleado"|"cambio_laboral"|null,
  "education_level": "bachiller"|"tecnico"|"tecnologo"|"universitario"|"postgrado"|null,
  "education": string|null,
  "has_experience": "si"|"no"|null,
  "experience_years": string|null,
  "experience_summary": string|null,
  "skills": string|null,
  "soft_skills": string|null,
  "interests": string|null,
  "work_mode": "presencial"|"remoto"|"hibrido"|"indiferente"|null,
  "opportunity_type": "empleo"|"practica"|"freelance"|"primer_empleo"|null,
  "availability": "inmediata"|"1_mes"|"fines_semana"|"medio_tiempo"|null,
  "tools": string|null,
  "portfolio_url": string|null
}}

Reglas:
- skills, soft_skills, interests, tools: strings separados por coma (no arrays).
- Infiere departamento si conoces la ciudad colombiana.
- has_experience "si" si hay experiencia laboral; "no" si es perfil sin trabajos.
- experience_years como string numérico (ej. "1", "0").
- No inventes datos que no estén en el CV.
- Devuelve SOLO JSON, sin markdown.

CV:
{cv_markdown}
""".strip()


async def parse_cv_pdf(file_bytes: bytes, filename: str, content_type: str | None) -> CvParseOut:
    if USE_MOCK:
        logger.info(f"[MOCK] CV parse simulado: {filename}")
        return _mock_cv_prefill()

    try:
        cv_result = cv_file_to_markdown(
            file_bytes,
            filename=filename or "cv.pdf",
            content_type=content_type,
        )
    except CvValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except CvConversionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    if not cv_result.parsed or not cv_result.markdown.strip():
        raise HTTPException(status_code=422, detail="No pudimos leer texto del PDF. Prueba otro archivo.")

    prefill_dict = await _extraer_cv_con_gemini(cv_result.markdown)
    prefill = CvWizardPrefill(**prefill_dict)
    fields_found = [k for k, v in prefill.model_dump().items() if v not in (None, "", [])]

    return CvParseOut(
        parsed=True,
        fields_found=fields_found,
        prefill=prefill,
        message=f"Detectamos {len(fields_found)} campos en tu CV. Revisa y completa lo que falte.",
    )


async def _extraer_cv_con_gemini(cv_markdown: str) -> dict:
    model = get_gemini_model("gemini-1.5-flash")
    prompt = PROMPT_CV.format(cv_markdown=cv_markdown[:12000])

    try:
        respuesta = model.generate_content(prompt)
        texto = respuesta.text.strip()
        if texto.startswith("```"):
            texto = texto.split("```")[1]
            if texto.startswith("json"):
                texto = texto[4:]
        data = json.loads(texto)
        return _apply_wizard_defaults(data)
    except Exception as e:
        logger.error(f"Error extrayendo CV con Gemini: {e}")
        raise HTTPException(
            status_code=422,
            detail="No pudimos interpretar tu CV. Completa el formulario manualmente.",
        ) from e


def _apply_wizard_defaults(data: dict) -> dict:
    """Rellena preferencias mínimas si el CV no las trae."""
    if data.get("skills") and not data.get("interests"):
        data["interests"] = data["skills"]
    if not data.get("work_mode"):
        data["work_mode"] = "indiferente"
    if not data.get("availability"):
        data["availability"] = "inmediata"
    if not data.get("opportunity_type"):
        data["opportunity_type"] = (
            "empleo" if data.get("has_experience") == "si" else "primer_empleo"
        )
    if not data.get("current_situation"):
        data["current_situation"] = (
            "recien_egresado" if data.get("has_experience") == "no" else "cambio_laboral"
        )
    return data


def _mock_cv_prefill() -> CvParseOut:
    prefill = CvWizardPrefill(
        name="María González",
        city="Barranquilla",
        departamento="Atlántico",
        edad="22",
        current_situation="recien_egresado",
        education_level="universitario",
        education="Comunicación social",
        has_experience="si",
        experience_years="1",
        experience_summary="Práctica en contenido digital y apoyo en redes sociales.",
        skills="Canva, edición de video, redacción, Excel",
        soft_skills="Comunicación, creatividad, trabajo en equipo",
        interests="Marketing digital, contenido para redes, medios",
        work_mode="hibrido",
        opportunity_type="primer_empleo",
        availability="inmediata",
        tools="Canva, CapCut, Google Analytics",
    )
    fields_found = [k for k, v in prefill.model_dump().items() if v]
    return CvParseOut(
        parsed=True,
        fields_found=fields_found,
        prefill=prefill,
        message=f"[Demo] Detectamos {len(fields_found)} campos. Revisa antes de continuar.",
    )
