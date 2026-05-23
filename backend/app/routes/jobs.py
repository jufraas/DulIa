from fastapi import APIRouter, HTTPException
from app.models.job import JobOut
from app.services import jobs_service
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/jobs/recommended/{session_id}", response_model=list[JobOut], tags=["Vacantes"])
async def jobs_recomendadas(session_id: str):
    """
    Devuelve hasta 20 vacantes ordenadas por score de compatibilidad
    con el perfil del usuario. Excluye vacantes rojas (🔴 fantasmas).
    """
    try:
        jobs = await jobs_service.recomendar_jobs(session_id)
        return jobs
    except Exception as e:
        logger.error(f"Error en GET /jobs/recommended/{session_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al calcular vacantes recomendadas")
