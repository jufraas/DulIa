"""Modelos Pydantic para progreso del plan 30/60/90."""

from datetime import datetime

from pydantic import BaseModel, Field


class ProgressResponse(BaseModel):
    """Estado de progreso del plan con estadísticas calculadas."""

    session_id: str
    profile_id: str
    started_at: datetime
    current_phase: int = Field(..., description="Fase activa: 30, 60 o 90")
    current_week: int = Field(..., ge=1, description="Semana activa dentro de la fase")
    completed_tasks: list[str] = Field(default_factory=list, description="IDs de tareas completadas")
    progreso_global_pct: int = Field(..., ge=0, le=100)
    progreso_fase_pct: int = Field(..., ge=0, le=100, description="Progreso en la fase actual")
    total_tareas: int = Field(..., ge=0)
    tareas_completadas: int = Field(..., ge=0)
    fases_desbloqueadas: list[int] = Field(
        default_factory=list,
        description="Fases accesibles (30 siempre; 60 si fase 30 ≥80%; 90 si fase 60 ≥80%)",
    )


class ToggleTaskInput(BaseModel):
    """Marcar o desmarcar una tarea del plan."""

    task_id: str = Field(..., min_length=3, description='ID compuesto, ej. "fase_30:semana_1:idx_0"')
    completed: bool = Field(..., description="True = completada, False = pendiente")


class ToggleTaskResponse(ProgressResponse):
    """Respuesta tras actualizar una tarea — mismo shape que ProgressResponse."""


class AddTasksFromWeakSkillsInput(BaseModel):
    """Skills débiles detectadas en mock interview para agregar al plan."""

    weak_skills: list[str] = Field(..., min_length=1, max_length=10)


class AddedTaskItem(BaseModel):
    task_id: str
    tarea: str
    skill: str
    semana: int


class AddTasksResponse(BaseModel):
    added_tasks: list[AddedTaskItem]
    updated_total_tareas: int
    plan_updated_at: datetime
