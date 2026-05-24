"""Generación de respuestas del entrevistador IA (B8.3)."""

from __future__ import annotations

import json
import os
from typing import Any

from app.db.gemini import get_gemini_model
from app.models.interview_v2_models import InterviewPersona
from app.services.interview_v2.state_machine import pool_items_for_stage
from app.utils.logger import get_logger
from app.utils.prompts import get_prompt

logger = get_logger(__name__)
USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"

MOCK_REPLIES: dict[str, list[str]] = {
    "rapport": [
        "Gracias por compartir eso. ¿Qué es lo que más te emociona de este tipo de roles?",
        "Interesante. Cuéntame un poco más sobre tu experiencia reciente relacionada con el puesto.",
    ],
    "tecnica": [
        "Perfecto, pasemos a lo técnico. ¿Cómo abordarías un problema real usando {skill}? Dame un ejemplo concreto.",
        "Bien. ¿Qué harías si te piden optimizar algo que ya funciona pero va lento?",
        "Cuéntame cómo explicarías {skill} a alguien del equipo que no es técnico.",
    ],
    "behavioral": [
        "Cuéntame una situación difícil en equipo: ¿qué pasó, qué hiciste tú y cuál fue el resultado?",
        "¿Alguna vez cometiste un error en un proyecto? ¿Cómo lo manejaste y qué aprendiste?",
    ],
    "cierre": [
        "Para cerrar: ¿tienes alguna pregunta para mí sobre el rol o el equipo?",
        "Gracias por tu tiempo. ¿Hay algo más que quieras que sepamos de ti antes de terminar?",
    ],
}


def _historial_text(turns: list[dict], limit: int = 12) -> str:
    lines = []
    for t in turns[-limit:]:
        role = "Entrevistador" if t.get("role") == "interviewer" else "Candidato"
        lines.append(f"{role}: {t.get('text', '')}")
    return "\n".join(lines)


def _mock_reply(stage: str, target_skill: str | None, turns_in_stage: int) -> str:
    templates = MOCK_REPLIES.get(stage, MOCK_REPLIES["rapport"])
    idx = min(turns_in_stage - 1, len(templates) - 1)
    text = templates[max(0, idx)]
    skill = target_skill or "tu área"
    return text.replace("{skill}", skill)


async def generate_opening(persona: InterviewPersona) -> str:
    """Primer mensaje del entrevistador (etapa rapport)."""
    if USE_MOCK:
        return persona.saludo_inicial

    try:
        prompt_tpl = get_prompt("INTERVIEW_V2_OPENING")
        prompt = prompt_tpl.replace("{saludo_base}", persona.saludo_inicial).replace(
            "{persona_json}", persona.model_dump_json()
        )
        model = get_gemini_model()
        response = model.generate_content(prompt)
        text = (response.text or "").strip()
        return text or persona.saludo_inicial
    except Exception as e:
        logger.error(f"generate_opening fallback: {e}")
        return persona.saludo_inicial


async def generate_reply(
    state: dict[str, Any],
    last_message: str,
    persona: InterviewPersona,
    *,
    new_stage: str | None = None,
) -> str:
    """Genera la siguiente intervención del entrevistador."""
    stage = new_stage or state.get("stage", "rapport")
    turns: list[dict] = state.get("turns") or []
    target_skill = state.get("target_skill")
    pool_snapshot: list[dict] = state.get("pool_snapshot") or []
    pool_context = pool_items_for_stage(pool_snapshot, stage, target_skill)

    turns_in_stage = sum(
        1 for t in turns if t.get("role") == "interviewer" and t.get("stage") == stage
    )

    if USE_MOCK:
        if new_stage and new_stage != state.get("stage"):
            transition = {
                "tecnica": f"Perfecto, eso me da contexto. Pasemos a la parte técnica sobre {target_skill or 'tu skill'}. ",
                "behavioral": "Gracias. Ahora me interesa conocer cómo actúas en situaciones reales del día a día. ",
                "cierre": "Estamos cerrando. Me gustaría escuchar si tienes alguna pregunta para mí. ",
            }
            prefix = transition.get(new_stage, "")
            return prefix + _mock_reply(stage, target_skill, turns_in_stage + 1)

        return _mock_reply(stage, target_skill, turns_in_stage + 1)

    try:
        prompt_tpl = get_prompt("INTERVIEW_V2_TURN")
        prompt = (
            prompt_tpl.replace("{persona_json}", persona.model_dump_json())
            .replace("{stage}", stage)
            .replace("{target_skill}", str(target_skill or "habilidades del perfil"))
            .replace("{target_role}", str(state.get("target_role") or "rol junior"))
            .replace("{ultimo_mensaje}", last_message)
            .replace("{historial}", _historial_text(turns))
            .replace("{pool_contexto}", json.dumps(pool_context, ensure_ascii=False))
        )
        model = get_gemini_model()
        response = model.generate_content(prompt)
        text = (response.text or "").strip()
        if text:
            return text
    except Exception as e:
        logger.error(f"generate_reply fallback: {e}")

    return _mock_reply(stage, target_skill, turns_in_stage + 1)
