"""Máquina de estados de la entrevista conversacional V2 (B8.3)."""

from __future__ import annotations

from dataclasses import dataclass

STAGE_ORDER = ("rapport", "tecnica", "behavioral", "cierre", "finalizada")

STAGE_CONFIG: dict[str, dict] = {
    "rapport": {
        "min_turns": 2,
        "max_turns": 3,
        "min_objectives": 2,
        "min_score": None,
    },
    "tecnica": {
        "min_turns": 3,
        "max_turns": 5,
        "min_objectives": None,
        "min_score": 60,
    },
    "behavioral": {
        "min_turns": 2,
        "max_turns": 4,
        "min_objectives": None,
        "min_score": 55,
    },
    "cierre": {
        "min_turns": 1,
        "max_turns": 2,
        "min_objectives": None,
        "min_score": None,
    },
}

STAGE_WEIGHTS: dict[str, float] = {
    "rapport": 0.15,
    "tecnica": 0.45,
    "behavioral": 0.30,
    "cierre": 0.10,
}

MAX_TOTAL_TURNS = 10


@dataclass
class StageEvalResult:
    mini_score: int
    objectives_met: list[str]
    gaps: list[str]
    strengths: list[str]
    key_moments: list[str]


def count_candidate_turns_in_stage(turns: list[dict], stage: str) -> int:
    return sum(
        1
        for t in turns
        if t.get("role") == "candidate" and t.get("stage") == stage
    )


def count_total_candidate_turns(turns: list[dict]) -> int:
    return sum(1 for t in turns if t.get("role") == "candidate")


def next_stage(current: str) -> str | None:
    try:
        idx = STAGE_ORDER.index(current)
    except ValueError:
        return None
    if idx + 1 < len(STAGE_ORDER):
        return STAGE_ORDER[idx + 1]
    return None


def should_evaluate_stage(stage: str, turns_in_stage: int) -> bool:
    if stage not in STAGE_CONFIG or stage == "finalizada":
        return False
    return turns_in_stage >= STAGE_CONFIG[stage]["min_turns"]


def should_force_advance(stage: str, turns_in_stage: int) -> bool:
    if stage not in STAGE_CONFIG:
        return False
    return turns_in_stage >= STAGE_CONFIG[stage]["max_turns"]


def can_advance(stage: str, eval_result: StageEvalResult, turns_in_stage: int) -> bool:
    """Determina si la etapa actual puede cerrarse y avanzar."""
    if stage == "cierre":
        return turns_in_stage >= STAGE_CONFIG["cierre"]["min_turns"]

    if should_force_advance(stage, turns_in_stage):
        return True

    cfg = STAGE_CONFIG.get(stage, {})
    min_objectives = cfg.get("min_objectives")
    if min_objectives is not None:
        return len(eval_result.objectives_met) >= min_objectives

    min_score = cfg.get("min_score")
    if min_score is not None:
        return eval_result.mini_score >= min_score

    return False


def compute_global_score(stage_scores: dict[str, int]) -> int:
    total = 0.0
    weight_sum = 0.0
    for stage, weight in STAGE_WEIGHTS.items():
        if stage in stage_scores:
            total += stage_scores[stage] * weight
            weight_sum += weight
    if weight_sum == 0:
        return 0
    return int(round(total / weight_sum))


def pool_items_for_stage(pool_snapshot: list[dict], stage: str, target_skill: str | None) -> list[dict]:
    """Filtra preguntas del pool relevantes para la etapa actual."""
    if stage == "tecnica":
        tipo_filter = {"tecnica", "situacional"}
    elif stage == "behavioral":
        tipo_filter = {"behavioral", "situacional"}
    else:
        tipo_filter = {"behavioral", "tecnica", "situacional"}

    filtered = [p for p in pool_snapshot if p.get("tipo") in tipo_filter]
    if target_skill and stage == "tecnica":
        skill_lower = target_skill.lower()
        skill_match = [
            p for p in filtered
            if p.get("skill") and skill_lower in str(p.get("skill")).lower()
        ]
        if skill_match:
            filtered = skill_match

    return filtered[:3]
