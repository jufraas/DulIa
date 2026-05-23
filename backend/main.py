"""
DulIA API — FastAPI.

Flujo POST /api/profile:
  formulario (JSON) ± CV PDF → MarkItDown → cv_markdown → Gemini → respuesta JSON
"""

from __future__ import annotations

import json
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from markitdown import (
    CvConversionError,
    CvMarkdownResult,
    CvValidationError,
    build_gemini_prompt_vars,
    cv_file_to_markdown,
)

app = FastAPI(title="DulIA API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/profile")
async def create_profile(
    profile: str = Form(..., description="JSON stringificado del wizard"),
    cv: UploadFile | None = File(None, description="CV en PDF, opcional, max 5 MB"),
) -> dict[str, Any]:
    try:
        profile_data: dict[str, Any] = json.loads(profile)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="El campo profile debe ser JSON válido") from exc

    cv_result: CvMarkdownResult | None = None

    if cv is not None and cv.filename:
        file_bytes = await cv.read()
        try:
            cv_result = cv_file_to_markdown(
                file_bytes,
                filename=cv.filename,
                content_type=cv.content_type,
            )
        except CvValidationError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except CvConversionError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    prompt_vars = build_gemini_prompt_vars(profile_data, cv_result)

    # TODO (Carlos): llamar Gemini con docs/PROMPTS.md
    # response = await gemini_analyze(prompt_vars)
    # return { **response, "cv_parsed": bool(cv_result and cv_result.parsed) }

    return _mock_analysis(profile_data, cv_result, prompt_vars)


def _mock_analysis(
    profile: dict[str, Any],
    cv_result: CvMarkdownResult | None,
    prompt_vars: dict[str, str],
) -> dict[str, Any]:
    """Respuesta demo hasta conectar Gemini. Misma shape que frontend Mock_Response."""
    name = profile.get("name", "Usuario")
    city = profile.get("city", "Colombia")
    cv_parsed = bool(cv_result and cv_result.parsed)

    return {
        "profile": "Perfil junior en crecimiento",
        "score": 78 if cv_parsed else 74,
        "opportunities": [
            f"Oportunidades alineadas en {city}",
            "Roles junior según tus habilidades declaradas",
            "Prácticas o primer empleo en empresas locales",
        ],
        "roadmap": [
            f"Semana 1: Refina tu pitch personal — hola {name}",
            "Semana 2: Aplica a 5 vacantes con carta personalizada",
            "Semana 3: Fortalece habilidades técnicas del formulario",
            "Semana 4: Prepara entrevistas con ejemplos de tu experiencia",
        ],
        "cv_parsed": cv_parsed,
        "_debug": {
            "cv_chars": cv_result.char_count if cv_result else 0,
            "prompt_has_cv": bool(prompt_vars.get("cv_markdown", "").strip())
            and prompt_vars.get("cv_markdown") != "(Sin CV adjunto)",
        },
    }
