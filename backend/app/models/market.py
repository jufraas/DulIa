from pydantic import BaseModel
from typing import Optional


class SectorCount(BaseModel):
    sector: str
    count: int


class MarketDashboard(BaseModel):
    """Estadísticas agregadas del mercado laboral para el termómetro."""
    total_vacantes_activas: int
    top_sectores: list[SectorCount]
    salario_promedio: Optional[int]         # null si mayoría no publica salario
    top_empresas_verdes: list[str]          # empresas con más vacantes green
    crecimiento_semanal_pct: Optional[float]
    ciudad_filtro: Optional[str]
    sector_filtro: Optional[str]
    por_modalidad: dict[str, int] = {}      # remoto | presencial | hibrido
    por_fuente: dict[str, int] = {}         # getonbrd | remotive | mock | …
