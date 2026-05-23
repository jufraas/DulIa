"""Router de intenciones para el coach.

Decide si un mensaje del usuario requiere llamar a una función del sistema
o puede responderse directamente.
"""

import json
import os
from typing import Optional

from app.db.gemini import get_gemini_model
from app.utils.logger import get_logger
from app.utils.prompts import get_prompt
from app.services.coach.functions import get_function_schema, FunctionName

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"


class IntentRouter:
    """Clasifica la intención del usuario y decide si usar function calling."""
    
    @staticmethod
    async def clasificar_intencion(
        mensaje: str,
        perfil: dict,
        historial: Optional[list] = None
    ) -> dict:
        """
        Analiza el mensaje y decide si requiere función o respuesta directa.
        
        Returns:
            {
                "requiere_funcion": bool,
                "funcion": str | None,
                "parametros": dict | None,
                "razonamiento": str
            }
        """
        if USE_MOCK:
            # En modo mock, usar heurísticas simples
            return IntentRouter._heuristic_router(mensaje, perfil)
        
        try:
            # Construir prompt para el router
            prompt = IntentRouter._construir_prompt_router(mensaje, perfil, historial)
            
            # Llamar a Gemini para decidir
            model = get_gemini_model("gemini-3.1-flash-lite")
            response = model.generate_content(prompt)
            
            # Parsear respuesta
            texto = response.text.strip()
            
            # Limpiar markdown si existe
            if texto.startswith("```"):
                partes = texto.split("```")
                texto = partes[1] if len(partes) > 1 else texto
                if texto.startswith("json"):
                    texto = texto[4:]
            
            decision = json.loads(texto.strip())
            
            # Validar que la función existe
            if decision.get("requiere_funcion") and decision.get("funcion"):
                funciones_validas = [f.value for f in FunctionName]
                if decision["funcion"] not in funciones_validas:
                    logger.warning(f"Función inválida: {decision['funcion']}")
                    decision["requiere_funcion"] = False
                    decision["funcion"] = None
            
            logger.info(f"Router: '{mensaje[:50]}...' → {decision.get('funcion', 'respuesta_directa')}")
            return decision
            
        except Exception as e:
            logger.error(f"Error en router: {e}")
            # Fallback a heurísticas
            return IntentRouter._heuristic_router(mensaje, perfil)
    
    @staticmethod
    def _construir_prompt_router(mensaje: str, perfil: dict, historial: Optional[list]) -> str:
        """Construye el prompt para el router."""
        
        # Cargar template
        try:
            template = get_prompt("COACH_FUNCTION_ROUTER")
        except:
            # Fallback si el prompt no está definido
            template = IntentRouter._get_fallback_router_prompt()
        
        # Preparar contexto
        nombre = perfil.get("nombre", "Usuario")
        ciudad = perfil.get("ciudad", "su ciudad")
        habilidades = ", ".join(perfil.get("habilidades", [])[:5])
        sectores = ", ".join(perfil.get("sectores_interes", []))
        
        # Historial formateado
        historial_str = ""
        if historial:
            historial_str = "\n".join([
                f"- {h.get('role')}: {h.get('content', '')[:100]}"
                for h in historial[-3:]
            ])
        
        # Reemplazar variables
        prompt = template.replace("{mensaje}", mensaje)
        prompt = prompt.replace("{nombre}", nombre)
        prompt = prompt.replace("{ciudad}", ciudad)
        prompt = prompt.replace("{habilidades}", habilidades or "No especificadas")
        prompt = prompt.replace("{sectores}", sectores or "No especificados")
        
        return prompt
    
    @staticmethod
    def _get_fallback_router_prompt() -> str:
        """Prompt fallback si no está definido en PROMPTS.md."""
        return """Eres un clasificador de intenciones para un coach de carrera.

Analiza el mensaje del usuario y decide si requiere buscar información del sistema.

MENSAJE DEL USUARIO: "{mensaje}"

FUNCIONES DISPONIBLES:
1. buscar_vacantes_filtradas - Preguntas sobre vacantes, trabajos, empleos, oportunidades
2. explicar_score_detallado - Preguntas sobre por qué una vacante, qué falta, match
3. comparar_vacantes - Comparar opciones, decidir entre vacantes
4. recomendar_aprendizaje - Qué aprender, cursos, certificaciones, mejorar skills
5. analizar_mercado_sector - Información de mercado, salarios, tendencias
6. obtener_plan_accion - Ver plan, próximos pasos, qué hacer

Responde ÚNICAMENTE con JSON:
{
  "requiere_funcion": true|false,
  "funcion": "nombre_funcion",
  "parametros": {},
  "razonamiento": "breve explicación"
}

REGLAS:
- Saludos, agradecimientos, despedidas: requiere_funcion = false
- Preguntas sobre el perfil del usuario (si ya lo sabes): requiere_funcion = false
- Preguntas que requieren datos externos: requiere_funcion = true
- Sé conservador, prefiere respuesta directa
"""
    
    @staticmethod
    def _heuristic_router(mensaje: str, perfil: dict) -> dict:
        """Router basado en heurísticas cuando Gemini no está disponible."""
        mensaje_lower = mensaje.lower()
        
        # Keywords para cada función
        keywords = {
            FunctionName.BUSCAR_VACANTES: [
                "vacante", "trabajo", "empleo", "oportunidad", "buscar", "encontrar",
                "hay", "hay trabajo", "hay vacantes", "disponible"
            ],
            FunctionName.EXPLICAR_SCORE: [
                "por qué", "porque", "match", "score", "compatibilidad", "falta",
                "qué me falta", "por qué bajo", "no coinciden"
            ],
            FunctionName.COMPARAR_VACANTES: [
                "comparar", "comparación", "cual es mejor", "cuál es mejor",
                "decidir", "entre", "vs", "versus"
            ],
            FunctionName.RECOMENDAR_APRENDIZAJE: [
                "aprender", "curso", "certificación", "certificacion", "estudiar",
                "habilidad", "skill", "mejorar", "capacitación"
            ],
            FunctionName.ANALIZAR_MERCADO: [
                "mercado", "salario", "sueldo", "tendencia", "sector",
                "cuánto ganan", "cuanto ganan", "demanda"
            ],
            FunctionName.OBTENER_PLAN: [
                "plan", "próximos pasos", "proximos pasos", "qué hacer",
                "que hacer", "roadmap", "milestones"
            ]
        }
        
        # Buscar coincidencias
        for funcion, kw_list in keywords.items():
            for kw in kw_list:
                if kw in mensaje_lower:
                    return {
                        "requiere_funcion": True,
                        "funcion": funcion.value,
                        "parametros": IntentRouter._inferir_parametros(funcion, perfil),
                        "razonamiento": f"Keyword detectada: '{kw}'"
                    }
        
        # Default: respuesta directa
        return {
            "requiere_funcion": False,
            "funcion": None,
            "parametros": None,
            "razonamiento": "No se detectó intención que requiera función"
        }
    
    @staticmethod
    def _inferir_parametros(funcion: FunctionName, perfil: dict) -> dict:
        """Infiere parámetros basados en el perfil."""
        if funcion == FunctionName.BUSCAR_VACANTES:
            params = {"limit": 5}
            if perfil.get("ciudad"):
                params["ciudad"] = perfil["ciudad"]
            if perfil.get("sectores_interes"):
                params["sector"] = perfil["sectores_interes"][0]
            return params
        
        elif funcion == FunctionName.ANALIZAR_MERCADO:
            if perfil.get("sectores_interes"):
                return {"sector": perfil["sectores_interes"][0]}
            return {"sector": "tecnología"}
        
        return {}


# Instancia singleton
intent_router = IntentRouter()
