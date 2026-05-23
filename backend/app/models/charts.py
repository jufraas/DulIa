from pydantic import BaseModel


class RadarScores(BaseModel):
    habilidades_tecnicas: int
    experiencia: int
    educacion: int
    ubicacion_modalidad: int
    preparacion: int


class RadarData(BaseModel):
    usuario: RadarScores
    mercado_promedio: RadarScores
    descripcion_dimensiones: dict[str, str]


class RadarResponse(BaseModel):
    session_id: str
    radar: RadarData


class TimelinePhase(BaseModel):
    dia: int
    tipo: str
    titulo: str
    descripcion: str
    metricas: dict | None = None
    metricas_esperadas: dict | None = None
    acciones_completadas: list[str] | None = None


class TimelineProyeccion(BaseModel):
    descripcion: str
    tasa_crecimiento_semanal: float


class TimelineData(BaseModel):
    inicio: str
    fases: list[TimelinePhase]
    proyeccion: TimelineProyeccion


class TimelineResponse(BaseModel):
    session_id: str
    timeline: TimelineData
