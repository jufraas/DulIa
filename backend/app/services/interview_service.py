"""Mock interview — store en memoria alineado al contrato frontend (M3)."""

from __future__ import annotations

import copy
from datetime import datetime, timezone
from typing import Any, Optional

from app.utils.logger import get_logger

logger = get_logger(__name__)

MOCK_QUESTIONS = [
    "Cuéntame sobre un proyecto reciente donde usaste {skill}. ¿Qué problema resolviste?",
    "¿Cómo explicarías {skill} a alguien que no es técnico?",
    "Describe una situación difícil trabajando en equipo relacionada con {skill}.",
    "¿Qué herramientas o recursos usas para mantenerte al día en {skill}?",
    "Si tuvieras una semana para mejorar en {skill}, ¿qué harías primero?",
]

_active: dict[str, dict[str, Any]] = {}
_history: dict[str, list[dict[str, Any]]] = {}
_counter = 1


def _question_text(skill: str, index: int) -> str:
    template = MOCK_QUESTIONS[index] if index < len(MOCK_QUESTIONS) else MOCK_QUESTIONS[0]
    return template.replace("{skill}", skill)


def _public_session(session: dict) -> dict:
    return {
        "id": session["id"],
        "session_id": session["session_id"],
        "skill": session["skill"],
        "role": session.get("role"),
        "current_question": session["current_question"],
        "answers_count": session["answers_count"],
        "status": session["status"],
    }


def start_interview(session_id: str, skill: str, role: Optional[str] = None) -> dict:
    global _counter
    interview_id = f"interview-{_counter}"
    _counter += 1
    session = {
        "id": interview_id,
        "session_id": session_id,
        "skill": skill,
        "role": role,
        "current_question": {
            "index": 1,
            "text": _question_text(skill, 0),
            "total": len(MOCK_QUESTIONS),
        },
        "answers_count": 0,
        "status": "active",
        "answers": [],
    }
    _active[interview_id] = session
    logger.info(f"interview/start — id={interview_id}, skill={skill}")
    return copy.deepcopy(_public_session(session))


def submit_answer(interview_id: str, answer: str) -> Optional[dict]:
    session = _active.get(interview_id)
    if not session or session.get("status") != "active":
        return None

    session["answers"].append((answer or "").strip())
    session["answers_count"] = len(session["answers"])

    if session["answers_count"] >= len(MOCK_QUESTIONS):
        return copy.deepcopy(_public_session(session))

    idx = session["answers_count"]
    session["current_question"] = {
        "index": idx + 1,
        "text": _question_text(session["skill"], idx),
        "total": len(MOCK_QUESTIONS),
    }
    return copy.deepcopy(_public_session(session))


def finish_interview(interview_id: str, user_id: str = "demo-user") -> Optional[dict]:
    session = _active.get(interview_id)
    if not session:
        return None

    feedback = []
    for index, ans in enumerate(session["answers"]):
        score = 78 + (index % 3) * 4 if len(ans) >= 80 else 52 + (index % 4) * 5
        feedback.append(
            {
                "question_index": index + 1,
                "question": _question_text(session["skill"], index),
                "answer": ans,
                "feedback": (
                    "Buena estructura. Podrías añadir una métrica concreta del impacto."
                    if len(ans) >= 80
                    else "Respuesta breve. Amplía con un ejemplo real y un resultado medible."
                ),
                "score": score,
            }
        )

    score = round(sum(item["score"] for item in feedback) / len(feedback)) if feedback else 60
    weak_skills = [] if score >= 75 else [f"{session['skill']} — profundizar", "Comunicación de impacto"]
    finished_at = datetime.now(timezone.utc).isoformat()

    session["status"] = "finished"
    result = {
        "id": session["id"],
        "skill": session["skill"],
        "score": score,
        "feedback": feedback,
        "weak_skills": weak_skills,
        "finished_at": finished_at,
    }

    history = _history.setdefault(user_id, [])
    history.insert(
        0,
        {
            "id": session["id"],
            "skill": session["skill"],
            "score": score,
            "finished_at": finished_at,
            "role": session.get("role"),
        },
    )
    _history[user_id] = history[:10]
    return copy.deepcopy(result)


def interview_history(user_id: str = "demo-user") -> list[dict]:
    return copy.deepcopy(_history.get(user_id, []))


def reset_interview_store() -> None:
    global _counter
    _active.clear()
    _history.clear()
    _counter = 1
