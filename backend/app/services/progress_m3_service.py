"""Facade M3 — contrato público de Migue sobre persistencia Supabase (B3)."""

from __future__ import annotations

from typing import Any, Optional

from app.services.action_plan_service import ActionPlanService, PlanNotFoundError, action_plan_service
from app.services.progress_adapter import (
    build_task_catalog,
    m3_id_to_b3_id,
    progress_response_to_m3,
)
from app.services.progress_service import (
    ProfileNotFoundError,
    add_tasks_from_weak_skills as persist_add_tasks,
    get_progress_with_stats,
    init_progress as persist_init,
    reset_progress_store as persist_reset,
    toggle_task as persist_toggle,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def _load_plan_wrapper(session_id: str) -> dict:
    plan = await action_plan_service.get_action_plan(session_id)
    if plan:
        return plan
    logger.warning(f"progress M3: sin plan para {session_id}, usando plantilla mock")
    return ActionPlanService._mock_action_plan(session_id)


async def _to_m3(session_id: str) -> dict[str, Any]:
    stats = await get_progress_with_stats(session_id)
    plan_wrapper = await _load_plan_wrapper(session_id)
    return progress_response_to_m3(session_id, plan_wrapper, stats)


async def get_progress(session_id: str) -> dict[str, Any]:
    return await _to_m3(session_id)


async def init_progress(session_id: str) -> dict[str, Any]:
    await persist_init(session_id)
    state = await _to_m3(session_id)
    logger.info(f"progress/init M3 — session_id={session_id}, tasks={len(state['tasks'])}")
    return state


async def toggle_task(
    session_id: str,
    task_id: str,
    completed: Optional[bool] = None,
) -> Optional[dict[str, Any]]:
    plan_wrapper = await _load_plan_wrapper(session_id)
    plan_data = plan_wrapper.get("plan") or {}
    catalog = build_task_catalog(plan_data)
    b3_id = m3_id_to_b3_id(catalog, task_id)
    if not b3_id:
        return None

    current = await _to_m3(session_id)
    task = next((t for t in current["tasks"] if t["id"] == task_id), None)
    if not task:
        return None

    phase_meta = next((p for p in current["phases"] if p["phase"] == task["phase"]), None)
    next_completed = (not task["completed"]) if completed is None else bool(completed)
    if phase_meta and phase_meta.get("locked") and not task.get("completed") and next_completed:
        return current

    await persist_toggle(session_id, b3_id, next_completed)
    return await _to_m3(session_id)


async def add_tasks_from_weak_skills(
    session_id: str,
    weak_skills: list[str],
) -> Optional[dict[str, Any]]:
    try:
        await persist_add_tasks(session_id, weak_skills)
    except PlanNotFoundError:
        return None
    except ValueError:
        return None
    return await _to_m3(session_id)


def reset_progress_store() -> None:
    """Solo tests — limpia store mock de progreso."""
    persist_reset()


__all__ = [
    "ProfileNotFoundError",
    "get_progress",
    "init_progress",
    "toggle_task",
    "add_tasks_from_weak_skills",
    "reset_progress_store",
]
