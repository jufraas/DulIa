"""Coach conversacional con function calling (Plan 2)."""

import os
import json
from datetime import datetime, timezone

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
        return await _mock_respuesta(data)

    perfil = await _cargar_perfil(data.session_id)
    if not perfil:
        raise PerfilNoEncontradoError(data.session_id)

    return await _responder_con_gemini(data.mensaje, perfil, data.historial, data.session_id)


async def _cargar_perfil(session_id: str) -> dict | None:
    """Lee el perfil completo de Supabase para dar contexto al coach."""
    supabase = get_supabase()
    resultado = supabase.table("profiles").select("*").eq("session_id", session_id).execute()
    if not resultado.data:
        return None
    return resultado.data[0]


async def _build_user_context(session_id: str) -> str:
    """
    Resumen corto de progreso + última entrevista para inyectar al system prompt.
    Devuelve cadena vacía si no hay datos relevantes.
    """
    lineas: list[str] = []

    try:
        from app.services.progress_service import get_progress_with_stats

        progreso = await get_progress_with_stats(session_id)
        if progreso.total_tareas > 0:
            fase_nombre = {30: "Fundamentos", 60: "Visibilidad", 90: "Consolidación"}.get(
                progreso.current_phase, str(progreso.current_phase)
            )
            lineas.append(
                f"- Plan: semana {progreso.current_week}, fase de {fase_nombre}. "
                f"Lleva {progreso.tareas_completadas} de {progreso.total_tareas} tareas "
                f"({progreso.progreso_global_pct}%)."
            )
    except Exception as e:
        logger.debug(f"Sin contexto de progreso para coach session_id={session_id}: {e}")

    try:
        from app.services.interview_service import ultima_entrevista_completada

        entrevista = await ultima_entrevista_completada(session_id)
        if entrevista:
            score = entrevista.get("global_score")
            weak = entrevista.get("weak_skills") or []
            if isinstance(weak, str):
                weak = json.loads(weak)
            weak_txt = ", ".join(list(weak)[:3]) if weak else "sin áreas críticas"
            rol = entrevista.get("target_role") or entrevista.get("target_skill") or "simulación"
            lineas.append(
                f'- Última entrevista simulada (rol "{rol}"): {score}/100. '
                f"Áreas débiles: {weak_txt}."
            )
    except Exception as e:
        logger.debug(f"Sin contexto de entrevista para coach session_id={session_id}: {e}")

    if not lineas:
        return ""

    return (
        "CONTEXTO ACTUAL DEL USUARIO (úsalo solo si la pregunta lo amerita):\n"
        + "\n".join(lineas)
    )


async def _responder_con_gemini(
    mensaje: str,
    perfil: dict,
    historial: list | None = None,
    session_id: str | None = None,
) -> ChatResponse:
    """Invoca Gemini con system prompt + historial + mensaje del usuario."""
    historial = historial or []
    try:
        system_template = get_prompt("CAREER_COACH_SYSTEM")
    except Exception as e:
        logger.error(f"Error cargando prompt: {e}")
        return _fallback_respuesta(mensaje, perfil, historial)

    perfil_resumido = _crear_perfil_resumido(perfil)
    user_context = ""
    if session_id:
        user_context = await _build_user_context(session_id)
        if user_context:
            user_context = user_context + "\n"

    system_instruction = system_template.replace("{perfil_json}", perfil_resumido)
    system_instruction = system_instruction.replace("{user_context_block}", user_context)
    system_instruction += _continuity_suffix(historial)

    import google.generativeai as genai

    get_gemini_model("gemini-3.1-flash-lite")  # asegura configure(api_key)
    model = genai.GenerativeModel(
        "gemini-3.1-flash-lite",
        system_instruction=system_instruction,
    )

    contents = _build_gemini_contents(historial, mensaje)

    try:
        logger.info(f"Llamando a Gemini con mensaje: {mensaje[:50]}... (historial={len(historial)} turnos)")
        respuesta = model.generate_content(contents)
        texto = (respuesta.text or "").strip()
        logger.info(f"Respuesta de Gemini recibida: {texto[:200]}...")
        return _parsear_respuesta(texto)
    except Exception as e:
        # SIN FALLBACK - Devolver error detallado para diagnóstico
        logger.error(f"ERROR CRÍTICO en coach Gemini: {type(e).__name__}: {e}")
        logger.error(f"Mensaje que causó error: {mensaje[:100]}")
        logger.error(f"System instruction completo (primeros 500 chars): {system_instruction[:500]}")
        
        # Devolver respuesta de error en lugar de fallback
        import traceback
        error_detalle = traceback.format_exc()
        logger.error(f"Traceback completo:\n{error_detalle}")
        
        return ChatResponse(
            respuesta=f"ERROR: {type(e).__name__}: {str(e)[:200]}. Revisa los logs del backend.",
            sugerencias_rapidas=["Ver logs del servidor"]
        )


def _continuity_suffix(historial: list) -> str:
    """Refuerza en runtime si es primer turno o continuación."""
    if not historial:
        return (
            "\n\n## TURNO ACTUAL\nPrimera pregunta del usuario en este chat. "
            "Si la pregunta ya es concreta, responde directo sin saludo."
        )
    return (
        f"\n\n## TURNO ACTUAL\nContinuación — ya hay {len(historial)} mensajes previos. "
        "NO saludes ni repitas el nombre. Entra directo a la respuesta."
    )


def _historial_role(turno) -> str:
    if isinstance(turno, dict):
        return turno.get("role", "usuario")
    return getattr(turno, "role", "usuario")


def _historial_texto(turno) -> str:
    if isinstance(turno, dict):
        return turno.get("texto", "")
    return getattr(turno, "texto", "")


def _build_gemini_contents(historial: list, mensaje: str) -> list[dict]:
    """Arma historial multi-turno para Gemini (máx. 10 turnos previos)."""
    contents: list[dict] = []
    for turno in historial[-10:]:
        role = "user" if _historial_role(turno) == "usuario" else "model"
        texto = _historial_texto(turno)
        if texto:
            contents.append({"role": role, "parts": [texto]})
    contents.append({"role": "user", "parts": [mensaje]})
    return contents


def _crear_perfil_resumido(perfil: dict) -> str:
    """Crea un resumen natural del perfil, NO un JSON técnico."""
    partes = []
    
    # Nombre y ubicación
    nombre = perfil.get("nombre", "el usuario")
    ciudad = perfil.get("ciudad", "su ciudad")
    partes.append(f"{nombre} está en {ciudad}")
    
    # Experiencia
    exp = perfil.get("experiencia_anios", 0)
    if exp > 0:
        partes.append(f" con {exp} años de experiencia")
    else:
        partes.append(" buscando primer empleo")
    
    # Educación (resumida)
    nivel = perfil.get("nivel_educativo", "")
    carrera = perfil.get("carrera", "")
    if carrera:
        partes.append(f", estudió {carrera}")
    elif nivel:
        partes.append(f" ({nivel})")
    
    # Habilidades (solo las TOP 3-4, NO todas)
    habilidades = perfil.get("habilidades", [])
    if habilidades:
        # Tomar solo las primeras 3-4 habilidades más relevantes
        top_skills = habilidades[:3]
        partes.append(f". Habilidades principales: {', '.join(top_skills)}")
    
    # Sectores de interés
    sectores = perfil.get("sectores_interes", [])
    if sectores:
        partes.append(f". Interesado en: {', '.join(sectores[:2])}")
    
    return "".join(partes)


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
        # Si no es JSON válido, usar el texto directo
        return ChatResponse(respuesta=texto, sugerencias_rapidas=[])


def _fallback_respuesta(mensaje: str, perfil: dict, historial: list | None = None) -> ChatResponse:
    """Respuesta fallback cuando Gemini falla — tono natural y cercano."""
    historial = historial or []
    nombre = perfil.get("nombre") or "parcero"
    ciudad = perfil.get("ciudad") or "Barranquilla"
    es_continuacion = len(historial) > 0
    apertura = "" if es_continuacion else f"¡Qué más {nombre}! "
    # Tomar solo 1-2 habilidades relevantes, NO todas
    habilidades = perfil.get("habilidades", [])
    if habilidades:
        skill_mencion = habilidades[0] if len(habilidades) == 1 else f"{habilidades[0]} y {habilidades[1]}"
    else:
        skill_mencion = "desarrollo"
    
    # Respuestas naturales según contexto
    mensaje_lower = mensaje.lower()
    
    if "vacante" in mensaje_lower or "trabajo" in mensaje_lower or "empleo" in mensaje_lower:
        respuesta = (
            f"{apertura}Vi que tienes experiencia en {skill_mencion}. "
            f"Hay unas oportunidades bacanas en {ciudad} que pueden interesarte. "
            f"¿Buscas algo específico o te muestro las que tengo filtradas?"
        )
        sugerencias = ["Ver vacantes disponibles", "Filtrar por sector", "Ver empresas top"]
    
    elif "plan" in mensaje_lower or "próximo" in mensaje_lower or "que hacer" in mensaje_lower:
        respuesta = (
            f"{apertura}Según tu perfil, esta semana podrías enfocarte en reforzar {skill_mencion}. "
            f"¿Querés que te muestro el plan completo o prefieres ver recursos específicos?"
        )
        sugerencias = ["Ver mi plan", "Recursos de aprendizaje", "Cursos gratis"]
    
    elif "aprender" in mensaje_lower or "curso" in mensaje_lower or "estudiar" in mensaje_lower:
        respuesta = (
            f"{apertura}Para reforzar {skill_mencion} hay unos cursos chéveres. "
            f"¿Te gustan los tutoriales en video o prefieres practicar con proyectos?"
        )
        sugerencias = ["Cursos gratuitos", "Proyectos prácticos", "Certificaciones"]
    
    elif not es_continuacion and ("hola" in mensaje_lower or "saludo" in mensaje_lower or len(mensaje) < 20):
        respuesta = (
            f"¡Qué más {nombre}! Soy DulIA, tu parcero para consejos de carrera. "
            f"¿Cómo te puedo ayudar hoy? Puedo buscar vacantes, analizar el mercado, o revisar tu plan."
        )
        sugerencias = ["Buscar vacantes", "Analizar mercado", "Ver mi plan"]
    
    else:
        respuesta = (
            f"{apertura}Viendo tu perfil, veo que estás en {ciudad} con experiencia en {skill_mencion}. "
            f"¿Querés que busque oportunidades específicas o te ayudo con el plan de acción?"
        )
        sugerencias = ["Buscar vacantes", "Ver mi plan", "Analizar mercado"]
    
    return ChatResponse(
        respuesta=respuesta,
        sugerencias_rapidas=sugerencias,
    )


async def _mock_respuesta(data: ChatMessage) -> ChatResponse:
    """Coach simulado natural para desarrollo sin credenciales."""
    mensaje = data.mensaje.lower()
    contexto = await _build_user_context(data.session_id)
    contexto_hint = ""
    if contexto:
        # Extraer línea de plan para respuestas más realistas en demo
        if "Plan:" in contexto:
            plan_line = [l for l in contexto.split("\n") if l.strip().startswith("- Plan:")]
            if plan_line:
                contexto_hint = plan_line[0].replace("- Plan:", "Veo que").strip() + " "

    if "vacante" in mensaje or "trabajo" in mensaje:
        return ChatResponse(
            respuesta=(
                f"¡Parce! Encontré 8 vacantes que pueden interesarte — la mejor está en una fintech local "
                f"con un score de 87%. Están buscando desarrolladores y el salario está entre $2.5M y $3.5M. "
                f"¿Te las muestro todas o preferís filtrar por algo específico?"
            ),
            sugerencias_rapidas=[
                "Ver las 8 vacantes",
                "Filtrar por salario",
                "Ver solo remotas",
            ],
        )
    
    elif "aprender" in mensaje or "curso" in mensaje:
        return ChatResponse(
            respuesta=(
                f"¡Bacano! Para subir de nivel hay unos cursos de AWS que son gratis para estudiantes. "
                f"También encontré un bootcamp de Python en Coursera que está muy chévere. "
                f"¿Qué preferís: certificaciones cortas o cursos largos con proyecto final?"
            ),
            sugerencias_rapidas=[
                "Certificaciones cortas",
                "Cursos con proyecto",
                "Recursos gratis",
            ],
        )
    
    elif "plan" in mensaje or "próximo" in mensaje or "progreso" in mensaje:
        if contexto_hint:
            respuesta = (
                f"{contexto_hint}"
                f"Te sugiero priorizar la tarea pendiente de esta semana antes de abrir fase 60. "
                f"¿Quieres que te proponga un orden concreto?"
            )
        else:
            respuesta = (
                "Según tu plan, esta semana conviene cerrar las tareas de Fundamentos. "
                "¿Ya actualizaste LinkedIn o prefieres que revisemos el portafolio primero?"
            )
        return ChatResponse(
            respuesta=respuesta,
            sugerencias_rapidas=[
                "Ver mi plan completo",
                "Ideas de proyectos",
                "Actualizar progreso",
            ],
        )

    elif "entrevista" in mensaje or "simul" in mensaje:
        if "entrevista" in contexto.lower():
            respuesta = (
                "Con base en tu última simulación, enfócate en reforzar las áreas débiles "
                "con micro-práctica diaria. ¿Quieres agregar esas tareas a tu plan?"
            )
        else:
            respuesta = (
                "Una entrevista simulada te ayuda a detectar gaps antes de postular. "
                "¿Quieres practicar por skill (Python, Excel, atención al cliente)?"
            )
        return ChatResponse(
            respuesta=respuesta,
            sugerencias_rapidas=["Simular entrevista", "Ver historial", "Agregar tareas al plan"],
        )

    else:
        return ChatResponse(
            respuesta=(
                f"¡Qué más! Estoy aquí para ayudarte con tu carrera. "
                f"Puedo buscar vacantes reales, analizar el mercado laboral, o revisar tu plan de acción. "
                f"¿Por dónde empezamos?"
            ),
            sugerencias_rapidas=[
                "Buscar vacantes",
                "Analizar mercado",
                "Ver mi plan",
            ],
        )


class PerfilNoEncontradoError(Exception):
    """El session_id no tiene perfil en Supabase."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        super().__init__(f"Perfil no encontrado: {session_id}")


# ============================================================
# FUNCTION CALLING (Plan 2)
# ============================================================

async def responder_chat_con_funciones(data: ChatMessage) -> ChatResponse:
    """
    Coach mejorado con function calling (Plan 2).
    
    Flujo:
    1. Clasifica intención del usuario
    2. Si requiere función, la ejecuta y genera respuesta con los datos
    3. Si no, responde directamente
    """
    if USE_MOCK:
        logger.info(f"[MOCK] Coach con function calling — session_id={data.session_id}")
        resp = await _mock_respuesta(data)
        resp.funcion_ejecutada = "buscar_vacantes_simulado"
        resp.acciones_disponibles = ["buscar_vacantes", "analizar_mercado", "obtener_plan"]
        return resp
    
    # Cargar perfil
    perfil = await _cargar_perfil(data.session_id)
    if not perfil:
        raise PerfilNoEncontradoError(data.session_id)
    
    # PASO 1: Clasificar intención del usuario
    from app.services.coach.router import intent_router
    from app.services.coach.executor import function_executor
    
    decision = await intent_router.clasificar_intencion(data.mensaje, perfil, None)
    logger.info(f"Router decision: {decision}")
    
    funcion_ejecutada = None
    resultado_funcion = None
    
    # PASO 2: Ejecutar función si es necesario
    if decision.get("requiere_funcion") and decision.get("funcion"):
        funcion_nombre = decision["funcion"]
        parametros = decision.get("parametros", {})
        
        logger.info(f"Ejecutando función: {funcion_nombre} con params: {parametros}")
        
        resultado = await function_executor.execute(
            funcion_nombre, parametros, data.session_id
        )
        
        if not resultado.get("error"):
            funcion_ejecutada = funcion_nombre
            resultado_funcion = resultado.get("resultado")
            logger.info(f"Función {funcion_ejecutada} ejecutada exitosamente")
        else:
            logger.error(f"Error en función {funcion_nombre}: {resultado.get('mensaje')}")
    
    # PASO 3: Generar respuesta con contexto
    if funcion_ejecutada and resultado_funcion:
        return await _generar_respuesta_con_datos(
            data.mensaje, perfil, funcion_ejecutada, resultado_funcion, data.historial, data.session_id
        )
    else:
        return await _responder_con_gemini(data.mensaje, perfil, data.historial, data.session_id)


async def _generar_respuesta_con_datos(
    mensaje: str,
    perfil: dict,
    funcion: str,
    datos: dict,
    historial: list | None = None,
    session_id: str | None = None,
) -> ChatResponse:
    """Genera respuesta usando los datos reales de la función ejecutada."""
    historial = historial or []

    contexto = f"\n\n[DATOS DEL SISTEMA - Función: {funcion}]\n"
    contexto += json.dumps(datos, ensure_ascii=False, indent=2)[:1000]

    system_template = get_prompt("CAREER_COACH_SYSTEM")
    perfil_resumido = _crear_perfil_resumido(perfil)
    user_context = ""
    if session_id:
        user_context = await _build_user_context(session_id)
        if user_context:
            user_context = user_context + "\n"

    system_instruction = system_template.replace("{perfil_json}", perfil_resumido)
    system_instruction = system_instruction.replace("{user_context_block}", user_context)
    system_instruction += _continuity_suffix(historial)
    system_instruction += "\n\nUsa los datos del sistema proporcionados arriba para responder de forma específica y concreta."
    system_instruction += contexto

    import google.generativeai as genai
    get_gemini_model("gemini-3.1-flash-lite")
    model = genai.GenerativeModel(
        "gemini-3.1-flash-lite",
        system_instruction=system_instruction,
    )

    contents = _build_gemini_contents(historial, mensaje)

    try:
        respuesta = model.generate_content(contents)
        texto = (respuesta.text or "").strip()
        
        chat_resp = _parsear_respuesta(texto)
        chat_resp.funcion_ejecutada = funcion
        chat_resp.datos_funcion = datos
        chat_resp.acciones_disponibles = _get_acciones_disponibles(funcion)
        return chat_resp
        
    except Exception as e:
        logger.error(f"Error generando respuesta con datos: {e}")
        # Devolver respuesta simple con los datos
        respuesta_simple = _crear_respuesta_simple(funcion, datos, perfil)
        return ChatResponse(
            respuesta=respuesta_simple,
            sugerencias_rapidas=["Ver más detalles", "Filtrar resultados", "Guardar búsqueda"],
            funcion_ejecutada=funcion,
            datos_funcion=datos,
            acciones_disponibles=_get_acciones_disponibles(funcion)
        )


def _crear_respuesta_simple(funcion: str, datos: dict, perfil: dict) -> str:
    """Crea respuesta simple cuando Gemini falla pero tenemos datos."""
    nombre = perfil.get("nombre", "parcero")
    
    if funcion == "buscar_vacantes_filtradas":
        total = datos.get("total", 0)
        vacantes = datos.get("vacantes", [])
        if vacantes:
            top = vacantes[0]
            return (
                f"¡Listo {nombre}! Encontré {total} vacantes. La mejor es '{top.get('titulo')}' "
                f"en {top.get('empresa')} con score {top.get('score_compatibilidad')}%. "
                f"¿Te las muestro todas?"
            )
        return f"Encontré {total} vacantes. ¿Te las muestro?"
    
    elif funcion == "explicar_score_detallado":
        return "Aquí está el análisis del score de esa vacante. ¿Te ayuda?"
    
    elif funcion == "analizar_mercado_sector":
        sector = datos.get("sector", "tecnología")
        total = datos.get("resumen", {}).get("total_vacantes", 0)
        return f"El mercado de {sector} tiene {total} vacantes activas. ¿Querés ver más detalles?"
    
    elif funcion == "recomendar_aprendizaje":
        habilidad = datos.get("habilidad", "esta habilidad")
        return f"Tengo recomendaciones para aprender {habilidad}. ¿Te las muestro?"
    
    return f"Aquí están los datos que pediste. ¿En qué más puedo ayudarte?"


def _get_acciones_disponibles(funcion: str) -> list[str]:
    """Devuelve acciones disponibles basadas en la función ejecutada."""
    acciones = {
        "buscar_vacantes_filtradas": ["Filtrar por sector", "Filtrar por ciudad", "Ver más vacantes"],
        "explicar_score_detallado": ["Ver habilidades faltantes", "Comparar vacantes"],
        "comparar_vacantes": ["Aplicar a la mejor", "Ver similares"],
        "recomendar_aprendizaje": ["Ver cursos gratis", "Ver certificaciones"],
        "analizar_mercado_sector": ["Ver top empresas", "Comparar sectores"],
        "obtener_plan_accion": ["Ver próximos pasos", "Actualizar progreso"]
    }
    return acciones.get(funcion, ["Buscar vacantes", "Analizar mercado"])
