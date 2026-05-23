from pydantic import BaseModel
from typing import Optional


class ChatMessage(BaseModel):
    """Mensaje del usuario al coach conversacional."""
    session_id: str
    mensaje: str


class ChatResponse(BaseModel):
    """Respuesta del coach con sugerencias de acción rápida.
    
    Plan 2: Incluye campos para function calling.
    """
    respuesta: str
    sugerencias_rapidas: list[str] = []
    # Plan 2: Function calling
    acciones_disponibles: list[str] = []  # Botones que puede mostrar el frontend
    funcion_ejecutada: Optional[str] = None  # Nombre de la función que usó
    datos_funcion: Optional[dict] = None  # Datos devueltos por la función


class ErrorResponse(BaseModel):
    """Formato estándar de errores de la API."""
    detail: str
    code: Optional[str] = None
