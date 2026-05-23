import os
import json

from app.db.gemini import get_gemini_model
from app.db.supabase import get_supabase
from app.models.coach import ChatMessage, ChatResponse
from app.utils.prompts import get_prompt
from app.utils.logger import get_logger

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"


async def responder_chat(data: ChatMessage) -> ChatResponse:
    """
    Carga el perfil del usuario, construye el prompt del coach y llama a Gemini.
    Devuelve respuesta + sugerencias rápidas para chips en el frontend.
    """
    if USE_MOCK:
        logger.info(f"[MOCK] Coach simulado — session_id={data.session_id}")
        return _mock_respuesta(data)

    perfil = await _cargar_perfil(data.session_id)
    if not perfil:
        raise PerfilNoEncontradoError(data.session_id)

    return await _responder_con_gemini(data.mensaje, perfil)


async def _cargar_perfil(session_id: str) -> dict | None:
    """Lee el perfil completo de Supabase para dar contexto al coach."""
    supabase = get_supabase()
    resultado = supabase.table("profiles").select("*").eq("session_id", session_id).execute()
    if not resultado.data:
        return None
    return resultado.data[0]


async def _responder_con_gemini(mensaje: str, perfil: dict) -> ChatResponse:
    """Invoca Gemini con system prompt + perfil + mensaje del usuario."""
    system_template = get_prompt("CAREER_COACH_SYSTEM")
    perfil_json = json.dumps(perfil, ensure_ascii=False, indent=2, default=str)
    system_instruction = system_template.replace("{perfil_json}", perfil_json)

    import google.generativeai as genai

    get_gemini_model("gemini-1.5-flash")  # asegura configure(api_key)
    model = genai.GenerativeModel(
        "gemini-1.5-flash",
        system_instruction=system_instruction,
    )

    try:
        respuesta = model.generate_content(mensaje)
        texto = (respuesta.text or "").strip()
        return _parsear_respuesta(texto)
    except Exception as e:
        logger.error(f"Error en coach Gemini: {e}")
        return _fallback_respuesta(mensaje, perfil)


def _parsear_respuesta(texto: str) -> ChatResponse:
    """Parsea JSON de Gemini; si falla, usa el texto plano como respuesta."""
    limpio = texto
    if limpio.startswith("```"):
        partes = limpio.split("```")
        limpio = partes[1] if len(partes) > 1 else limpio
        if limpio.startswith("json"):
            limpio = limpio[4:]

    try:
        data = json.loads(limpio.strip())
        return ChatResponse(
            respuesta=data.get("respuesta", texto),
            sugerencias_rapidas=(data.get("sugerencias_rapidas") or [])[:3],
        )
    except json.JSONDecodeError:
        return ChatResponse(respuesta=texto, sugerencias_rapidas=[])


def _fallback_respuesta(mensaje: str, perfil: dict) -> ChatResponse:
    """Respuesta simple si Gemini falla — sin bloquear al usuario."""
    nombre = perfil.get("nombre") or "campeón"
    ciudad = perfil.get("ciudad") or "tu ciudad"
    habilidades = ", ".join((perfil.get("habilidades") or [])[:3]) or "tus habilidades"
    return ChatResponse(
        respuesta=(
            f"Hola {nombre}, gracias por tu mensaje. "
            f"Con tu perfil en {ciudad} y habilidades como {habilidades}, "
            f"te recomiendo explorar vacantes en tus sectores de interés y reforzar una skill clave esta semana. "
            f"Cuéntame más sobre: {mensaje[:120]}"
        ),
        sugerencias_rapidas=["Ver vacantes", "Mejorar perfil", "Explorar sectores"],
    )


def _mock_respuesta(data: ChatMessage) -> ChatResponse:
    """Coach simulado para desarrollo sin credenciales."""
    return ChatResponse(
        respuesta=(
            f"¡Buena pregunta! Basado en tu perfil de joven profesional en el Caribe, "
            f"para «{data.mensaje[:80]}» te sugiero: fortalecer una habilidad técnica esta semana, "
            f"actualizar tu CV con logros medibles y filtrar vacantes verdes en Barranquilla. "
            f"El mercado local está activo en tecnología y servicios."
        ),
        sugerencias_rapidas=[
            "Ver vacantes recomendadas",
            "Explorar termómetro",
            "Agregar habilidad",
        ],
    )


class PerfilNoEncontradoError(Exception):
    """El session_id no tiene perfil en Supabase."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        super().__init__(f"Perfil no encontrado: {session_id}")
