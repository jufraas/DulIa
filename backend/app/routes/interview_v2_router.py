"""Endpoints REST entrevista conversacional V2 (B8.4)."""

from fastapi import APIRouter, HTTPException, Request

from app.models.interview_v2_models import (
    InterviewAbortResponse,
    InterviewHistoryItemV2,
    InterviewStartV2Input,
    InterviewStartV2Response,
    InterviewStateV2,
    InterviewTurnInput,
    InterviewTurnResponse,
)
from app.services.interview_v2 import service as interview_v2_service
from app.services.interview_v2.service import (
    InterviewAlreadyCompletedError,
    InterviewAlreadyInProgressError,
    InterviewNotFoundError,
    InterviewNotInProgressError,
    InterviewV2DisabledError,
    ProfileNotFoundError,
)
from app.utils.logger import get_logger
from app.utils.limiter import INTERVIEW_START_LIMIT, INTERVIEW_V2_TURN_LIMIT, limiter

logger = get_logger(__name__)
router = APIRouter()


def _ensure_v2_enabled() -> None:
    if not interview_v2_service.is_v2_enabled():
        raise HTTPException(status_code=503, detail="Entrevista V2 deshabilitada")


@router.post(
    "/interview/v2/start",
    response_model=InterviewStartV2Response,
    tags=["Mock Interview V2"],
)
@limiter.limit(INTERVIEW_START_LIMIT)
async def start_interview_v2(request: Request, body: InterviewStartV2Input):
    """
    Inicia entrevista conversacional: persona IA + saludo inicial (etapa rapport).

    Rate limit: **5 req/min** por IP.
    """
    _ensure_v2_enabled()
    try:
        return await interview_v2_service.iniciar_entrevista_v2(
            body.session_id,
            body.target_skill,
            body.target_role,
        )
    except ProfileNotFoundError:
        raise HTTPException(status_code=404, detail="Perfil no encontrado para session_id")
    except InterviewAlreadyInProgressError as e:
        raise HTTPException(
            status_code=409,
            detail={"message": str(e), "existing_interview_id": e.existing_interview_id},
        )
    except InterviewV2DisabledError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Error en POST /interview/v2/start: {e}")
        raise HTTPException(status_code=500, detail="Error al iniciar entrevista V2")


@router.post(
    "/interview/v2/{interview_id}/turn",
    response_model=InterviewTurnResponse,
    tags=["Mock Interview V2"],
)
@limiter.limit(INTERVIEW_V2_TURN_LIMIT)
async def interview_turn_v2(
    request: Request,
    interview_id: str,
    body: InterviewTurnInput,
):
    """
    Envía un mensaje del candidato y recibe la respuesta del entrevistador IA.

    Rate limit: **15 req/min** por IP.
    """
    _ensure_v2_enabled()
    try:
        return await interview_v2_service.procesar_turno(interview_id, body.message)
    except InterviewNotFoundError:
        raise HTTPException(status_code=404, detail="Entrevista no encontrada")
    except InterviewAlreadyCompletedError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except InterviewV2DisabledError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Error en POST /interview/v2/{interview_id}/turn: {e}")
        raise HTTPException(status_code=500, detail="Error al procesar turno V2")


@router.post(
    "/interview/v2/{interview_id}/abort",
    response_model=InterviewAbortResponse,
    tags=["Mock Interview V2"],
)
async def abort_interview_v2(interview_id: str):
    """Cierra la entrevista sin generar resumen ni score."""
    _ensure_v2_enabled()
    try:
        return await interview_v2_service.abortar_entrevista(interview_id)
    except InterviewNotFoundError:
        raise HTTPException(status_code=404, detail="Entrevista no encontrada")
    except InterviewNotInProgressError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        logger.error(f"Error en POST /interview/v2/{interview_id}/abort: {e}")
        raise HTTPException(status_code=500, detail="Error al abortar entrevista V2")


@router.get(
    "/interview/v2/{interview_id}",
    response_model=InterviewStateV2,
    tags=["Mock Interview V2"],
)
async def get_interview_v2_state(interview_id: str):
    """Estado completo de la entrevista (reanudar tras refresh)."""
    _ensure_v2_enabled()
    try:
        return await interview_v2_service.obtener_estado(interview_id)
    except InterviewNotFoundError:
        raise HTTPException(status_code=404, detail="Entrevista no encontrada")
    except Exception as e:
        logger.error(f"Error en GET /interview/v2/{interview_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener estado V2")


@router.get(
    "/interview/v2/history/{session_id}",
    response_model=list[InterviewHistoryItemV2],
    tags=["Mock Interview V2"],
)
async def interview_v2_history(session_id: str):
    """Historial de entrevistas V2 del session_id (últimas 10)."""
    _ensure_v2_enabled()
    try:
        return await interview_v2_service.historial_v2(session_id)
    except Exception as e:
        logger.error(f"Error en GET /interview/v2/history/{session_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener historial V2")
