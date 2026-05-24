"""Evaluación por etapa y resumen final (B8.3)."""

from __future__ import annotations

import json
import os
from typing import Any

from app.db.gemini import get_gemini_model
from app.models.interview_v2_models import InterviewSummary, StageBreakdown
from app.services.interview_v2.state_machine import (
    STAGE_WEIGHTS,
    StageEvalResult,
    compute_global_score,
)
from app.utils.llm_json import parse_json_from_llm
from app.utils.logger import get_logger
from app.utils.prompts import get_prompt

logger = get_logger(__name__)
USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"

RAPPORT_OBJECTIVES = {
    "se_presenta_con_contexto": ("present", "soy", "estudi", "trabaj", "experiencia", "años"),
    "expresa_motivacion": ("motiv", "interes", "busco", "quiero", "aplic", "oportunidad", "crecer"),
}

BEHAVIORAL_STAR_HINTS = ("situación", "situacion", "tarea", "acción", "accion", "resultado", "porque", "cuando")


def _turns_text(turns: list[dict], stage: str) -> str:
    lines = []
    for t in turns:
        if t.get("stage") != stage:
            continue
        role = "Entrevistador" if t.get("role") == "interviewer" else "Candidato"
        lines.append(f"{role}: {t.get('text', '')}")
    return "\n".join(lines)


def _keywords_from_pool(pool_items: list[dict]) -> list[str]:
    keywords: list[str] = []
    for item in pool_items:
        rubrica = item.get("rubrica") or {}
        keywords.extend(rubrica.get("keywords_clave") or [])
    return keywords[:10]


def _heuristic_stage_score(stage: str, candidate_texts: list[str], pool_items: list[dict]) -> StageEvalResult:
    combined = " ".join(candidate_texts).lower()
    length_score = min(100, 40 + len(combined) // 5)

    objectives_met: list[str] = []
    gaps: list[str] = []
    strengths: list[str] = []
    key_moments = [t[:120] for t in candidate_texts if t.strip()][:2]

    if stage == "rapport":
        for obj_id, hints in RAPPORT_OBJECTIVES.items():
            if any(h in combined for h in hints):
                objectives_met.append(obj_id)
        if "se_presenta_con_contexto" not in objectives_met:
            gaps.append("falta_contexto_personal")
        if "expresa_motivacion" not in objectives_met:
            gaps.append("motivacion_poco_clara")
        mini_score = 55 + len(objectives_met) * 15
    elif stage == "behavioral":
        star_hits = sum(1 for h in BEHAVIORAL_STAR_HINTS if h in combined)
        if star_hits >= 3:
            objectives_met.append("estructura_star")
            strengths.append("Respuesta con estructura STAR")
            mini_score = 72 + min(20, star_hits * 3)
        else:
            gaps.append("falta_estructura_star")
            mini_score = max(45, length_score)
    elif stage == "tecnica":
        keywords = _keywords_from_pool(pool_items)
        hits = sum(1 for kw in keywords if kw.lower() in combined)
        if hits >= 2:
            objectives_met.append("conocimiento_tecnico")
            strengths.append("Menciona conceptos clave del área")
            mini_score = 65 + min(25, hits * 5)
        elif hits == 1:
            mini_score = 58
            gaps.append("profundidad_tecnica_limitada")
        else:
            mini_score = max(40, length_score - 10)
            gaps.append("pocos_conceptos_tecnicos")
    else:  # cierre
        if "?" in combined or any(w in combined for w in ("pregunta", "duda", "interes", "gracias")):
            objectives_met.append("interes_genuino")
            mini_score = 80
        else:
            mini_score = 65
            gaps.append("cierre_poco_enganchado")

    mini_score = max(0, min(100, mini_score))
    return StageEvalResult(
        mini_score=mini_score,
        objectives_met=objectives_met,
        gaps=gaps,
        strengths=strengths or ["Participación activa"],
        key_moments=key_moments,
    )


async def evaluate_stage(
    stage: str,
    turns: list[dict],
    pool_items: list[dict],
    target_skill: str | None,
) -> StageEvalResult:
    candidate_texts = [
        t.get("text", "")
        for t in turns
        if t.get("role") == "candidate" and t.get("stage") == stage
    ]

    if USE_MOCK or not candidate_texts:
        return _heuristic_stage_score(stage, candidate_texts, pool_items)

    try:
        prompt_tpl = get_prompt("INTERVIEW_V2_STAGE_EVAL")
        prompt = (
            prompt_tpl.replace("{stage}", stage)
            .replace("{target_skill}", str(target_skill or "habilidades del perfil"))
            .replace("{conversacion_etapa}", _turns_text(turns, stage))
            .replace("{pool_rubricas}", json.dumps(pool_items, ensure_ascii=False))
        )
        model = get_gemini_model()
        response = model.generate_content(prompt)
        data = parse_json_from_llm((response.text or "").strip())
        mini_score = max(0, min(100, int(data.get("mini_score", 60))))
        return StageEvalResult(
            mini_score=mini_score,
            objectives_met=list(data.get("objectives_met") or []),
            gaps=list(data.get("gaps") or []),
            strengths=list(data.get("strengths") or []),
            key_moments=list(data.get("key_moments") or candidate_texts[:2]),
        )
    except Exception as e:
        logger.error(f"evaluate_stage Gemini fallback: {e}")
        return _heuristic_stage_score(stage, candidate_texts, pool_items)


def _weak_skills_from_stages(breakdowns: list[StageBreakdown], target_skill: str | None) -> list[str]:
    weak: list[str] = []
    for bd in breakdowns:
        if bd.score < 60:
            for gap in bd.gaps:
                if gap not in weak:
                    weak.append(gap)
    if target_skill and any(b.stage == "tecnica" and b.score < 65 for b in breakdowns):
        if target_skill not in weak:
            weak.insert(0, target_skill)
    return weak[:5]


def _mock_summary(
    stage_scores: dict[str, int],
    breakdowns: list[StageBreakdown],
    target_skill: str | None,
    persona_nombre: str,
) -> InterviewSummary:
    global_score = compute_global_score(stage_scores)
    weak = _weak_skills_from_stages(breakdowns, target_skill)
    skill_hint = target_skill or "comunicación en entrevista"
    return InterviewSummary(
        global_score=global_score,
        weak_skills=weak,
        stages=breakdowns,
        feedback_general=(
            f"Completaste la entrevista con {persona_nombre} con {global_score}/100. "
            "Se nota actitud y disposición; refuerza las áreas señaladas con práctica guiada esta semana."
        ),
        proximos_pasos=[
            f"Practica 30 minutos diarios reforzando {skill_hint}",
            "Prepara 2 historias STAR con situación, acción y resultado medible",
            "Simula repreguntas técnicas explicando un proyecto propio en voz alta",
        ],
    )


async def generate_final_summary(state: dict[str, Any]) -> InterviewSummary:
    stage_scores: dict[str, int] = state.get("stage_scores") or {}
    breakdowns: list[StageBreakdown] = []
    turns: list[dict] = state.get("turns") or []
    pool_snapshot: list[dict] = state.get("pool_snapshot") or []
    target_skill = state.get("target_skill")
    persona = state.get("persona") or {}
    persona_nombre = persona.get("nombre", "tu entrevistador")

    for stage in ("rapport", "tecnica", "behavioral", "cierre"):
        score = stage_scores.get(stage)
        if score is None:
            pool_items = [
                p for p in pool_snapshot
                if p.get("tipo") in {"tecnica", "behavioral", "situacional"}
            ][:3]
            eval_result = await evaluate_stage(stage, turns, pool_items, target_skill)
            score = eval_result.mini_score
            stage_scores[stage] = score
        else:
            eval_result = await evaluate_stage(
                stage,
                turns,
                pool_snapshot,
                target_skill,
            )

        breakdowns.append(
            StageBreakdown(
                stage=stage,
                score=score,
                strengths=eval_result.strengths,
                gaps=eval_result.gaps,
                key_moments=eval_result.key_moments,
            )
        )

    state["stage_scores"] = stage_scores

    if USE_MOCK:
        return _mock_summary(stage_scores, breakdowns, target_skill, persona_nombre)

    try:
        prompt_tpl = get_prompt("INTERVIEW_V2_FINAL_SUMMARY")
        prompt = (
            prompt_tpl.replace("{persona_nombre}", persona_nombre)
            .replace("{target_skill}", str(target_skill or "N/A"))
            .replace("{target_role}", str(state.get("target_role") or "N/A"))
            .replace("{stage_scores}", json.dumps(stage_scores, ensure_ascii=False))
            .replace("{conversacion_completa}", json.dumps(turns[-20:], ensure_ascii=False))
        )
        model = get_gemini_model()
        response = model.generate_content(prompt)
        data = parse_json_from_llm((response.text or "").strip())

        stages_raw = data.get("stages") or []
        if stages_raw:
            breakdowns = [
                StageBreakdown(
                    stage=s.get("stage", ""),
                    score=max(0, min(100, int(s.get("score", 0)))),
                    strengths=list(s.get("strengths") or []),
                    gaps=list(s.get("gaps") or []),
                    key_moments=list(s.get("key_moments") or []),
                )
                for s in stages_raw
            ]

        global_score = max(0, min(100, int(data.get("global_score", compute_global_score(stage_scores)))))
        return InterviewSummary(
            global_score=global_score,
            weak_skills=list(data.get("weak_skills") or _weak_skills_from_stages(breakdowns, target_skill)),
            stages=breakdowns,
            feedback_general=str(data.get("feedback_general") or ""),
            proximos_pasos=list(data.get("proximos_pasos") or []),
        )
    except Exception as e:
        logger.error(f"generate_final_summary Gemini fallback: {e}")
        return _mock_summary(stage_scores, breakdowns, target_skill, persona_nombre)
