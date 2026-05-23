import os
import json
from app.db.supabase import get_supabase
from app.db.gemini import get_gemini_model
from app.models.profile import OnboardingInput, ProfileOut
from app.utils.logger import get_logger

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"

PROMPT_EXTRACCION = """
Eres un asistente que extrae información estructurada de perfiles laborales.

Dado el siguiente input de onboarding, devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:
{{
  "nombre": string o null,
  "edad": integer o null,
  "ciudad": string o null,
  "departamento": string o null,
  "nivel_educativo": "bachiller"|"tecnico"|"tecnologo"|"universitario"|"posgrado"|null,
  "carrera": string o null,
  "experiencia_anios": float,
  "habilidades": [lista de strings en minúsculas sin acentos],
  "sectores_interes": [lista de strings en minúsculas],
  "salario_esperado_min": integer o null,
  "salario_esperado_max": integer o null,
  "modalidad": "presencial"|"remoto"|"hibrido"|"indiferente"|null
}}

Normaliza las habilidades a minúsculas sin acentos (ej: "Análisis de Datos" → "analisis de datos").
Infiere el departamento si conoces la ciudad colombiana.
Si el texto libre menciona habilidades adicionales, agrégalas.
No inventes datos que no estén en el input.
Devuelve SOLO el JSON, sin texto adicional, sin markdown.

INPUT:
{input}
""".strip()


async def crear_perfil(data: OnboardingInput) -> ProfileOut:
    """Extrae perfil con Gemini y lo guarda en Supabase."""
    if USE_MOCK:
        logger.info(f"[MOCK] Perfil simulado para session_id={data.session_id}")
        return _perfil_out_mock(data)

    perfil_extraido = await _extraer_con_gemini(data)
    perfil_final = {
        "session_id": data.session_id,
        "raw_onboarding": data.model_dump(),
        **perfil_extraido,
    }

    supabase = get_supabase()
    existente = supabase.table("profiles").select("id").eq("session_id", data.session_id).execute()
    if existente.data:
        resultado = supabase.table("profiles").update(perfil_final).eq("session_id", data.session_id).execute()
    else:
        resultado = supabase.table("profiles").insert(perfil_final).execute()

    fila = resultado.data[0]
    logger.info(f"Perfil guardado: session_id={data.session_id}, ciudad={fila.get('ciudad')}")
    return ProfileOut(**fila)


async def obtener_perfil(session_id: str) -> ProfileOut | None:
    """Devuelve el perfil existente o None si no existe."""
    if USE_MOCK:
        return None  # en mock mode, no hay BD real que consultar

    supabase = get_supabase()
    resultado = supabase.table("profiles").select("*").eq("session_id", session_id).execute()
    if not resultado.data:
        return None
    return ProfileOut(**resultado.data[0])


async def _extraer_con_gemini(data: OnboardingInput) -> dict:
    """Llama a Gemini para estructurar el perfil a partir del input."""
    model = get_gemini_model("gemini-1.5-flash")
    input_texto = json.dumps(data.model_dump(), ensure_ascii=False, indent=2)
    prompt = PROMPT_EXTRACCION.format(input=input_texto)

    try:
        respuesta = model.generate_content(prompt)
        texto = respuesta.text.strip()
        # Limpiar posibles bloques de código markdown
        if texto.startswith("```"):
            texto = texto.split("```")[1]
            if texto.startswith("json"):
                texto = texto[4:]
        return json.loads(texto)
    except Exception as e:
        logger.error(f"Error extrayendo perfil con Gemini: {e}")
        # Fallback: usar los datos explícitos del input sin enriquecer
        return _mock_perfil(data)


def _mock_perfil(data: OnboardingInput) -> dict:
    """Extrae campos del input sin llamar a Gemini (fallback de errores)."""
    return {
        "nombre": data.nombre,
        "edad": data.edad,
        "ciudad": data.ciudad,
        "departamento": data.departamento,
        "nivel_educativo": data.nivel_educativo,
        "carrera": data.carrera,
        "experiencia_anios": data.experiencia_anios or 0.0,
        "habilidades": [h.lower() for h in data.habilidades],
        "sectores_interes": [s.lower() for s in data.sectores_interes],
        "salario_esperado_min": data.salario_esperado_min,
        "salario_esperado_max": data.salario_esperado_max,
        "modalidad": data.modalidad,
    }


def _perfil_out_mock(data: OnboardingInput) -> ProfileOut:
    """Devuelve un ProfileOut sin tocar Supabase, para modo mock."""
    from datetime import datetime, timezone
    campos = _mock_perfil(data)
    return ProfileOut(
        id="mock-id-000",
        session_id=data.session_id,
        created_at=datetime.now(timezone.utc),
        **campos,
    )
