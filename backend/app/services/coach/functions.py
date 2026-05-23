"""Definición de funciones disponibles para el coach.

Cada función tiene:
- name: identificador único
- description: descripción para Gemini decidir cuándo usarla
- parameters: schema JSON de parámetros
- handler: función que ejecuta la lógica (registrada en FUNCTION_HANDLERS)
"""

from typing import Callable, Any
from dataclasses import dataclass
from enum import Enum


class FunctionName(str, Enum):
    """Nombres de funciones disponibles."""
    BUSCAR_VACANTES = "buscar_vacantes_filtradas"
    EXPLICAR_SCORE = "explicar_score_detallado"
    COMPARAR_VACANTES = "comparar_vacantes"
    RECOMENDAR_APRENDIZAJE = "recomendar_aprendizaje"
    ANALIZAR_MERCADO = "analizar_mercado_sector"
    OBTENER_PLAN = "obtener_plan_accion"


@dataclass
class FunctionDefinition:
    """Definición de una función callable."""
    name: str
    description: str
    parameters: dict
    handler: Callable[..., Any]


# Schema de funciones para Gemini
FUNCIONES_GEMINI = [
    {
        "name": FunctionName.BUSCAR_VACANTES,
        "description": "Busca vacantes activas que coincidan con criterios específicos del usuario. Úsala cuando el usuario pregunte por vacantes, trabajos, empleos, oportunidades, o quiera filtrar por habilidad/sector/ciudad.",
        "parameters": {
            "type": "object",
            "properties": {
                "habilidades": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Lista de habilidades requeridas (ej: ['python', 'excel', 'sql'])"
                },
                "sector": {
                    "type": "string",
                    "description": "Sector laboral (ej: 'tecnología', 'salud', 'comercial', 'logística')"
                },
                "ciudad": {
                    "type": "string",
                    "description": "Ciudad específica (ej: 'Barranquilla', 'Bogotá')"
                },
                "salario_min": {
                    "type": "integer",
                    "description": "Salario mínimo aceptable en COP"
                },
                "modalidad": {
                    "type": "string",
                    "enum": ["presencial", "remoto", "hibrido"],
                    "description": "Modalidad de trabajo preferida"
                },
                "limit": {
                    "type": "integer",
                    "default": 5,
                    "description": "Número máximo de resultados (1-20)"
                }
            }
        }
    },
    {
        "name": FunctionName.EXPLICAR_SCORE,
        "description": "Explica detalladamente por qué una vacante es buena o mala para el usuario, qué habilidades coinciden, cuáles faltan, y cómo mejorar el match. Úsala cuando el usuario pregunte 'por qué esta vacante', 'qué me falta', 'por qué match bajo', o quiera entender el score.",
        "parameters": {
            "type": "object",
            "properties": {
                "job_id": {
                    "type": "string",
                    "description": "ID de la vacante a analizar"
                }
            },
            "required": ["job_id"]
        }
    },
    {
        "name": FunctionName.COMPARAR_VACANTES,
        "description": "Compara 2-3 vacantes lado a lado mostrando pros, contras, y cuál es mejor para el perfil del usuario. Úsala cuando el usuario pida comparar, decidir entre opciones, o pregunte 'cuál es mejor'.",
        "parameters": {
            "type": "object",
            "properties": {
                "job_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 2,
                    "maxItems": 3,
                    "description": "IDs de las vacantes a comparar"
                }
            },
            "required": ["job_ids"]
        }
    },
    {
        "name": FunctionName.RECOMENDAR_APRENDIZAJE,
        "description": "Sugiere cursos, certificaciones o recursos específicos para aprender una habilidad. Úsala cuando el usuario pregunte qué aprender, cursos, certificaciones, o cómo mejorar una skill.",
        "parameters": {
            "type": "object",
            "properties": {
                "habilidad": {
                    "type": "string",
                    "description": "Nombre de la habilidad (ej: 'python', 'inglés técnico', 'aws', 'excel avanzado')"
                },
                "nivel_actual": {
                    "type": "string",
                    "enum": ["principiante", "intermedio", "avanzado"],
                    "description": "Nivel actual del usuario en esa habilidad"
                },
                "presupuesto": {
                    "type": "string",
                    "enum": ["gratis", "bajo", "medio"],
                    "default": "gratis",
                    "description": "Presupuesto disponible: gratis (cursos gratuitos), bajo (<$100k COP), medio ($100k-$500k COP)"
                }
            },
            "required": ["habilidad"]
        }
    },
    {
        "name": FunctionName.ANALIZAR_MERCADO,
        "description": "Proporciona análisis del mercado laboral para un sector específico: salarios, tendencias, habilidades demandadas, empresas contratando. Úsala cuando el usuario pregunte por el mercado, salarios, tendencias, o información de un sector.",
        "parameters": {
            "type": "object",
            "properties": {
                "sector": {
                    "type": "string",
                    "description": "Sector a analizar (ej: 'tecnología', 'fintech', 'salud')"
                },
                "ciudad": {
                    "type": "string",
                    "description": "Ciudad específica (opcional)"
                }
            },
            "required": ["sector"]
        }
    },
    {
        "name": FunctionName.OBTENER_PLAN,
        "description": "Recupera el plan de acción personalizado del usuario con milestones, recursos y próximos pasos. Úsala cuando el usuario pregunte por su plan, próximos pasos, qué hacer, o quiera ver su progreso.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    }
]

# Handlers se registran en tiempo de ejecución
FUNCTION_HANDLERS: dict[str, Callable[..., Any]] = {}


def register_handler(name: str):
    """Decorador para registrar un handler de función."""
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        FUNCTION_HANDLERS[name] = func
        return func
    return decorator


def get_function_schema() -> list[dict]:
    """Devuelve el schema de funciones para Gemini."""
    return FUNCIONES_GEMINI


def get_handler(name: str) -> Callable[..., Any] | None:
    """Obtiene el handler de una función por nombre."""
    return FUNCTION_HANDLERS.get(name)
