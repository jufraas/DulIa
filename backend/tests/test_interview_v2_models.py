"""Tests modelos entrevista V2 (B8.2)."""

import pytest
from pydantic import ValidationError

from app.models.interview_v2_models import (
    InterviewPersona,
    InterviewStartV2Input,
    InterviewSummary,
    InterviewTurnInput,
    StageBreakdown,
)
from app.services.interview_v2.persona import PERSONA_BANK, build_persona


def test_interview_turn_input_length():
    with pytest.raises(ValidationError):
        InterviewTurnInput(message="")

    with pytest.raises(ValidationError):
        InterviewTurnInput(message="x" * 2001)

    ok = InterviewTurnInput(message="Respuesta válida del candidato.")
    assert ok.message.startswith("Respuesta")


def test_interview_start_input_requires_session():
    with pytest.raises(ValidationError):
        InterviewStartV2Input(session_id="")


def test_interview_summary_score_bounds():
    with pytest.raises(ValidationError):
        InterviewSummary(
            global_score=101,
            feedback_general="ok",
        )


def test_build_persona_covers_all_sectors():
    perfil = {
        "nombre": "Carlos",
        "carrera": "Ingeniería de sistemas",
        "habilidades": ["Python"],
    }
    for sector in PERSONA_BANK:
        persona = build_persona(sector, "Desarrollador Jr", perfil, "Python")
        assert isinstance(persona, InterviewPersona)
        assert persona.nombre
        assert persona.sector == sector
        assert "Carlos" in persona.saludo_inicial


def test_stage_breakdown_defaults():
    bd = StageBreakdown(stage="rapport", score=75)
    assert bd.strengths == []
    assert bd.gaps == []
