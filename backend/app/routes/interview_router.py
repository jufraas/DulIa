"""Endpoints REST del simulador de entrevistas (B5)."""

from fastapi import APIRouter, HTTPException, Request

from app.models.interview_models import (
    InterviewAnswerInput,
    InterviewAnswerResponse,
    InterviewFinishResponse,
    InterviewHistoryItem,
    InterviewStartInput,
    InterviewStartResponse,
)
from app.services import interview_service
from app.services.interview_service import (
    InterviewAlreadyCompletedError,
    InterviewNoAnswersError,
    InterviewNotFoundError,
    InterviewNotInProgressError,
    ProfileNotFoundError,
    QuestionAlreadyAnsweredError,
)
from app.utils.logger import get_logger
from app.utils.limiter import (
    INTERVIEW_ANSWER_LIMIT,
    INTERVIEW_FINISH_LIMIT,
    INTERVIEW_START_LIMIT,
    limiter,
)

logger = get_logger(__name__)
router = APIRouter()


@router.post("/interview/start", response_model=InterviewStartResponse, tags=["Mock Interview"])
@limiter.limit(INTERVIEW_START_LIMIT)
async def start_interview(request: Request, body: InterviewStartInput):
    """
    Inicia entrevista simulada: genera 5 preguntas (pool + Gemini) y persiste en `mock_interviews`.

    Rate limit: **5 req/min** por IP (llama a Gemini).
    """
    try:
        return await interview_service.iniciar_entrevista(
            body.session_id,
            body.target_skill,
            body.target_role,
        )
    except ProfileNotFoundError:
        raise HTTPException(status_code=404, detail="Perfil no encontrado para session_id")
    except Exception as e:
        logger.error(f"Error en POST /interview/start: {e}")
        raise HTTPException(status_code=500, detail="Error al iniciar entrevista")


@router.post(
    "/interview/{interview_id}/answer",
    response_model=InterviewAnswerResponse,
    tags=["Mock Interview"],
)
@limiter.limit(INTERVIEW_ANSWER_LIMIT)
async def answer_interview(
    request: Request,
    interview_id: str,
    body: InterviewAnswerInput,
):
    """
    Evalúa la respuesta del candidato con Gemini y la agrega a `answers` jsonb.

    Rate limit: **10 req/min** por IP.
    """
    try:
        return await interview_service.responder_pregunta_entrevista(
            interview_id,
            body.question_idx,
            body.answer,
        )
    except InterviewNotFoundError:
        raise HTTPException(status_code=404, detail="Entrevista no encontrada")
    except InterviewNotInProgressError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except QuestionAlreadyAnsweredError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error en POST /interview/{interview_id}/answer: {e}")
        raise HTTPException(status_code=500, detail="Error al evaluar respuesta")


@router.post(
    "/interview/{interview_id}/finish",
    response_model=InterviewFinishResponse,
    tags=["Mock Interview"],
)
@limiter.limit(INTERVIEW_FINISH_LIMIT)
async def finish_interview(request: Request, interview_id: str):
    """
    Cierra la entrevista: score global, weak_skills y feedback final con Gemini.

    Rate limit: **3 req/min** por IP.
    """
    try:
        return await interview_service.cerrar_entrevista(interview_id)
    except InterviewNotFoundError:
        raise HTTPException(status_code=404, detail="Entrevista no encontrada")
    except InterviewAlreadyCompletedError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except InterviewNoAnswersError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        logger.error(f"Error en POST /interview/{interview_id}/finish: {e}")
        raise HTTPException(status_code=500, detail="Error al finalizar entrevista")


@router.get(
    "/interview/history/{session_id}",
    response_model=list[InterviewHistoryItem],
    tags=["Mock Interview"],
)
async def interview_history(session_id: str):
    """
    Historial de entrevistas del session_id (últimas 10, más recientes primero).

    Sin rate limit — lectura barata.
    """
    try:
        return await interview_service.historial_entrevistas(session_id)
    except Exception as e:
        logger.error(f"Error en GET /interview/history/{session_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener historial")
