from fastapi import APIRouter, HTTPException
from app.models.profile import OnboardingInput, ProfileOut
from app.services import profile_service
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post("/profile", response_model=ProfileOut, tags=["Perfil"])
async def crear_perfil(data: OnboardingInput):
    """
    Recibe las respuestas del onboarding, extrae el perfil con Gemini
    y lo guarda en Supabase. Si el session_id ya existe, lo actualiza.
    """
    try:
        return await profile_service.crear_perfil(data)
    except Exception as e:
        logger.error(f"Error en POST /profile: {e}")
        raise HTTPException(status_code=500, detail="Error al procesar el perfil")


@router.get("/profile/{session_id}", response_model=ProfileOut, tags=["Perfil"])
async def obtener_perfil(session_id: str):
    """Devuelve el perfil existente del usuario por session_id."""
    try:
        perfil = await profile_service.obtener_perfil(session_id)
        if not perfil:
            raise HTTPException(status_code=404, detail="Perfil no encontrado")
        return perfil
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en GET /profile/{session_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener el perfil")
