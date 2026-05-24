"""Tests máquina de estados entrevista V2 (B8.3)."""

from app.services.interview_v2.evaluator import _heuristic_stage_score
from app.services.interview_v2.state_machine import (
    STAGE_WEIGHTS,
    StageEvalResult,
    can_advance,
    compute_global_score,
    count_candidate_turns_in_stage,
    next_stage,
    should_evaluate_stage,
    should_force_advance,
)


def _turns_rapport_ok() -> list[dict]:
    return [
        {"role": "interviewer", "text": "Hola", "stage": "rapport"},
        {
            "role": "candidate",
            "text": "Soy Carlos, estudio sistemas y busco mi primera oportunidad laboral.",
            "stage": "rapport",
        },
        {
            "role": "candidate",
            "text": "Me motiva aprender en un equipo de desarrollo con impacto real.",
            "stage": "rapport",
        },
    ]


def test_rapport_to_tecnica_after_two_turns():
    turns = _turns_rapport_ok()
    assert count_candidate_turns_in_stage(turns, "rapport") == 2
    assert should_evaluate_stage("rapport", 2) is True

    eval_result = _heuristic_stage_score(
        "rapport",
        [t["text"] for t in turns if t["role"] == "candidate"],
        [],
    )
    assert len(eval_result.objectives_met) >= 2
    assert can_advance("rapport", eval_result, 2) is True
    assert next_stage("rapport") == "tecnica"


def test_tecnica_force_advance_on_max_turns():
    turns = [
        {"role": "candidate", "text": "Respuesta corta sin detalle.", "stage": "tecnica"},
    ] * 5
    assert should_force_advance("tecnica", 5) is True

    eval_result = _heuristic_stage_score("tecnica", ["Respuesta corta"] * 5, [])
    assert eval_result.mini_score < 60
    assert can_advance("tecnica", eval_result, 5) is True


def test_behavioral_star_score():
    text = (
        "En una situación difícil con mi equipo teníamos una tarea urgente. "
        "Mi acción fue reorganizar prioridades y comunicar bloqueos. "
        "El resultado fue entregar a tiempo y aprender a pedir ayuda."
    )
    eval_result = _heuristic_stage_score("behavioral", [text], [])
    assert eval_result.mini_score >= 70
    assert "estructura_star" in eval_result.objectives_met


def test_global_score_weighted():
    scores = {"rapport": 80, "tecnica": 70, "behavioral": 60, "cierre": 90}
    global_score = compute_global_score(scores)
    assert 70 <= global_score <= 71
    assert 0 <= global_score <= 100


def test_cierre_can_advance_with_any_response():
    eval_result = StageEvalResult(
        mini_score=65,
        objectives_met=[],
        gaps=[],
        strengths=[],
        key_moments=[],
    )
    assert can_advance("cierre", eval_result, 1) is True
