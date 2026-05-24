from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.auth_link_service import (
    ProfileNotFoundForSessionError,
    SessionAlreadyLinkedError,
    link_session_to_user,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


class LinkSessionRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    user_id: str = Field(..., min_length=1)


class LinkSessionResponse(BaseModel):
    linked: bool
    profile_id: str
    already_linked: bool = False


@router.post("/auth/link-session", response_model=LinkSessionResponse, tags=["Auth"])
async def link_session(body: LinkSessionRequest):
    """
    Vincula el perfil coach anónimo (session_id) al usuario autenticado (user_id).
    Best-effort tras login/registro en el frontend.
    """
    try:
        result = link_session_to_user(body.session_id, body.user_id)
        return LinkSessionResponse(**result)
    except ProfileNotFoundForSessionError:
        raise HTTPException(status_code=404, detail="Perfil coach no encontrado para session_id")
    except SessionAlreadyLinkedError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        logger.error(f"Error en POST /auth/link-session: {e}")
        raise HTTPException(status_code=500, detail="Error al vincular sesión")
