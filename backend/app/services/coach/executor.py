"""Executor de funciones del coach.

Ejecuta las funciones del sistema y devuelve los resultados.
"""

import json
from typing import Any

from app.db.supabase import get_supabase
from app.utils.logger import get_logger
from app.services.coach.functions import (
    FunctionName, register_handler, get_handler
)
from app.services.jobs_service import recomendar_jobs
from app.services.market_service import obtener_dashboard
from app.services.profile_analysis_service import profile_analysis_service
from app.services.action_plan_service import action_plan_service

logger = get_logger(__name__)


class FunctionExecutor:
    """Ejecuta las funciones del coach y devuelve resultados."""
    
    def __init__(self):
        self._register_handlers()
    
    def _register_handlers(self):
        """Registra todos los handlers de funciones."""
        # Se ejecutan automáticamente por el decorador @register_handler
        pass
    
    async def execute(self, funcion: str, parametros: dict, session_id: str) -> dict:
        """
        Ejecuta una función por nombre.
        
        Args:
            funcion: Nombre de la función
            parametros: Parámetros de la función
            session_id: ID de sesión del usuario
            
        Returns:
            Resultado de la función
        """
        handler = get_handler(funcion)
        if not handler:
            logger.error(f"Handler no encontrado para función: {funcion}")
            return {
                "error": True,
                "mensaje": f"Función '{funcion}' no implementada"
            }
        
        try:
            result = await handler(parametros, session_id)
            return {
                "error": False,
                "funcion": funcion,
                "resultado": result
            }
        except Exception as e:
            logger.error(f"Error ejecutando {funcion}: {e}")
            return {
                "error": True,
                "funcion": funcion,
                "mensaje": str(e)
            }


# ============================================================
# HANDLERS DE FUNCIONES
# ============================================================

@register_handler(FunctionName.BUSCAR_VACANTES)
async def handle_buscar_vacantes(parametros: dict, session_id: str) -> dict:
    """Busca vacantes filtradas."""
    logger.info(f"Ejecutando buscar_vacantes: {parametros}")
    
    # Usar el servicio existente
    vacantes = await recomendar_jobs(session_id)
    
    # Aplicar filtros adicionales si se especificaron
    filtradas = vacantes
    
    if parametros.get("sector"):
        sector = parametros["sector"].lower()
        filtradas = [v for v in filtradas if v.sector and sector in v.sector.lower()]
    
    if parametros.get("ciudad"):
        ciudad = parametros["ciudad"].lower()
        filtradas = [v for v in filtradas if v.ciudad and ciudad in v.ciudad.lower()]
    
    if parametros.get("modalidad"):
        modalidad = parametros["modalidad"].lower()
        filtradas = [v for v in filtradas if v.modalidad and modalidad in v.modalidad.lower()]
    
    # Limitar resultados
    limit = min(parametros.get("limit", 5), 20)
    filtradas = filtradas[:limit]
    
    return {
        "total": len(filtradas),
        "vacantes": [
            {
                "id": v.id,
                "titulo": v.titulo,
                "empresa": v.empresa,
                "ciudad": v.ciudad,
                "salario_min": v.salario_min,
                "salario_max": v.salario_max,
                "score_compatibilidad": v.score_compatibilidad,
                "habilidades_match": v.habilidades_match,
                "habilidades_faltantes": v.habilidades_faltantes,
                "modalidad": v.modalidad,
                "sector": v.sector
            }
            for v in filtradas
        ]
    }


@register_handler(FunctionName.EXPLICAR_SCORE)
async def handle_explicar_score(parametros: dict, session_id: str) -> dict:
    """Explica el score de match de una vacante."""
    job_id = parametros.get("job_id")
    logger.info(f"Ejecutando explicar_score: {job_id}")
    
    if not job_id:
        return {"error": "job_id requerido"}
    
    # Obtener vacantes del usuario
    vacantes = await recomendar_jobs(session_id)
    
    # Buscar la vacante específica
    vacante = None
    for v in vacantes:
        if str(v.id) == job_id:
            vacante = v
            break
    
    if not vacante:
        return {
            "error": "Vacante no encontrada o no esta en tus recomendaciones"
        }
    
    # Obtener perfil para contexto
    supabase = get_supabase()
    perfil_res = supabase.table("profiles").select("*").eq("session_id", session_id).execute()
    perfil = perfil_res.data[0] if perfil_res.data else {}
    
    return {
        "vacante": {
            "id": vacante.id,
            "titulo": vacante.titulo,
            "empresa": vacante.empresa,
            "score": vacante.score_compatibilidad
        },
        "analisis_score": {
            "puntos_fuertes": vacante.habilidades_match or [],
            "habilidades_faltantes": vacante.habilidades_faltantes or [],
            "recomendaciones_mejora": [
                f"Aprende: {', '.join(vacante.habilidades_faltantes[:3])}"
            ] if vacante.habilidades_faltantes else ["Tu perfil esta bien alineado"],
            "mensaje": f"Score de {vacante.score_compatibilidad}%: " + 
                      f"Coinciden {len(vacante.habilidades_match or [])} habilidades. " +
                      f"Faltan {len(vacante.habilidades_faltantes or [])} para match perfecto."
        },
        "comparativa_perfil": {
            "tu_experiencia": perfil.get("experiencia_anios", 0),
            "experiencia_requerida": vacante.experiencia_requerida,
            "tu_educacion": perfil.get("nivel_educativo", "No especificado"),
            "educacion_requerida": vacante.nivel_educativo_req
        }
    }


@register_handler(FunctionName.COMPARAR_VACANTES)
async def handle_comparar_vacantes(parametros: dict, session_id: str) -> dict:
    """Compara 2-3 vacantes."""
    job_ids = parametros.get("job_ids", [])
    logger.info(f"Ejecutando comparar_vacantes: {job_ids}")
    
    if len(job_ids) < 2:
        return {"error": "Se requieren al menos 2 vacantes para comparar"}
    
    # Obtener vacantes del usuario
    vacantes = await recomendar_jobs(session_id)
    
    # Buscar las vacantes
    vacantes_encontradas = []
    for job_id in job_ids:
        for v in vacantes:
            if str(v.id) == job_id:
                vacantes_encontradas.append(v)
                break
    
    if len(vacantes_encontradas) < 2:
        return {
            "error": f"Solo encontradas {len(vacantes_encontradas)} de {len(job_ids)} vacantes en tus recomendaciones"
        }
    
    # Comparación
    comparacion = {
        "vacantes": [],
        "mejor_opcion": None,
        "analisis": ""
    }
    
    mejor_score = -1
    mejor_vacante = None
    
    for v in vacantes_encontradas:
        info = {
            "id": v.id,
            "titulo": v.titulo,
            "empresa": v.empresa,
            "score": v.score_compatibilidad,
            "salario": f"${v.salario_min:,} - ${v.salario_max:,}" if v.salario_min and v.salario_max else "No especificado",
            "modalidad": v.modalidad,
            "habilidades_match": len(v.habilidades_match or []),
            "habilidades_faltantes": len(v.habilidades_faltantes or [])
        }
        comparacion["vacantes"].append(info)
        
        if v.score_compatibilidad > mejor_score:
            mejor_score = v.score_compatibilidad
            mejor_vacante = v
    
    if mejor_vacante:
        comparacion["mejor_opcion"] = {
            "id": mejor_vacante.id,
            "titulo": mejor_vacante.titulo,
            "razon": f"Mayor score de compatibilidad ({mejor_score}%)"
        }
    
    return comparacion


@register_handler(FunctionName.RECOMENDAR_APRENDIZAJE)
async def handle_recomendar_aprendizaje(parametros: dict, session_id: str) -> dict:
    """Recomienda recursos de aprendizaje."""
    habilidad = parametros.get("habilidad", "")
    nivel = parametros.get("nivel_actual", "principiante")
    presupuesto = parametros.get("presupuesto", "gratis")
    
    logger.info(f"Ejecutando recomendar_aprendizaje: {habilidad}, {nivel}, {presupuesto}")
    
    if not habilidad:
        return {"error": "habilidad requerida"}
    
    # Base de conocimiento de recursos (simplificada)
    recursos_db = {
        "python": {
            "principiante": [
                {"nombre": "Python para Todos (Coursera)", "tipo": "curso", "duracion": "4 semanas", "costo": "Gratis", "url": "coursera.org"},
                {"nombre": "Automate the Boring Stuff", "tipo": "libro", "duracion": "Autodidacta", "costo": "Gratis", "url": "automatetheboringstuff.com"}
            ],
            "intermedio": [
                {"nombre": "Django for Beginners", "tipo": "libro", "duracion": "2 semanas", "costo": "$50.000 COP", "url": "djangoforbeginners.com"},
                {"nombre": "Real Python", "tipo": "plataforma", "duracion": "Continuo", "costo": "$200.000 COP/año", "url": "realpython.com"}
            ]
        },
        "sql": {
            "principiante": [
                {"nombre": "SQL Bolt", "tipo": "interactivo", "duracion": "1 semana", "costo": "Gratis", "url": "sqlbolt.com"},
                {"nombre": "Mode SQL Tutorial", "tipo": "tutorial", "duracion": "3 dias", "costo": "Gratis", "url": "mode.com"}
            ]
        },
        "excel": {
            "principiante": [
                {"nombre": "Excel Basico (LinkedIn Learning)", "tipo": "curso", "duracion": "3 horas", "costo": "Gratis con biblioteca", "url": "linkedin.com/learning"}
            ],
            "intermedio": [
                {"nombre": "Excel Avanzado + Macros", "tipo": "curso", "duracion": "8 horas", "costo": "$100.000 COP", "url": "udemy.com"}
            ]
        },
        "aws": {
            "principiante": [
                {"nombre": "AWS Cloud Practitioner", "tipo": "certificacion", "duracion": "6 semanas", "costo": "Gratis (voucher educativo)", "url": "aws.training"},
                {"nombre": "AWS Free Tier Labs", "tipo": "practica", "duracion": "Continuo", "costo": "Gratis", "url": "aws.amazon.com"}
            ]
        },
        "ingles": {
            "principiante": [
                {"nombre": "Duolingo", "tipo": "app", "duracion": "10 min/dia", "costo": "Gratis", "url": "duolingo.com"}
            ],
            "intermedio": [
                {"nombre": "Cambly", "tipo": "tutores", "duracion": "30 min/semana", "costo": "$150.000 COP/mes", "url": "cambly.com"}
            ]
        }
    }
    
    # Buscar recursos
    habilidad_key = habilidad.lower().strip()
    recursos = []
    
    if habilidad_key in recursos_db:
        if nivel in recursos_db[habilidad_key]:
            recursos = recursos_db[habilidad_key][nivel]
        else:
            # Usar nivel principiante como default
            recursos = recursos_db[habilidad_key].get("principiante", [])
    else:
        # Recurso generico
        recursos = [
            {"nombre": f"Cursos de {habilidad} en Coursera", "tipo": "curso", "duracion": "Variable", "costo": "Gratis a pago", "url": "coursera.org"},
            {"nombre": f"Tutoriales de {habilidad} en YouTube", "tipo": "video", "duracion": "Variable", "costo": "Gratis", "url": "youtube.com"}
        ]
    
    return {
        "habilidad": habilidad,
        "nivel": nivel,
        "presupuesto": presupuesto,
        "recursos": recursos,
        "consejo": f"Para {habilidad} a nivel {nivel}, te recomiendo empezar con {recursos[0]['nombre'] if recursos else 'cursos online'}"
    }


@register_handler(FunctionName.ANALIZAR_MERCADO)
async def handle_analizar_mercado(parametros: dict, session_id: str) -> dict:
    """Analiza el mercado laboral de un sector."""
    sector = parametros.get("sector", "tecnologia")
    ciudad = parametros.get("ciudad")
    
    logger.info(f"Ejecutando analizar_mercado: {sector}, {ciudad}")
    
    # Obtener dashboard de mercado
    dashboard = await obtener_dashboard(ciudad=ciudad, sector=sector)
    
    # Obtener perfil para contexto
    supabase = get_supabase()
    perfil_res = supabase.table("profiles").select("*").eq("session_id", session_id).execute()
    perfil = perfil_res.data[0] if perfil_res.data else {}
    
    return {
        "sector": sector,
        "ciudad": ciudad or "Todas",
        "resumen": {
            "total_vacantes": dashboard.total_vacantes_activas,
            "salario_promedio": dashboard.salario_promedio,
            "crecimiento_semanal": dashboard.crecimiento_semanal_pct
        },
        "top_sectores": [
            {"sector": s.sector, "vacantes": s.count}
            for s in dashboard.top_sectores
        ],
        "top_empresas": dashboard.top_empresas_verdes,
        "contexto_perfil": {
            "tu_ciudad": perfil.get("ciudad"),
            "tus_sectores": perfil.get("sectores_interes", []),
            "salario_esperado": {
                "min": perfil.get("salario_esperado_min"),
                "max": perfil.get("salario_esperado_max")
            }
        },
        "insights": [
            f"Hay {dashboard.total_vacantes_activas} vacantes activas en este sector",
            f"Salario promedio: ${dashboard.salario_promedio:,} COP" if dashboard.salario_promedio else "No hay datos de salarios",
            f"Crecimiento: {dashboard.crecimiento_semanal_pct}% esta semana" if dashboard.crecimiento_semanal_pct else "Sin datos de crecimiento"
        ]
    }


@register_handler(FunctionName.OBTENER_PLAN)
async def handle_obtener_plan(parametros: dict, session_id: str) -> dict:
    """Obtiene el plan de accion del usuario."""
    logger.info(f"Ejecutando obtener_plan")
    
    plan = await action_plan_service.get_action_plan(session_id)
    
    if not plan:
        return {
            "error": "No tienes un plan de accion generado",
            "solucion": "Usa POST /profile/{session_id}/action-plan para generar uno"
        }
    
    # Simplificar para el coach
    plan_data = plan.get("plan", {})
    
    return {
        "resumen": plan_data.get("resumen_ejecutivo", ""),
        "fases": [
            {
                "dias": 30,
                "titulo": plan_data.get("fase_30", {}).get("titulo", ""),
                "objetivo": plan_data.get("fase_30", {}).get("objetivo", ""),
                "acciones_clave": [
                    a.get("tarea", "") 
                    for a in plan_data.get("fase_30", {}).get("acciones", [])[:3]
                ]
            },
            {
                "dias": 60,
                "titulo": plan_data.get("fase_60", {}).get("titulo", ""),
                "objetivo": plan_data.get("fase_60", {}).get("objetivo", ""),
                "acciones_clave": [
                    a.get("tarea", "")
                    for a in plan_data.get("fase_60", {}).get("acciones", [])[:3]
                ]
            },
            {
                "dias": 90,
                "titulo": plan_data.get("fase_90", {}).get("titulo", ""),
                "objetivo": plan_data.get("fase_90", {}).get("objetivo", ""),
                "acciones_clave": [
                    a.get("tarea", "")
                    for a in plan_data.get("fase_90", {}).get("acciones", [])[:3]
                ]
            }
        ],
        "milestones": plan_data.get("milestones", []),
        "recursos_recomendados": plan_data.get("recursos_recomendados", [])[:3]
    }


# Instancia singleton
function_executor = FunctionExecutor()
