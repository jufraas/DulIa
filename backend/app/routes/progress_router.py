from fastapi import APIRouter, HTTPException, Response, status

from app.models.progress_models import (
    AddTasksFromWeakSkillsInput,
    AddTasksResponse,
    ProgressResponse,
    ToggleTaskInput,
    ToggleTaskResponse,
)
from app.services.action_plan_service import PlanNotFoundError
from app.services.progress_service import (
    ProfileNotFoundError,
    add_tasks_from_weak_skills,
    get_progress_with_stats,
    init_progress,
    toggle_task,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/progress/{session_id}", response_model=ProgressResponse, tags=["Progreso"])
async def obtener_progreso(session_id: str):
    """
    Devuelve el progreso del plan 30/60/90 para el session_id.

    Crea la fila en `plan_progress` si aún no existe (lazy init).
    Si no hay action plan, los porcentajes serán 0 y `total_tareas` = 0.
    """
    try:
        return await get_progress_with_stats(session_id)
    except ProfileNotFoundError:
        raise HTTPException(status_code=404, detail="Perfil no encontrado para session_id")
    except Exception as e:
        logger.error(f"Error en GET /progress/{session_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener progreso")


@router.post(
    "/progress/{session_id}/init",
    response_model=ProgressResponse,
    tags=["Progreso"],
    responses={
        200: {"description": "Progreso ya existía"},
        201: {"description": "Progreso creado"},
    },
)
async def inicializar_progreso(session_id: str, response: Response):
    """
    Inicializa explícitamente el registro de progreso (idempotente).

    - **201** si se creó la fila.
    - **200** si ya existía.
    """
    try:
        progress, created = await init_progress(session_id)
        if created:
            response.status_code = status.HTTP_201_CREATED
        return progress
    except HTTPException:
        raise
    except ProfileNotFoundError:
        raise HTTPException(status_code=404, detail="Perfil no encontrado para session_id")
    except Exception as e:
        logger.error(f"Error en POST /progress/{session_id}/init: {e}")
        raise HTTPException(status_code=500, detail="Error al inicializar progreso")


@router.patch("/progress/{session_id}/task", response_model=ToggleTaskResponse, tags=["Progreso"])
async def actualizar_tarea(session_id: str, body: ToggleTaskInput):
    """
    Marca o desmarca una tarea del plan.

    **Convención task_id:** `fase_30:semana_1:idx_0`
    (fase × semana del JSON × índice dentro de esa semana).
    """
    try:
        return await toggle_task(session_id, body.task_id, body.completed)
    except ProfileNotFoundError:
        raise HTTPException(status_code=404, detail="Perfil no encontrado para session_id")
    except Exception as e:
        logger.error(f"Error en PATCH /progress/{session_id}/task: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar tarea")


@router.post(
    "/progress/{session_id}/add-tasks-from-weak-skills",
    response_model=AddTasksResponse,
    tags=["Progreso"],
)
async def agregar_tareas_desde_entrevista(session_id: str, body: AddTasksFromWeakSkillsInput):
    """
    Agrega tareas de refuerzo a `fase_30` del action plan desde weak_skills de entrevista.

    Llamado desde InterviewResults cuando el usuario hace click en "Agregar a mi plan".
    """
    try:
        return await add_tasks_from_weak_skills(session_id, body.weak_skills)
    except ProfileNotFoundError:
        raise HTTPException(status_code=404, detail="Perfil no encontrado para session_id")
    except PlanNotFoundError:
        raise HTTPException(status_code=404, detail="Genera tu plan primero (action-plan)")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error en POST /progress/{session_id}/add-tasks-from-weak-skills: {e}")
        raise HTTPException(status_code=500, detail="Error al agregar tareas al plan")
