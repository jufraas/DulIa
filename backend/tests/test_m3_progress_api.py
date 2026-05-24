"""Tests M3 — progreso e entrevista (USE_MOCK_DATA=true vía conftest)."""

from uuid import uuid4

from fastapi.testclient import TestClient

from app.services import interview_service, progress_m3_service as progress_service
from main import app

client = TestClient(app)

ANSWER_TEXT = (
    "En mi último proyecto usé Canva para crear contenido visual "
    "con resultados medibles en engagement y alcance orgánico."
)


def setup_function():
    progress_service.reset_progress_store()
    reset_interview = getattr(interview_service, "reset_interview_store", None)
    if callable(reset_interview):
        reset_interview()


def test_progress_init_get_toggle():
    sid = f"pytest-progress-{uuid4()}"
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
    sid = f"pytest-progress-missing-{uuid4()}"
    client.post("/api/progress/init", json={"session_id": sid})
    res = client.patch(
        "/api/progress/task",
        json={"session_id": sid, "task_id": "no-existe", "completed": True},
    )
    assert res.status_code == 404


def test_progress_add_from_skills():
    sid = f"pytest-progress-skills-{uuid4()}"
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
    sid = f"pytest-interview-{uuid4()}"
    start = client.post(
        "/api/interview/start",
        json={
            "session_id": sid,
            "target_skill": "Canva",
            "target_role": "Diseñador",
        },
    )
    assert start.status_code == 200
    payload = start.json()
    interview_id = payload["interview_id"]
    assert len(payload["questions"]) == 5

    for idx in range(5):
        res = client.post(
            f"/api/interview/{interview_id}/answer",
            json={"question_idx": idx, "answer": ANSWER_TEXT},
        )
        assert res.status_code == 200

    finish = client.post(f"/api/interview/{interview_id}/finish")
    assert finish.status_code == 200
    result = finish.json()
    assert isinstance(result["global_score"], int)
    assert result["feedback_general"]

    history = client.get(f"/api/interview/history/{sid}")
    assert history.status_code == 200
    assert len(history.json()) >= 1


def test_interview_answer_not_found():
    res = client.post(
        "/api/interview/fake-id/answer",
        json={"question_idx": 0, "answer": ANSWER_TEXT},
    )
    assert res.status_code == 404


def test_has_profile_without_supabase():
    unknown_user = "00000000-0000-4000-8000-000000000000"
    res = client.get("/api/user/has-profile", params={"user_id": unknown_user})
    assert res.status_code == 200
    body = res.json()
    assert "has_profile" in body
    assert body["has_profile"] is False
