import os
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
    Coach conversacional con function calling (Plan 2).
    
    El coach ahora puede ejecutar funciones reales:
    - Buscar vacantes filtradas
    - Explicar score de match
    - Comparar vacantes
    - Recomendar aprendizaje
    - Analizar mercado
    - Ver plan de acción
    
    Requiere haber completado el onboarding (POST /api/profile) en modo real.
    """
    try:
        return await coach_service.responder_chat_con_funciones(data)
    except PerfilNoEncontradoError:
        raise HTTPException(
            status_code=404,
            detail="Perfil no encontrado. Completa el onboarding primero.",
        )
    except Exception as e:
        logger.error(f"Error en POST /coach/chat: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/coach/debug", tags=["Coach - Debug"])
async def coach_debug(request: Request, data: ChatMessage):
    """
    Endpoint de diagnóstico - muestra exactamente qué se envía a Gemini.
    NO tiene rate limit. Usar solo para debugging.
    """
    from app.db.supabase import get_supabase
    from app.utils.prompts import get_prompt
    import json
    
    try:
        # Cargar perfil
        supabase = get_supabase()
        resultado = supabase.table("profiles").select("*").eq("session_id", data.session_id).execute()
        
        if not resultado.data:
            return {
                "error": "Perfil no encontrado",
                "session_id": data.session_id
            }
        
        perfil = resultado.data[0]
        
        # Crear resumen
        perfil_resumido = coach_service._crear_perfil_resumido(perfil)
        
        # Cargar prompt
        system_template = get_prompt("CAREER_COACH_SYSTEM")
        system_instruction = system_template.replace("{perfil_json}", perfil_resumido)
        
        return {
            "mensaje_usuario": data.mensaje,
            "perfil_crudo": perfil,
            "perfil_resumido": perfil_resumido,
            "system_instruction_preview": system_instruction[:500],
            "system_instruction_length": len(system_instruction),
            "gemini_api_key_configured": bool(os.getenv("GEMINI_API_KEY")),
        }
        
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
