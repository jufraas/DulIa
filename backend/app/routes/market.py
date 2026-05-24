from fastapi import APIRouter, HTTPException, Query

from app.models.market import MarketDashboard
from app.services import market_service
from app.services.market_service import ProfileNotFoundError
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/market/dashboard", response_model=MarketDashboard, tags=["Mercado"])
async def market_dashboard(
    city: str | None = Query(None, description="Filtrar por ciudad (ej: Barranquilla)"),
    sector: str | None = Query(None, description="Filtrar por sector (ej: tecnología)"),
):
    """
    Termómetro del mercado laboral (global): vacantes activas, sectores top,
    salario promedio, empresas verdes y crecimiento semanal.
    """
    try:
        return await market_service.obtener_dashboard(ciudad=city, sector=sector)
    except Exception as e:
        logger.error(f"Error en GET /market/dashboard: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener dashboard de mercado")


@router.get(
    "/market/dashboard/{session_id}",
    response_model=MarketDashboard,
    tags=["Mercado"],
)
async def market_dashboard_personalizado(session_id: str):
    """
    Termómetro personalizado al perfil: alcance desde su ciudad + sectores de interés.
    Incluye top skills demandadas en su campo con flag `tienes`.
    """
    try:
        return await market_service.obtener_dashboard_para_perfil(session_id)
    except ProfileNotFoundError:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    except Exception as e:
        logger.error(f"Error en GET /market/dashboard/{session_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener dashboard de mercado")
