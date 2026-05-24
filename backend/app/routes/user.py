import re
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.db.supabase import get_supabase
from app.services import interview_service
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

_UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    re.IGNORECASE,
)


class StartInterviewRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    skill: str = Field(..., min_length=1)
    role: str | None = None


class SubmitAnswerRequest(BaseModel):
    answer: str = Field(..., min_length=1)


class FinishInterviewRequest(BaseModel):
    user_id: str = Field(..., min_length=1)


@router.get("/user/has-profile", tags=["Usuario"])
async def has_profile(user_id: str = Query(..., min_length=1)):
    """Indica si el usuario autenticado ya tiene perfil coach vinculado."""
    if not _UUID_RE.match(user_id.strip()):
        return {"has_profile": False, "session_id": None}

    try:
        supabase = get_supabase()
        res = (
            supabase.table("profiles")
            .select("session_id")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        rows = res.data or []
        if not rows:
            return {"has_profile": False, "session_id": None}
        return {"has_profile": True, "session_id": rows[0].get("session_id")}
    except RuntimeError:
        logger.warning("has-profile: Supabase no configurado, devolviendo false")
        return {"has_profile": False, "session_id": None}
    except Exception as e:
        logger.warning(f"GET /user/has-profile: {e}")
        return {"has_profile": False, "session_id": None}


@router.post("/interview/start", tags=["Entrevista"])
async def start_interview(body: StartInterviewRequest):
    try:
        return interview_service.start_interview(body.session_id, body.skill, body.role)
    except Exception as e:
        logger.error(f"POST /interview/start: {e}")
        raise HTTPException(status_code=500, detail="Error al iniciar entrevista")


@router.post("/interview/{interview_id}/answer", tags=["Entrevista"])
async def submit_answer(interview_id: str, body: SubmitAnswerRequest):
    try:
        updated = interview_service.submit_answer(interview_id, body.answer)
        if not updated:
            raise HTTPException(status_code=404, detail="Entrevista no encontrada o finalizada")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"POST /interview/{interview_id}/answer: {e}")
        raise HTTPException(status_code=500, detail="Error al enviar respuesta")


@router.post("/interview/{interview_id}/finish", tags=["Entrevista"])
async def finish_interview(interview_id: str, body: FinishInterviewRequest):
    try:
        result = interview_service.finish_interview(interview_id, body.user_id)
        if not result:
            raise HTTPException(status_code=404, detail="Entrevista no encontrada")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"POST /interview/{interview_id}/finish: {e}")
        raise HTTPException(status_code=500, detail="Error al finalizar entrevista")


@router.get("/interview/history", tags=["Entrevista"])
async def interview_history(user_id: str = Query(..., min_length=1)):
    try:
        return interview_service.interview_history(user_id)
    except Exception as e:
        logger.error(f"GET /interview/history: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener historial")
