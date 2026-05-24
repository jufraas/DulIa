from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services import progress_service
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


class InitProgressRequest(BaseModel):
    session_id: str = Field(..., min_length=1)


class ToggleTaskRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    task_id: str = Field(..., min_length=1)
    completed: bool | None = None


class AddFromSkillsRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    weak_skills: list[str] = Field(default_factory=list)


@router.get("/progress/{session_id}", tags=["Progreso"])
async def get_progress(session_id: str):
    """Estado de progreso del plan 30-60-90."""
    try:
        return await progress_service.get_progress(session_id)
    except Exception as e:
        logger.error(f"GET /progress/{session_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener progreso")


@router.post("/progress/init", tags=["Progreso"])
async def init_progress(body: InitProgressRequest):
    """Inicializa progreso desde action-plan."""
    try:
        return await progress_service.init_progress(body.session_id)
    except Exception as e:
        logger.error(f"POST /progress/init: {e}")
        raise HTTPException(status_code=500, detail="Error al inicializar progreso")


@router.patch("/progress/task", tags=["Progreso"])
async def toggle_task(body: ToggleTaskRequest):
    """Marca o desmarca una tarea."""
    try:
        updated = await progress_service.toggle_task(
            body.session_id, body.task_id, body.completed
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Tarea o progreso no encontrado")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PATCH /progress/task: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar tarea")


@router.post("/progress/add-from-skills", tags=["Progreso"])
async def add_from_skills(body: AddFromSkillsRequest):
    """Agrega tareas sugeridas desde weak skills de entrevista."""
    try:
        updated = await progress_service.add_tasks_from_weak_skills(
            body.session_id, body.weak_skills
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Progreso no encontrado")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"POST /progress/add-from-skills: {e}")
        raise HTTPException(status_code=500, detail="Error al agregar tareas")
