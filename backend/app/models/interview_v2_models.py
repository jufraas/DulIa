"""Modelos Pydantic para entrevista conversacional V2 (B8)."""

from datetime import datetime

from pydantic import BaseModel, Field


class InterviewPersona(BaseModel):
    nombre: str
    rol_entrevistador: str
    sector: str
    estilo: str
    saludo_inicial: str


class InterviewStartV2Input(BaseModel):
    session_id: str = Field(..., min_length=1)
    target_skill: str | None = None
    target_role: str | None = None


class InterviewStartV2Response(BaseModel):
    interview_id: str
    persona: InterviewPersona
    opening_message: str
    stage: str = "rapport"
    max_turns: int = Field(default=10, ge=1)


class InterviewTurnInput(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class StageAdvance(BaseModel):
    from_stage: str
    to_stage: str
    mini_score: int = Field(..., ge=0, le=100)
    objectives_met: list[str] = Field(default_factory=list)
    gaps: list[str] = Field(default_factory=list)


class StageBreakdown(BaseModel):
    stage: str
    score: int = Field(..., ge=0, le=100)
    strengths: list[str] = Field(default_factory=list)
    gaps: list[str] = Field(default_factory=list)
    key_moments: list[str] = Field(default_factory=list)


class InterviewSummary(BaseModel):
    global_score: int = Field(..., ge=0, le=100)
    weak_skills: list[str] = Field(default_factory=list)
    stages: list[StageBreakdown] = Field(default_factory=list)
    feedback_general: str
    proximos_pasos: list[str] = Field(default_factory=list)


class InterviewTurnResponse(BaseModel):
    reply: str
    stage: str
    stage_advance: StageAdvance | None = None
    finished: bool = False
    summary: InterviewSummary | None = None
    turns_in_stage: int = Field(..., ge=0)
    total_turns: int = Field(..., ge=0)


class InterviewTurnRecord(BaseModel):
    role: str
    text: str
    stage: str
    t: datetime


class InterviewStateV2(BaseModel):
    interview_id: str
    persona: InterviewPersona
    stage: str
    turns: list[InterviewTurnRecord] = Field(default_factory=list)
    stage_state: dict = Field(default_factory=dict)
    stage_scores: dict = Field(default_factory=dict)
    summary: InterviewSummary | None = None
    status: str
    target_skill: str | None = None
    target_role: str | None = None
    target_sector: str | None = None
    created_at: datetime
    updated_at: datetime | None = None


class InterviewAbortResponse(BaseModel):
    aborted: bool = True
    interview_id: str


class InterviewHistoryItemV2(BaseModel):
    id: str
    target_skill: str | None = None
    target_role: str | None = None
    global_score: int | None = None
    created_at: datetime
    status: str
    version: int = 2
