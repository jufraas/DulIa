from fastapi import APIRouter, HTTPException, Request

from app.models.coach import ChatMessage, ChatResponse
from app.services import coach_service
from app.services.coach_service import PerfilNoEncontradoError
from app.utils.logger import get_logger
from app.utils.limiter import limiter, GEMINI_RATE_LIMIT

logger = get_logger(__name__)
router = APIRouter()


@router.post("/coach/chat", response_model=ChatResponse, tags=["Coach"])
@limiter.limit(GEMINI_RATE_LIMIT)
async def coach_chat(request: Request, data: ChatMessage):
    """
    Coach conversacional con contexto del perfil del usuario.
    Requiere haber completado el onboarding (POST /api/profile) en modo real.
    """
    try:
        return await coach_service.responder_chat(data)
    except PerfilNoEncontradoError:
        raise HTTPException(
            status_code=404,
            detail="Perfil no encontrado. Completa el onboarding primero.",
        )
    except Exception as e:
        logger.error(f"Error en POST /coach/chat: {e}")
        raise HTTPException(status_code=500, detail="Error al procesar el mensaje del coach")
