"""Consultas de usuario autenticado (perfil coach vinculado)."""

import os

from app.db.supabase import get_supabase
from app.models.user_models import HasProfileResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"

# Usuario de prueba para demo sin Supabase (USE_MOCK_DATA=true)
MOCK_USER_ID = "11111111-1111-4111-8111-111111111111"
MOCK_SESSION_ID = "a1b2c3d4-e5f6-4789-a012-3456789abcde"
MOCK_PROFILE_ID = "22222222-2222-4222-8222-222222222222"


async def check_has_profile(user_id: str) -> HasProfileResponse:
    """
    Verifica si auth.users tiene un perfil coach vinculado (profiles.user_id).
    Devuelve has_profile=false si no hay fila — no lanza 404.
    """
    if USE_MOCK:
        logger.info(f"[MOCK] has-profile user_id={user_id}")
        if str(user_id) == MOCK_USER_ID:
            return HasProfileResponse(
                has_profile=True,
                session_id=MOCK_SESSION_ID,
                profile_id=MOCK_PROFILE_ID,
            )
        return HasProfileResponse(has_profile=False, session_id=None, profile_id=None)

    supabase = get_supabase()
    res = (
        supabase.table("profiles")
        .select("id, session_id")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    rows = res.data or []

    if rows:
        row = rows[0]
        logger.info(f"has-profile OK — user_id={user_id}, profile_id={row['id']}")
        return HasProfileResponse(
            has_profile=True,
            session_id=row["session_id"],
            profile_id=str(row["id"]),
        )

    logger.info(f"has-profile sin perfil — user_id={user_id}")
    return HasProfileResponse(has_profile=False, session_id=None, profile_id=None)
