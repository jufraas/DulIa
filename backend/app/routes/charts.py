"""Rutas Plan 2 — datos para gráficas (radar y timeline)."""

from fastapi import APIRouter, HTTPException

from app.models.charts import RadarResponse, TimelineResponse
from app.services import charts_service
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get(
    "/profile/{session_id}/radar-data",
    response_model=RadarResponse,
    tags=["Gráficas - Plan 2"],
)
async def radar_data(session_id: str):
    """
    Datos para gráfica radar: perfil vs mercado en 5 dimensiones (0-100).
    """
    try:
        result = await charts_service.obtener_radar(session_id)
        if not result:
            raise HTTPException(status_code=404, detail="Perfil no encontrado")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error radar {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al calcular datos del radar")


@router.get(
    "/profile/{session_id}/timeline-data",
    response_model=TimelineResponse,
    tags=["Gráficas - Plan 2"],
)
async def timeline_data(session_id: str):
    """
    Timeline del plan 30-60-90. Requiere plan de acción (POST .../action-plan en modo real).
    """
    try:
        result = await charts_service.obtener_timeline(session_id)
        if not result:
            raise HTTPException(status_code=404, detail="Perfil no encontrado")
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error timeline {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener datos del timeline")
