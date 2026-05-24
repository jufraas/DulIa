"""Orquestador de entrevista conversacional V2 (B8.3–B8.4)."""

from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.supabase import get_supabase
from app.models.interview_v2_models import (
    InterviewAbortResponse,
    InterviewHistoryItemV2,
    InterviewPersona,
    InterviewStartV2Response,
    InterviewStateV2,
    InterviewSummary,
    InterviewTurnRecord,
    InterviewTurnResponse,
    StageAdvance,
)
from app.services import interview_service
from app.services.interview_v2.conversation import generate_opening, generate_reply
from app.services.interview_v2.evaluator import evaluate_stage, generate_final_summary
from app.services.interview_v2.persona import build_persona
from app.services.interview_v2.state_machine import (
    MAX_TOTAL_TURNS,
    can_advance,
    count_candidate_turns_in_stage,
    count_total_candidate_turns,
    next_stage,
    pool_items_for_stage,
    should_evaluate_stage,
    should_force_advance,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"
INTERVIEW_V2_ENABLED = os.getenv("INTERVIEW_V2_ENABLED", "true").lower() == "true"

_mock_interviews_v2: dict[str, dict[str, Any]] = {}


class InterviewV2DisabledError(Exception):
    pass


class ProfileNotFoundError(Exception):
    pass


class InterviewNotFoundError(Exception):
    pass


class InterviewAlreadyCompletedError(Exception):
    pass


class InterviewNotInProgressError(Exception):
    pass


class InterviewAlreadyInProgressError(Exception):
    def __init__(self, existing_interview_id: str):
        self.existing_interview_id = existing_interview_id
        super().__init__(f"Ya hay una entrevista V2 en progreso: {existing_interview_id}")


def reset_interview_v2_store() -> None:
    """Solo tests — limpia entrevistas V2 mock en memoria."""
    _mock_interviews_v2.clear()


def is_v2_enabled() -> bool:
    return INTERVIEW_V2_ENABLED


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _parse_datetime(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    return datetime.now(timezone.utc)


def _new_turn(role: str, text: str, stage: str) -> dict:
    return {"role": role, "text": text, "stage": stage, "t": _now_iso()}


async def _load_interview(interview_id: str) -> dict | None:
    if USE_MOCK:
        return _mock_interviews_v2.get(interview_id)

    supabase = get_supabase()
    res = supabase.table("mock_interviews_v2").select("*").eq("id", interview_id).execute()
    return res.data[0] if res.data else None


async def _save_interview(row: dict) -> None:
    row["updated_at"] = _now_iso()
    if USE_MOCK:
        _mock_interviews_v2[row["id"]] = row
        return

    supabase = get_supabase()
    payload = {k: v for k, v in row.items() if not k.startswith("_")}
    supabase.table("mock_interviews_v2").update(payload).eq("id", row["id"]).execute()


async def _insert_interview(row: dict) -> str:
    if USE_MOCK:
        interview_id = row.get("id") or str(uuid.uuid4())
        row["id"] = interview_id
        _mock_interviews_v2[interview_id] = row
        return interview_id

    supabase = get_supabase()
    payload = {k: v for k, v in row.items() if not k.startswith("_")}
    res = supabase.table("mock_interviews_v2").insert(payload).execute()
    return str(res.data[0]["id"])


async def _find_in_progress(session_id: str) -> dict | None:
    if USE_MOCK:
        for row in _mock_interviews_v2.values():
            if row.get("session_id") == session_id and row.get("status") == "in_progress":
                return row
        return None

    supabase = get_supabase()
    res = (
        supabase.table("mock_interviews_v2")
        .select("*")
        .eq("session_id", session_id)
        .eq("status", "in_progress")
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def _persona_from_row(row: dict) -> InterviewPersona:
    raw = row.get("persona") or {}
    if isinstance(raw, str):
        raw = json.loads(raw)
    return InterviewPersona(**raw)


def _row_to_state(row: dict) -> InterviewStateV2:
    turns_raw = row.get("turns") or []
    if isinstance(turns_raw, str):
        turns_raw = json.loads(turns_raw)

    turns = [
        InterviewTurnRecord(
            role=t["role"],
            text=t["text"],
            stage=t["stage"],
            t=_parse_datetime(t.get("t")),
        )
        for t in turns_raw
    ]

    summary = None
    if row.get("summary"):
        raw_summary = row["summary"]
        if isinstance(raw_summary, str):
            raw_summary = json.loads(raw_summary)
        summary = InterviewSummary(**raw_summary)

    return InterviewStateV2(
        interview_id=str(row["id"]),
        persona=_persona_from_row(row),
        stage=row.get("stage", "rapport"),
        turns=turns,
        stage_state=row.get("stage_state") or {},
        stage_scores=row.get("stage_scores") or {},
        summary=summary,
        status=row.get("status", "in_progress"),
        target_skill=row.get("target_skill"),
        target_role=row.get("target_role"),
        target_sector=row.get("target_sector"),
        created_at=_parse_datetime(row.get("created_at")),
        updated_at=_parse_datetime(row.get("updated_at")) if row.get("updated_at") else None,
    )


async def iniciar_entrevista_v2(
    session_id: str,
    target_skill: str | None,
    target_role: str | None,
) -> InterviewStartV2Response:
    if not INTERVIEW_V2_ENABLED:
        raise InterviewV2DisabledError("Entrevista V2 deshabilitada")

    perfil = await interview_service.cargar_perfil_por_session(session_id)
    if not perfil:
        raise ProfileNotFoundError(session_id)

    existing = await _find_in_progress(session_id)
    if existing:
        raise InterviewAlreadyInProgressError(str(existing["id"]))

    sector = interview_service.determinar_sector(perfil, target_role)
    persona = build_persona(sector, target_role, perfil, target_skill)
    pool_snapshot = await interview_service.seleccionar_preguntas_pool(
        sector, target_skill, limit=8
    )
    opening = await generate_opening(persona)
    now = _now_iso()
    interview_id = str(uuid.uuid4())

    row = {
        "id": interview_id,
        "profile_id": str(perfil["id"]),
        "user_id": perfil.get("user_id"),
        "session_id": session_id,
        "target_skill": target_skill,
        "target_role": target_role,
        "target_sector": sector,
        "persona": persona.model_dump(),
        "stage": "rapport",
        "stage_state": {"turns_in_stage": 0, "objectives_met": [], "gaps": []},
        "turns": [_new_turn("interviewer", opening, "rapport")],
        "pool_snapshot": pool_snapshot,
        "stage_scores": {},
        "status": "in_progress",
        "version": 2,
        "created_at": now,
        "updated_at": now,
    }

    interview_id = await _insert_interview(row)
    logger.info(f"Entrevista V2 iniciada id={interview_id} session={session_id} sector={sector}")

    return InterviewStartV2Response(
        interview_id=interview_id,
        persona=persona,
        opening_message=opening,
        stage="rapport",
        max_turns=MAX_TOTAL_TURNS,
    )


async def procesar_turno(interview_id: str, message: str) -> InterviewTurnResponse:
    if not INTERVIEW_V2_ENABLED:
        raise InterviewV2DisabledError("Entrevista V2 deshabilitada")

    row = await _load_interview(interview_id)
    if not row:
        raise InterviewNotFoundError(interview_id)

    if row.get("status") != "in_progress":
        raise InterviewAlreadyCompletedError("Entrevista ya finalizada o abortada")

    stage = row.get("stage", "rapport")
    if stage == "finalizada":
        raise InterviewAlreadyCompletedError("Entrevista ya finalizada")

    turns: list[dict] = list(row.get("turns") or [])
    turns.append(_new_turn("candidate", message, stage))
    row["turns"] = turns

    persona = _persona_from_row(row)
    target_skill = row.get("target_skill")
    pool_snapshot: list[dict] = row.get("pool_snapshot") or []
    stage_advance: StageAdvance | None = None
    summary: InterviewSummary | None = None
    finished = False
    reply = ""

    total_turns = count_total_candidate_turns(turns)
    turns_in_stage = count_candidate_turns_in_stage(turns, stage)

    logger.info(
        "interview_v2 turn",
        extra={
            "interview_id": interview_id,
            "stage": stage,
            "turns_in_stage": turns_in_stage,
            "total_turns": total_turns,
        },
    )

    if total_turns >= MAX_TOTAL_TURNS and stage != "cierre":
        # Forzar avance hacia cierre si se agotaron turnos globales
        pass

    eval_result = None
    pool_items = pool_items_for_stage(pool_snapshot, stage, target_skill)

    if should_evaluate_stage(stage, turns_in_stage):
        eval_result = await evaluate_stage(stage, turns, pool_items, target_skill)

    advance = False
    if eval_result and can_advance(stage, eval_result, turns_in_stage):
        advance = True
    elif should_force_advance(stage, turns_in_stage):
        if not eval_result:
            eval_result = await evaluate_stage(stage, turns, pool_items, target_skill)
        advance = True
    elif total_turns >= MAX_TOTAL_TURNS and stage != "finalizada":
        if not eval_result:
            eval_result = await evaluate_stage(stage, turns, pool_items, target_skill)
        advance = True

    if advance and eval_result:
        stage_scores = dict(row.get("stage_scores") or {})
        stage_scores[stage] = eval_result.mini_score
        row["stage_scores"] = stage_scores

        nxt = next_stage(stage)
        if nxt:
            stage_advance = StageAdvance(
                from_stage=stage,
                to_stage=nxt,
                mini_score=eval_result.mini_score,
                objectives_met=eval_result.objectives_met,
                gaps=eval_result.gaps,
            )

            if nxt == "finalizada":
                row["stage"] = "finalizada"
                summary = await generate_final_summary(row)
                row["summary"] = summary.model_dump()
                row["global_score"] = summary.global_score
                row["weak_skills"] = summary.weak_skills
                row["status"] = "completed"
                row["completed_at"] = _now_iso()
                finished = True
                reply = (
                    "Gracias por tu tiempo y por compartir tu experiencia conmigo. "
                    "Te dejo un resumen con lo que conversamos y próximos pasos para seguir preparándote."
                )
                turns.append(_new_turn("interviewer", reply, "finalizada"))
                row["turns"] = turns
            else:
                row["stage"] = nxt
                reply = await generate_reply(row, message, persona, new_stage=nxt)
                turns.append(_new_turn("interviewer", reply, nxt))
                row["turns"] = turns
                row["stage_state"] = {"turns_in_stage": 0, "objectives_met": [], "gaps": []}
        else:
            reply = await generate_reply(row, message, persona)
            turns.append(_new_turn("interviewer", reply, stage))
            row["turns"] = turns
    else:
        reply = await generate_reply(row, message, persona)
        turns.append(_new_turn("interviewer", reply, stage))
        row["turns"] = turns

    await _save_interview(row)

    current_stage = row.get("stage", stage)
    turns_in_stage_final = count_candidate_turns_in_stage(row["turns"], current_stage)
    total_candidate = count_total_candidate_turns(row["turns"])

    return InterviewTurnResponse(
        reply=reply,
        stage=current_stage,
        stage_advance=stage_advance,
        finished=finished,
        summary=summary,
        turns_in_stage=turns_in_stage_final,
        total_turns=total_candidate,
    )


async def abortar_entrevista(interview_id: str) -> InterviewAbortResponse:
    row = await _load_interview(interview_id)
    if not row:
        raise InterviewNotFoundError(interview_id)

    if row.get("status") != "in_progress":
        raise InterviewNotInProgressError("La entrevista no está en progreso")

    row["status"] = "aborted"
    row["completed_at"] = _now_iso()
    await _save_interview(row)
    logger.info(f"Entrevista V2 abortada id={interview_id}")
    return InterviewAbortResponse(interview_id=interview_id)


async def obtener_estado(interview_id: str) -> InterviewStateV2:
    row = await _load_interview(interview_id)
    if not row:
        raise InterviewNotFoundError(interview_id)
    return _row_to_state(row)


async def historial_v2(session_id: str) -> list[InterviewHistoryItemV2]:
    if USE_MOCK:
        rows = [
            r for r in _mock_interviews_v2.values()
            if r.get("session_id") == session_id
        ]
        rows.sort(key=lambda r: r.get("created_at", ""), reverse=True)
        rows = rows[:10]
    else:
        supabase = get_supabase()
        res = (
            supabase.table("mock_interviews_v2")
            .select("id, target_skill, target_role, global_score, created_at, status")
            .eq("session_id", session_id)
            .order("created_at", desc=True)
            .limit(10)
            .execute()
        )
        rows = res.data or []

    items: list[InterviewHistoryItemV2] = []
    for row in rows:
        items.append(
            InterviewHistoryItemV2(
                id=str(row["id"]),
                target_skill=row.get("target_skill"),
                target_role=row.get("target_role"),
                global_score=row.get("global_score"),
                created_at=_parse_datetime(row.get("created_at")),
                status=row.get("status", "in_progress"),
                version=2,
            )
        )
    return items
