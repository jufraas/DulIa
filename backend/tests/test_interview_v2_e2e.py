"""E2E entrevista V2 con USE_MOCK_DATA (B8.4)."""

import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("USE_MOCK_DATA", "true")
os.environ.setdefault("INTERVIEW_V2_ENABLED", "true")

from app.services.interview_v2.service import reset_interview_v2_store
from main import app

client = TestClient(app)
SESSION = f"pytest-interview-v2-{uuid4()}"


@pytest.fixture(autouse=True)
def _reset_stores():
    reset_interview_v2_store()
    yield
    reset_interview_v2_store()


def test_interview_v2_start_returns_persona_and_opening():
    res = client.post(
        "/api/interview/v2/start",
        json={"session_id": SESSION, "target_skill": "Python", "target_role": "Desarrollador Jr"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["persona"]["nombre"]
    assert body["opening_message"]
    assert body["stage"] == "rapport"
    assert body["max_turns"] == 10


def test_interview_v2_full_flow_mock():
    start = client.post(
        "/api/interview/v2/start",
        json={"session_id": SESSION, "target_skill": "Python", "target_role": "Desarrollador Jr"},
    )
    assert start.status_code == 200
    interview_id = start.json()["interview_id"]

    messages = [
        "Soy Carlos, estudio sistemas y tengo experiencia con proyectos personales en Python.",
        "Me motiva mucho aprender en un equipo de desarrollo y crecer profesionalmente.",
        "En un proyecto usé Python con listas, diccionarios y funciones para automatizar reportes.",
        "Cuando hay un error leo el traceback, reviso documentación y pruebo paso a paso.",
        "También separé el código en módulos reutilizables con buenas prácticas.",
        "En una situación difícil con mi equipo reorganizamos prioridades y entregamos a tiempo.",
        "Mi acción fue comunicar bloqueos temprano y el resultado fue cumplir la fecha límite.",
        "¿Cuál sería el siguiente paso del proceso? Me interesa mucho el rol.",
    ]

    finished = False
    last_body = None
    for msg in messages:
        turn = client.post(
            f"/api/interview/v2/{interview_id}/turn",
            json={"message": msg},
        )
        assert turn.status_code == 200, turn.text
        last_body = turn.json()
        if last_body.get("finished"):
            finished = True
            break

    assert finished is True
    assert last_body["summary"] is not None
    assert 0 <= last_body["summary"]["global_score"] <= 100
    assert len(last_body["summary"]["stages"]) >= 1

    state = client.get(f"/api/interview/v2/{interview_id}")
    assert state.status_code == 200
    assert state.json()["status"] == "completed"


def test_interview_v2_conflict_when_already_in_progress():
    sid = f"pytest-v2-conflict-{uuid4()}"
    first = client.post(
        "/api/interview/v2/start",
        json={"session_id": sid, "target_skill": "Python"},
    )
    assert first.status_code == 200

    second = client.post(
        "/api/interview/v2/start",
        json={"session_id": sid, "target_skill": "Python"},
    )
    assert second.status_code == 409
    assert "existing_interview_id" in second.json()["detail"]
