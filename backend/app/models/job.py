from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class JobOut(BaseModel):
    """Vacante devuelta al frontend, con score de compatibilidad incluido."""
    id: str
    titulo: str
    empresa: str
    ciudad: Optional[str]
    departamento: Optional[str]
    salario_min: Optional[int]
    salario_max: Optional[int]
    habilidades_requeridas: list[str]
    sector: Optional[str]
    experiencia_requerida: float
    nivel_educativo_req: Optional[str]
    modalidad: Optional[str]
    semaforo: str                           # green | yellow | red
    descripcion: Optional[str]
    publicado_at: Optional[datetime]
    url: Optional[str] = None
    repost_count: Optional[int] = None
    hires_youth: Optional[bool] = None
    # campos calculados por el backend al hacer matching
    score_compatibilidad: Optional[int] = None
    habilidades_match: list[str] = []
    habilidades_faltantes: list[str] = []


class ScoreBreakdown(BaseModel):
    """Desglose del score por componente para mostrarlo en el frontend."""
    skills: int        # 0-40
    ciudad: int        # 0-20
    experiencia: int   # 0-25
    educacion: int     # 0-15
    youth: int = 0     # 0-5 bonus si hires_youth y perfil junior


class ScoreOut(BaseModel):
    """Score de empleabilidad con recomendaciones accionables."""
    job_id: str
    profile_id: str
    score: int                          # 0-100
    breakdown: ScoreBreakdown
    recomendaciones: list[str]          # qué aprender para subir el score
