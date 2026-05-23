from fastapi import APIRouter, HTTPException, Query

from app.models.market import MarketDashboard
from app.services import market_service
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/market/dashboard", response_model=MarketDashboard, tags=["Mercado"])
async def market_dashboard(
    city: str | None = Query(None, description="Filtrar por ciudad (ej: Barranquilla)"),
    sector: str | None = Query(None, description="Filtrar por sector (ej: tecnología)"),
):
    """
    Termómetro del mercado laboral: vacantes activas, sectores top,
    salario promedio, empresas verdes y crecimiento semanal.
    """
    try:
        return await market_service.obtener_dashboard(ciudad=city, sector=sector)
    except Exception as e:
        logger.error(f"Error en GET /market/dashboard: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener dashboard de mercado")
