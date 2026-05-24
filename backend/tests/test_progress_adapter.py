"""Tests adaptador progreso M3 y carga de prompts."""

from datetime import datetime, timedelta, timezone

from app.services.progress_adapter import _current_day_from_started, _next_milestone
from app.utils.prompts import get_prompt, clear_prompt_cache


def test_current_day_starts_at_one():
    now = datetime.now(timezone.utc)
    assert _current_day_from_started(now) == 1


def test_current_day_increments():
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    assert _current_day_from_started(yesterday) == 2


def test_current_day_caps_at_90():
    old = datetime.now(timezone.utc) - timedelta(days=120)
    assert _current_day_from_started(old) == 90


def test_next_milestone_uses_current_day():
    plan = {
        "milestones": [
            {"dia": 7, "logro": "Primera semana"},
            {"dia": 30, "logro": "Mes completo"},
        ]
    }
    hit = _next_milestone(plan, current_day=1)
    assert hit == {"dia": 7, "logro": "Primera semana"}


def test_prompts_load_from_backend_bundle():
    clear_prompt_cache()
    text = get_prompt("CAREER_COACH_SYSTEM")
    assert "DulIA" in text
