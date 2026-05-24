"""Persistencia y cálculo de progreso del plan 30/60/90."""

import json
import os
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any

from app.db.supabase import get_supabase
from app.models.progress_models import AddTasksResponse, AddedTaskItem, ProgressResponse
from app.services.action_plan_service import PlanNotFoundError, action_plan_service
from app.utils.logger import get_logger

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"
PHASES = (30, 60, 90)
UNLOCK_THRESHOLD_PCT = 80

# Almacén en memoria para modo mock (session_id → fila plan_progress)
_mock_progress: dict[str, dict[str, Any]] = {}


class ProfileNotFoundError(Exception):
    """No existe profiles con ese session_id."""


def _parse_completed(raw: Any) -> list[str]:
    if raw is None:
        return []
    if isinstance(raw, str):
        return json.loads(raw)
    return list(raw)


def _task_ids_for_phase(plan_data: dict | None, phase: int) -> list[str]:
    """Genera todos los task_id de una fase según convención fase_X:semana_N:idx_M."""
    if not plan_data:
        return []
    fase_obj = plan_data.get(f"fase_{phase}") or {}
    acciones = fase_obj.get("acciones") or []
    by_week: dict[int, list[int]] = defaultdict(list)
    for i, _acc in enumerate(acciones):
        semana = int(_acc.get("semana") or 1)
        by_week[semana].append(i)

    ids: list[str] = []
    for semana in sorted(by_week.keys()):
        for idx, _action_idx in enumerate(by_week[semana]):
            ids.append(f"fase_{phase}:semana_{semana}:idx_{idx}")
    return ids


def _count_total_tasks(plan_data: dict | None, fase: int | None = None) -> int:
    """Cuenta tareas en el JSON del plan (todas las fases o una sola)."""
    if not plan_data:
        return 0
    phases = [fase] if fase is not None else list(PHASES)
    total = 0
    for phase in phases:
        fase_obj = plan_data.get(f"fase_{phase}") or {}
        acciones = fase_obj.get("acciones") or []
        total += len(acciones)
    return total


def _phase_completion_pct(plan_data: dict | None, phase: int, completed: set[str]) -> int:
    ids = _task_ids_for_phase(plan_data, phase)
    if not ids:
        return 0
    done = sum(1 for tid in ids if tid in completed)
    return int(round(done / len(ids) * 100))


def recalc_current_phase(
    plan_data: dict | None, completed: list[str]
) -> tuple[int, list[int]]:
    """
    Desbloqueo: fase 60 si fase 30 ≥80%; fase 90 si fase 60 ≥80%.
    current_phase = última fase desbloqueada que aún tiene tareas pendientes.
    """
    completed_set = set(completed)
    unlocked = [30]

    if plan_data:
        if _phase_completion_pct(plan_data, 30, completed_set) >= UNLOCK_THRESHOLD_PCT:
            unlocked.append(60)
        if 60 in unlocked and _phase_completion_pct(plan_data, 60, completed_set) >= UNLOCK_THRESHOLD_PCT:
            unlocked.append(90)

    current = unlocked[-1]
    if plan_data:
        for phase in reversed(unlocked):
            ids = _task_ids_for_phase(plan_data, phase)
            if any(tid not in completed_set for tid in ids):
                current = phase
                break

    return current, unlocked


def _calc_current_week(plan_data: dict | None, phase: int, completed: set[str]) -> int:
    """Primera semana de la fase con al menos una tarea pendiente."""
    if not plan_data:
        return 1
    fase_obj = plan_data.get(f"fase_{phase}") or {}
    acciones = fase_obj.get("acciones") or []
    if not acciones:
        return 1

    weeks = sorted({int(a.get("semana") or 1) for a in acciones})
    for semana in weeks:
        week_ids = [
            tid
            for tid in _task_ids_for_phase(plan_data, phase)
            if f":semana_{semana}:" in tid
        ]
        if any(tid not in completed for tid in week_ids):
            return semana
    return weeks[-1]


def _valid_completed_count(plan_data: dict | None, completed: list[str]) -> int:
    if not plan_data:
        return 0
    all_ids = set()
    for phase in PHASES:
        all_ids.update(_task_ids_for_phase(plan_data, phase))
    return sum(1 for tid in completed if tid in all_ids)


def _row_to_stats(row: dict, plan_data: dict | None) -> ProgressResponse:
    completed = _parse_completed(row.get("completed_tasks"))
    completed_set = set(completed)

    total = _count_total_tasks(plan_data)
    done = _valid_completed_count(plan_data, completed)
    global_pct = int(round(done / total * 100)) if total > 0 else 0

    current_phase, unlocked = recalc_current_phase(plan_data, completed)
    phase_total = _count_total_tasks(plan_data, fase=current_phase)
    phase_done = sum(
        1 for tid in _task_ids_for_phase(plan_data, current_phase) if tid in completed_set
    )
    phase_pct = int(round(phase_done / phase_total * 100)) if phase_total > 0 else 0
    current_week = _calc_current_week(plan_data, current_phase, completed_set)

    started = row.get("started_at")
    if isinstance(started, str):
        started = datetime.fromisoformat(started.replace("Z", "+00:00"))

    return ProgressResponse(
        session_id=row["session_id"],
        profile_id=str(row["profile_id"]),
        started_at=started,
        current_phase=current_phase,
        current_week=current_week,
        completed_tasks=completed,
        progreso_global_pct=global_pct,
        progreso_fase_pct=phase_pct,
        total_tareas=total,
        tareas_completadas=done,
        fases_desbloqueadas=unlocked,
    )


async def _load_profile(session_id: str) -> dict:
    if USE_MOCK:
        return {
            "id": "mock-profile-progress",
            "session_id": session_id,
            "user_id": None,
        }

    supabase = get_supabase()
    res = supabase.table("profiles").select("id, session_id, user_id").eq("session_id", session_id).execute()
    if not res.data:
        raise ProfileNotFoundError(session_id)
    return res.data[0]


async def _load_progress_row(profile_id: str, session_id: str) -> dict | None:
    if USE_MOCK:
        return _mock_progress.get(session_id)

    supabase = get_supabase()
    res = (
        supabase.table("plan_progress")
        .select("*")
        .eq("profile_id", profile_id)
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


async def get_or_init_progress(session_id: str, *, create: bool = True) -> tuple[dict, bool]:
    """
    Obtiene fila plan_progress; la crea si no existe y create=True.
    Retorna (row, created).
    """
    profile = await _load_profile(session_id)
    profile_id = str(profile["id"])

    row = await _load_progress_row(profile_id, session_id)
    if row:
        return row, False

    if not create:
        raise ValueError("Progreso no inicializado")

    now = datetime.now(timezone.utc).isoformat()
    new_row = {
        "profile_id": profile_id,
        "user_id": profile.get("user_id"),
        "session_id": session_id,
        "started_at": now,
        "current_phase": 30,
        "current_week": 1,
        "completed_tasks": [],
        "updated_at": now,
    }

    if USE_MOCK:
        new_row["id"] = f"mock-progress-{session_id[:8]}"
        _mock_progress[session_id] = new_row
        logger.info(f"[MOCK] plan_progress init session_id={session_id}")
        return new_row, True

    supabase = get_supabase()
    res = supabase.table("plan_progress").insert(new_row).execute()
    logger.info(f"plan_progress creado profile_id={profile_id}")
    return res.data[0], True


async def get_progress_with_stats(session_id: str) -> ProgressResponse:
    """Devuelve progreso con porcentajes; inicializa fila si falta."""
    row, _ = await get_or_init_progress(session_id, create=True)
    plan_data = await _load_plan(session_id)
    return _row_to_stats(row, plan_data)


async def init_progress(session_id: str) -> tuple[ProgressResponse, bool]:
    """Idempotente: crea progreso si no existe."""
    row, created = await get_or_init_progress(session_id, create=True)
    plan_data = await _load_plan(session_id)
    return _row_to_stats(row, plan_data), created


async def toggle_task(session_id: str, task_id: str, completed: bool) -> ProgressResponse:
    """Marca/desmarca tarea, recalcula fase y persiste."""
    row, _ = await get_or_init_progress(session_id, create=True)
    plan_data = await _load_plan(session_id)

    tasks = _parse_completed(row.get("completed_tasks"))
    tasks_set = set(tasks)

    if completed:
        if task_id not in tasks_set:
            tasks.append(task_id)
    else:
        tasks = [t for t in tasks if t != task_id]

    current_phase, _unlocked = recalc_current_phase(plan_data, tasks)
    current_week = _calc_current_week(plan_data, current_phase, set(tasks))
    now = datetime.now(timezone.utc).isoformat()

    update_payload = {
        "completed_tasks": tasks,
        "current_phase": current_phase,
        "current_week": current_week,
        "updated_at": now,
    }

    if USE_MOCK:
        row.update(update_payload)
        _mock_progress[session_id] = row
        logger.info(f"[MOCK] toggle task session_id={session_id} task_id={task_id} completed={completed}")
    else:
        supabase = get_supabase()
        supabase.table("plan_progress").update(update_payload).eq("profile_id", row["profile_id"]).execute()
        row.update(update_payload)
        logger.info(f"toggle task OK session_id={session_id} task_id={task_id}")

    return _row_to_stats(row, plan_data)


async def _load_plan(session_id: str) -> dict | None:
    """Carga el plan de acción (inner `plan` dict) o None."""
    try:
        ap = await action_plan_service.get_action_plan(session_id)
    except Exception as e:
        logger.warning(f"No se pudo cargar action plan para {session_id}: {e}")
        return None
    if not ap:
        return None
    return ap.get("plan")


async def add_tasks_from_weak_skills(session_id: str, weak_skills: list[str]) -> AddTasksResponse:
    """
    Inyecta tareas de refuerzo en fase_30 del action plan (desde mock interview).
    Modifica action_plans in-place — deuda técnica documentada en DECISIONS.
    """
    row, _ = await get_or_init_progress(session_id, create=True)
    current_week = int(row.get("current_week") or 1)

    enriched, _new_ids, total, updated_at = await action_plan_service.append_reinforcement_tasks(
        session_id, weak_skills, current_week
    )

    added_items = [
        AddedTaskItem(
            task_id=item["task_id"],
            tarea=item["tarea"],
            skill=item["skill"],
            semana=item["semana"],
        )
        for item in enriched
    ]

    return AddTasksResponse(
        added_tasks=added_items,
        updated_total_tareas=total,
        plan_updated_at=updated_at,
    )


def reset_progress_store() -> None:
    """Solo tests — limpia progreso mock en memoria."""
    _mock_progress.clear()
