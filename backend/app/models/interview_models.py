"""Modelos Pydantic para simulador de entrevistas."""

from datetime import datetime

from pydantic import BaseModel, Field


class InterviewQuestion(BaseModel):
    """Pregunta generada o seleccionada para la entrevista."""

    idx: int = Field(..., ge=0, description="Índice 0-based en la sesión")
    texto: str
    tipo: str = Field(..., description="tecnica | behavioral | situacional")
    skill: str | None = None
    keywords_esperadas: list[str] = Field(default_factory=list)
    rubrica: dict = Field(default_factory=dict)


class InterviewStartInput(BaseModel):
    session_id: str = Field(..., min_length=1)
    target_skill: str | None = None
    target_role: str | None = None


class InterviewStartResponse(BaseModel):
    interview_id: str
    questions: list[InterviewQuestion]
    created_at: datetime


class InterviewAnswerInput(BaseModel):
    question_idx: int = Field(..., ge=0)
    answer: str = Field(..., min_length=20)


class InterviewAnswerResponse(BaseModel):
    question_idx: int
    score: int = Field(..., ge=0, le=100)
    feedback: str
    fortalezas: list[str] = Field(default_factory=list)
    areas_mejora: list[str] = Field(default_factory=list)


class InterviewFinishResponse(BaseModel):
    interview_id: str
    global_score: int = Field(..., ge=0, le=100)
    weak_skills: list[str] = Field(default_factory=list)
    feedback_general: str
    recomendacion_siguiente_paso: str


class InterviewHistoryItem(BaseModel):
    id: str
    target_skill: str | None = None
    target_role: str | None = None
    global_score: int | None = None
    created_at: datetime
    status: str
    version: int = Field(default=1, description="1=quiz lineal, 2=conversacional")
