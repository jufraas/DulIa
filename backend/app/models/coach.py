from pydantic import BaseModel, Field
from typing import Optional


class HistorialTurno(BaseModel):
    """Un turno previo del chat coach (para continuidad conversacional)."""
    role: str = Field(..., description="'usuario' o 'coach'")
    texto: str


class ChatMessage(BaseModel):
    """Mensaje del usuario al coach conversacional."""
    session_id: str
    mensaje: str
    historial: list[HistorialTurno] = Field(default_factory=list)


class ChatResponse(BaseModel):
    """Respuesta del coach con sugerencias de acción rápida."""
    respuesta: str
    sugerencias_rapidas: list[str] = []
    funcion_ejecutada: Optional[str] = None
    datos_funcion: Optional[dict] = None
    acciones_disponibles: list[str] = []


class ErrorResponse(BaseModel):
    """Formato estándar de errores de la API."""
    detail: str
    code: Optional[str] = None
