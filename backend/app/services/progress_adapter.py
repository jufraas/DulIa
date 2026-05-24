"""Adaptador entre contrato público M3 (frontend) y modelo interno B3 (Supabase)."""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Optional

from app.models.progress_models import ProgressResponse
from app.services.progress_service import UNLOCK_THRESHOLD_PCT

_PHASE_DEFAULT_WEEK = {"30": 1, "60": 5, "90": 9}


@dataclass(frozen=True)
class TaskCatalogEntry:
    m3_id: str
    b3_id: str
    label: str
    phase: str
    week: int


def _slug(label: str) -> str:
    normalized = unicodedata.normalize("NFD", label.lower())
    stripped = "".join(c for c in normalized if unicodedata.category(c) != "Mn")
    slug = re.sub(r"[^a-z0-9]+", "-", stripped).strip("-")
    return slug[:40] or "task"


def build_m3_task_id(phase: str, index: int, label: str) -> str:
    return f"p{phase}-t{index}-{_slug(label)}"


def _flat_index_to_b3_id(plan_data: dict, phase: int, flat_index: int) -> str | None:
    fase_obj = plan_data.get(f"fase_{phase}") or {}
    acciones = fase_obj.get("acciones") or []
    if flat_index < 0 or flat_index >= len(acciones):
        return None

    phase_str = str(phase)
    default_week = _PHASE_DEFAULT_WEEK[phase_str]
    acc = acciones[flat_index]
    semana = int(acc.get("semana") or default_week)
    idx_in_week = sum(
        1
        for j, item in enumerate(acciones[:flat_index])
        if int(item.get("semana") or default_week) == semana
    )
    return f"fase_{phase}:semana_{semana}:idx_{idx_in_week}"


def build_task_catalog(plan_data: dict | None) -> list[TaskCatalogEntry]:
    """Genera catálogo bidireccional M3 ↔ B3 desde el JSON del action plan."""
    if not plan_data:
        return []

    catalog: list[TaskCatalogEntry] = []

    for phase in ("30", "60", "90"):
        fase_obj = plan_data.get(f"fase_{phase}") or {}
        default_week = _PHASE_DEFAULT_WEEK[phase]
        for i, item in enumerate(fase_obj.get("acciones") or []):
            label = str(item.get("tarea") or "").strip()
            if not label:
                continue
            week = int(item.get("semana") or default_week)
            b3_id = _flat_index_to_b3_id(plan_data, int(phase), i)
            if not b3_id:
                continue
            catalog.append(
                TaskCatalogEntry(
                    m3_id=build_m3_task_id(phase, i, label),
                    b3_id=b3_id,
                    label=label,
                    phase=phase,
                    week=week if phase == "30" else default_week,
                )
            )

    return catalog


def m3_id_to_b3_id(catalog: list[TaskCatalogEntry], m3_id: str) -> str | None:
    for entry in catalog:
        if entry.m3_id == m3_id:
            return entry.b3_id
    return None


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
        locked = (phase == "60" and p30 < UNLOCK_THRESHOLD_PCT) or (
            phase == "90" and p60 < UNLOCK_THRESHOLD_PCT
        )
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


def build_m3_tasks(
    catalog: list[TaskCatalogEntry],
    completed_b3: set[str],
    *,
    updated_at: datetime | None = None,
) -> list[dict]:
    completed_iso = updated_at.isoformat() if updated_at else datetime.now(timezone.utc).isoformat()
    tasks: list[dict] = []
    for entry in catalog:
        done = entry.b3_id in completed_b3
        tasks.append(
            {
                "id": entry.m3_id,
                "label": entry.label,
                "phase": entry.phase,
                "week": entry.week,
                "completed": done,
                "completed_at": completed_iso if done else None,
            }
        )
    return tasks


def progress_response_to_m3(
    session_id: str,
    plan_wrapper: dict,
    stats: ProgressResponse,
) -> dict[str, Any]:
    """Convierte ProgressResponse (B3) al shape público M3."""
    plan_data = plan_wrapper.get("plan") if isinstance(plan_wrapper.get("plan"), dict) else plan_wrapper
    catalog = build_task_catalog(plan_data)
    completed_b3 = set(stats.completed_tasks)
    tasks = build_m3_tasks(catalog, completed_b3, updated_at=stats.started_at)

    return {
        "session_id": session_id,
        "current_day": 12,
        "global_pct": global_completion_pct(tasks),
        "active_phase": resolve_active_phase(tasks),
        "tasks": tasks,
        "phases": build_phase_progress(tasks),
        "next_milestone": _next_milestone(plan_data or {}),
        "unlock_threshold_pct": UNLOCK_THRESHOLD_PCT,
    }
