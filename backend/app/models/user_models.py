"""Modelos Pydantic para endpoints de usuario (post-login)."""

from pydantic import BaseModel, Field


class HasProfileResponse(BaseModel):
    """Indica si el usuario autenticado ya tiene perfil coach vinculado."""

    has_profile: bool = Field(..., description="True si existe profiles con ese user_id")
    session_id: str | None = Field(None, description="session_id del perfil coach, si existe")
    profile_id: str | None = Field(None, description="UUID del perfil coach, si existe")
