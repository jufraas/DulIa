"""Tests M3 — progreso e entrevista mock API."""

from fastapi.testclient import TestClient

from app.services import interview_service, progress_service
from main import app

client = TestClient(app)


def setup_function():
    progress_service.reset_progress_store()
    interview_service.reset_interview_store()


def test_progress_init_get_toggle():
    sid = "pytest-progress-1"
    init = client.post("/api/progress/init", json={"session_id": sid})
    assert init.status_code == 200
    body = init.json()
    assert body["session_id"] == sid
    assert len(body["tasks"]) >= 8
    assert body["unlock_threshold_pct"] == 80

    get = client.get(f"/api/progress/{sid}")
    assert get.status_code == 200
    assert get.json()["session_id"] == sid

    task_id = body["tasks"][0]["id"]
    before_pct = body["global_pct"]
    toggle = client.patch(
        "/api/progress/task",
        json={"session_id": sid, "task_id": task_id, "completed": True},
    )
    assert toggle.status_code == 200
    toggled = toggle.json()
    assert toggled["tasks"][0]["completed"] is True
    assert toggled["global_pct"] >= before_pct


def test_progress_toggle_not_found():
    sid = "pytest-progress-missing"
    client.post("/api/progress/init", json={"session_id": sid})
    res = client.patch(
        "/api/progress/task",
        json={"session_id": sid, "task_id": "no-existe", "completed": True},
    )
    assert res.status_code == 404


def test_progress_add_from_skills():
    sid = "pytest-progress-skills"
    client.post("/api/progress/init", json={"session_id": sid})
    res = client.post(
        "/api/progress/add-from-skills",
        json={"session_id": sid, "weak_skills": ["Python", "Excel"]},
    )
    assert res.status_code == 200
    labels = [t["label"] for t in res.json()["tasks"]]
    assert any("Python" in label for label in labels)
    assert any("Excel" in label for label in labels)


def test_interview_flow():
    sid = "pytest-interview-1"
    start = client.post(
        "/api/interview/start",
        json={"session_id": sid, "skill": "Canva", "role": "Diseñador"},
    )
    assert start.status_code == 200
    interview_id = start.json()["id"]
    assert start.json()["current_question"]["index"] == 1

    answer_text = (
        "En mi último proyecto usé Canva para crear contenido visual "
        "con resultados medibles en engagement y alcance orgánico."
    )
    session = start.json()
    for _ in range(5):
        res = client.post(
            f"/api/interview/{interview_id}/answer",
            json={"answer": answer_text},
        )
        assert res.status_code == 200
        session = res.json()

    finish = client.post(
        f"/api/interview/{interview_id}/finish",
        json={"user_id": "pytest-user"},
    )
    assert finish.status_code == 200
    result = finish.json()
    assert isinstance(result["score"], int)
    assert len(result["feedback"]) == 5

    history = client.get("/api/interview/history", params={"user_id": "pytest-user"})
    assert history.status_code == 200
    assert len(history.json()) >= 1


def test_interview_answer_not_found():
    res = client.post(
        "/api/interview/fake-id/answer",
        json={"answer": "respuesta de prueba suficientemente larga"},
    )
    assert res.status_code == 404


def test_has_profile_without_supabase():
    res = client.get("/api/user/has-profile", params={"user_id": "pytest-user"})
    assert res.status_code == 200
    body = res.json()
    assert "has_profile" in body
    assert body["has_profile"] is False
