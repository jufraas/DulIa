"""Progreso del plan 30-60-90 — store en memoria (M3 E2E con frontend)."""

from __future__ import annotations

import copy
import re
import unicodedata
from datetime import datetime, timezone
from typing import Any, Optional

from app.services.action_plan_service import ActionPlanService, action_plan_service
from app.utils.logger import get_logger

logger = get_logger(__name__)

UNLOCK_THRESHOLD_PCT = 80
_progress_store: dict[str, dict[str, Any]] = {}


def _slug(label: str) -> str:
    normalized = unicodedata.normalize("NFD", label.lower())
    stripped = "".join(c for c in normalized if unicodedata.category(c) != "Mn")
    slug = re.sub(r"[^a-z0-9]+", "-", stripped).strip("-")
    return slug[:40] or "task"


def build_task_id(phase: str, index: int, label: str) -> str:
    return f"p{phase}-t{index}-{_slug(label)}"


def _phase_tasks(tasks: list[dict], phase: str) -> list[dict]:
    return [t for t in tasks if t.get("phase") == phase]


def phase_completion_pct(tasks: list[dict], phase: str) -> int:
    phase_tasks = _phase_tasks(tasks, phase)
    if not phase_tasks:
        return 0
    done = sum(1 for t in phase_tasks if t.get("completed"))
    return round((done / len(phase_tasks)) * 100)


def global_completion_pct(tasks: list[dict]) -> int:
    if not tasks:
        return 0
    done = sum(1 for t in tasks if t.get("completed"))
    return round((done / len(tasks)) * 100)


def resolve_active_phase(tasks: list[dict]) -> str:
    p30 = phase_completion_pct(tasks, "30")
    p60 = phase_completion_pct(tasks, "60")
    if p30 < UNLOCK_THRESHOLD_PCT:
        return "30"
    if p60 < UNLOCK_THRESHOLD_PCT:
        return "60"
    return "90"


def build_phase_progress(tasks: list[dict]) -> list[dict]:
    p30 = phase_completion_pct(tasks, "30")
    p60 = phase_completion_pct(tasks, "60")
    phases = []
    for phase in ("30", "60", "90"):
        phase_tasks = _phase_tasks(tasks, phase)
        locked = (
            phase == "60" and p30 < UNLOCK_THRESHOLD_PCT
        ) or (phase == "90" and p60 < UNLOCK_THRESHOLD_PCT)
        phases.append(
            {
                "phase": phase,
                "pct": phase_completion_pct(tasks, phase),
                "locked": locked,
                "completed_count": sum(1 for t in phase_tasks if t.get("completed")),
                "total_count": len(phase_tasks),
            }
        )
    return phases


def _tasks_from_phase_actions(phase: str, acciones: list[dict], week_default: int) -> list[dict]:
    tasks = []
    for i, item in enumerate(acciones or []):
        label = str(item.get("tarea") or "").strip()
        if not label:
            continue
        week = int(item.get("semana") or week_default)
        tasks.append(
            {
                "id": build_task_id(phase, i, label),
                "label": label,
                "phase": phase,
                "week": week if phase == "30" else week_default,
                "completed": False,
                "completed_at": None,
            }
        )
    return tasks


def tasks_from_plan(plan_wrapper: dict, precomplete_first: int = 2) -> list[dict]:
    plan = plan_wrapper.get("plan") if isinstance(plan_wrapper.get("plan"), dict) else plan_wrapper
    tasks: list[dict] = []
    index = 0

    fase_30 = plan.get("fase_30") or {}
    for item in fase_30.get("acciones") or []:
        label = str(item.get("tarea") or "").strip()
        if not label:
            continue
        week = int(item.get("semana") or 1)
        tasks.append(
            {
                "id": build_task_id("30", index, label),
                "label": label,
                "phase": "30",
                "week": week,
                "completed": index < precomplete_first,
                "completed_at": datetime.now(timezone.utc).isoformat() if index < precomplete_first else None,
            }
        )
        index += 1

    for phase, week_default in (("60", 5), ("90", 9)):
        fase = plan.get(f"fase_{phase}") or {}
        for i, item in enumerate(fase.get("acciones") or []):
            label = str(item.get("tarea") or "").strip()
            if not label:
                continue
            tasks.append(
                {
                    "id": build_task_id(phase, i, label),
                    "label": label,
                    "phase": phase,
                    "week": week_default,
                    "completed": False,
                    "completed_at": None,
                }
            )

    return tasks


def _next_milestone(plan: dict) -> Optional[dict]:
    milestones = plan.get("milestones") or []
    for item in milestones:
        if not isinstance(item, dict):
            continue
        dia = int(item.get("dia") or 0)
        if dia > 12:
            return {"dia": dia, "logro": str(item.get("logro") or "")}
    if milestones and isinstance(milestones[0], dict):
        m = milestones[0]
        return {"dia": int(m.get("dia") or 30), "logro": str(m.get("logro") or "")}
    return None


def build_progress_state(session_id: str, plan_wrapper: dict, precomplete_first: int = 2) -> dict:
    plan = plan_wrapper.get("plan") if isinstance(plan_wrapper.get("plan"), dict) else plan_wrapper
    tasks = tasks_from_plan(plan_wrapper, precomplete_first=precomplete_first)
    return {
        "session_id": session_id,
        "current_day": 12,
        "global_pct": global_completion_pct(tasks),
        "active_phase": resolve_active_phase(tasks),
        "tasks": tasks,
        "phases": build_phase_progress(tasks),
        "next_milestone": _next_milestone(plan),
        "unlock_threshold_pct": UNLOCK_THRESHOLD_PCT,
    }


async def _load_plan(session_id: str) -> dict:
    plan = await action_plan_service.get_action_plan(session_id)
    if plan:
        return plan
    logger.warning(f"progress: sin plan para {session_id}, usando plantilla mock")
    return ActionPlanService._mock_action_plan(session_id)


async def init_progress(session_id: str) -> dict:
    plan_wrapper = await _load_plan(session_id)
    state = build_progress_state(session_id, plan_wrapper)
    _progress_store[session_id] = state
    logger.info(f"progress/init — session_id={session_id}, tasks={len(state['tasks'])}")
    return copy.deepcopy(state)


async def get_progress(session_id: str) -> Optional[dict]:
    existing = _progress_store.get(session_id)
    if existing:
        return copy.deepcopy(existing)
    return await init_progress(session_id)


async def toggle_task(session_id: str, task_id: str, completed: Optional[bool] = None) -> Optional[dict]:
    state = _progress_store.get(session_id)
    if not state:
        state = await init_progress(session_id)
    else:
        state = copy.deepcopy(state)

    task = next((t for t in state["tasks"] if t["id"] == task_id), None)
    if not task:
        return None

    phase_meta = next((p for p in state["phases"] if p["phase"] == task["phase"]), None)
    if phase_meta and phase_meta.get("locked") and not task.get("completed"):
        return copy.deepcopy(state)

    next_completed = (not task["completed"]) if completed is None else bool(completed)
    task["completed"] = next_completed
    task["completed_at"] = datetime.now(timezone.utc).isoformat() if next_completed else None

    state["global_pct"] = global_completion_pct(state["tasks"])
    state["active_phase"] = resolve_active_phase(state["tasks"])
    state["phases"] = build_phase_progress(state["tasks"])
    _progress_store[session_id] = state
    return copy.deepcopy(state)


async def add_tasks_from_weak_skills(session_id: str, weak_skills: list[str]) -> Optional[dict]:
    state = _progress_store.get(session_id)
    if not state:
        state = await init_progress(session_id)
    else:
        state = copy.deepcopy(state)

    skills = [str(s).strip() for s in (weak_skills or []) if str(s).strip()]
    current_day = int(state.get("current_day") or 1)
    week = min(4, max(1, (current_day + 6) // 7))

    for i, skill in enumerate(skills):
        label = f"Practica entrevista técnica: {skill}"
        state["tasks"].append(
            {
                "id": build_task_id("30", len(state["tasks"]) + i, label),
                "label": label,
                "phase": "30",
                "week": week,
                "completed": False,
                "completed_at": None,
            }
        )

    state["global_pct"] = global_completion_pct(state["tasks"])
    state["phases"] = build_phase_progress(state["tasks"])
    _progress_store[session_id] = state
    return copy.deepcopy(state)


def reset_progress_store() -> None:
    """Solo tests."""
    _progress_store.clear()
