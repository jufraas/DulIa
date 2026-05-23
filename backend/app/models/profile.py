from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class OnboardingInput(BaseModel):
    """Respuestas crudas del formulario de onboarding en el frontend."""
    session_id: str
    nombre: Optional[str] = None
    edad: Optional[int] = None
    ciudad: Optional[str] = None
    departamento: Optional[str] = None
    nivel_educativo: Optional[str] = None       # bachiller | tecnico | tecnologo | universitario | posgrado
    carrera: Optional[str] = None
    experiencia_anios: Optional[float] = 0.0
    habilidades: list[str] = Field(default_factory=list)
    sectores_interes: list[str] = Field(default_factory=list)
    salario_esperado_min: Optional[int] = None
    salario_esperado_max: Optional[int] = None
    modalidad: Optional[str] = None            # presencial | remoto | hibrido | indiferente
    texto_libre: Optional[str] = None          # campo abierto para que Gemini extraiga más contexto


class ProfileOut(BaseModel):
    """Perfil estructurado devuelto al frontend tras el onboarding."""
    id: str
    session_id: str
    nombre: Optional[str]
    ciudad: Optional[str]
    nivel_educativo: Optional[str]
    carrera: Optional[str]
    experiencia_anios: float
    habilidades: list[str]
    sectores_interes: list[str]
    modalidad: Optional[str]
    created_at: datetime
