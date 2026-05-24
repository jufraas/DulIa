from pydantic import BaseModel
from typing import Optional


class ChatMessage(BaseModel):
    """Mensaje del usuario al coach conversacional."""
    session_id: str
    mensaje: str


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
