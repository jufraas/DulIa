"""Verifica que todos los prompts de runtime existen en backend/prompts/PROMPTS.md."""

import pytest

from app.utils.prompts import clear_prompt_cache, get_prompt

# Prompts usados por servicios en producción (Railway).
RUNTIME_PROMPTS = [
    "CAREER_COACH_SYSTEM",
    "COACH_FUNCTION_ROUTER",
    "PROFILE_ANALYSIS",
    "ACTION_PLAN_GENERATOR",
    "INTERVIEW_QUESTION_GENERATOR",
    "INTERVIEW_ANSWER_EVALUATOR",
    "INTERVIEW_FINAL_FEEDBACK",
    "INTERVIEW_V2_OPENING",
    "INTERVIEW_V2_TURN",
    "INTERVIEW_V2_STAGE_EVAL",
    "INTERVIEW_V2_FINAL_SUMMARY",
]


@pytest.fixture(autouse=True)
def _fresh_prompt_cache():
    clear_prompt_cache()
    yield
    clear_prompt_cache()


@pytest.mark.parametrize("name", RUNTIME_PROMPTS)
def test_runtime_prompt_loads(name: str):
    text = get_prompt(name)
    assert len(text.strip()) > 50, f"Prompt {name} vacío o demasiado corto"
