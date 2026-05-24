from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from app.models.user_models import HasProfileResponse
from app.services import user_service
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/user/has-profile", response_model=HasProfileResponse, tags=["Usuario"])
async def has_profile(
    user_id: UUID = Query(..., description="UUID de auth.users (Supabase)"),
):
    """
    Tras login, el frontend consulta si el usuario ya completó el wizard coach.

    **Atajo MVP:** el cliente envía `user_id` en query (sin validar JWT en backend).
    Endurecer post-hackathon con middleware que decodifique el token Supabase.

    - Si hay perfil vinculado → `has_profile: true` + `session_id` + `profile_id`.
    - Si no → `has_profile: false` (200, no 404).
    """
    try:
        return await user_service.check_has_profile(str(user_id))
    except Exception as e:
        logger.error(f"Error en GET /user/has-profile user_id={user_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al consultar perfil del usuario")
