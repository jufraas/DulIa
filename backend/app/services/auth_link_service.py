"""Vincula un perfil anónimo del coach (session_id) a un usuario autenticado (user_id)."""

from app.db.supabase import get_supabase
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ProfileNotFoundForSessionError(Exception):
    pass


class SessionAlreadyLinkedError(Exception):
    pass


def link_session_to_user(session_id: str, user_id: str) -> dict:
    """
    Asocia profiles.user_id al perfil coach existente para ese session_id.
    Idempotente si ya está vinculado al mismo user_id.
    """
    supabase = get_supabase()

    res = (
        supabase.table("profiles")
        .select("id, user_id")
        .eq("session_id", session_id)
        .execute()
    )
    rows = res.data or []
    if not rows:
        raise ProfileNotFoundForSessionError(session_id)

    profile = rows[0]
    profile_id = profile["id"]
    existing_user_id = profile.get("user_id")

    if existing_user_id and str(existing_user_id) != str(user_id):
        raise SessionAlreadyLinkedError(
            f"session_id={session_id} ya vinculado a otro user_id"
        )

    if existing_user_id and str(existing_user_id) == str(user_id):
        logger.info(f"link-session idempotente — session_id={session_id}, user_id={user_id}")
        return {"linked": True, "profile_id": str(profile_id), "already_linked": True}

    supabase.table("profiles").update({"user_id": user_id}).eq("session_id", session_id).execute()
    logger.info(f"link-session OK — session_id={session_id}, user_id={user_id}")
    return {"linked": True, "profile_id": str(profile_id), "already_linked": False}
