import os
import json
from datetime import datetime, timezone
from typing import Optional

from app.db.gemini import get_gemini_model
from app.db.supabase import get_supabase
from app.utils.logger import get_logger
from app.utils.prompts import get_prompt
from app.services.market_service import obtener_dashboard
from app.services.jobs_service import recomendar_jobs
from app.services.profile_analysis_service import ProfileAnalysisService

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"


class ActionPlanService:
    """Servicio para generar planes de acción personalizados 30-60-90 días."""

    @staticmethod
    async def generate_action_plan(session_id: str, force_regenerate: bool = False) -> dict:
        """
        Genera o recupera plan de acción personalizado.
        
        Args:
            session_id: UUID del usuario
            force_regenerate: Si True, regenera aunque exista
            
        Returns:
            dict con el plan completo
        """
        if USE_MOCK:
            logger.info(f"[MOCK] Plan de acción simulado para {session_id}")
            return ActionPlanService._mock_action_plan(session_id)

        supabase = get_supabase()
        
        # Verificar si ya existe plan
        if not force_regenerate:
            existing = supabase.table("action_plans").select("*").eq("session_id", session_id).execute()
            if existing.data:
                logger.info(f"Plan existente encontrado para {session_id}")
                return ActionPlanService._format_response(existing.data[0])

        # Obtener perfil
        perfil_res = supabase.table("profiles").select("*").eq("session_id", session_id).execute()
        if not perfil_res.data:
            raise ValueError(f"Perfil no encontrado: {session_id}")
        perfil = perfil_res.data[0]

        # Obtener análisis (requerido)
        analisis_data = await ProfileAnalysisService.get_analysis(session_id)
        if not analisis_data:
            raise ValueError(f"Análisis previo requerido. Llama /profile/{session_id}/analyze primero")
        analisis = analisis_data["analisis"]

        # Obtener contexto adicional
        contexto = await ActionPlanService._get_plan_context(perfil)
        
        # Generar plan con Gemini
        plan = await ActionPlanService._generate_with_gemini(perfil, analisis, contexto)
        
        # Guardar en BD
        plan_record = {
            "session_id": session_id,
            "resumen_ejecutivo": plan["resumen_ejecutivo"],
            "fase_30": json.dumps(plan["fase_30"]),
            "fase_60": json.dumps(plan["fase_60"]),
            "fase_90": json.dumps(plan["fase_90"]),
            "recursos_recomendados": json.dumps(plan["recursos_recomendados"]),
            "milestones": json.dumps(plan["milestones"]),
            "raw_gemini_response": json.dumps(plan, ensure_ascii=False)
        }
        
        # Upsert
        existing_check = supabase.table("action_plans").select("id").eq("session_id", session_id).execute()
        if existing_check.data:
            plan_record["updated_at"] = datetime.now(timezone.utc).isoformat()
            result = supabase.table("action_plans").update(plan_record).eq("session_id", session_id).execute()
        else:
            plan_record["created_at"] = datetime.now(timezone.utc).isoformat()
            result = supabase.table("action_plans").insert(plan_record).execute()
            
        logger.info(f"Plan de acción guardado para {session_id}")
        
        return ActionPlanService._format_response(result.data[0])

    @staticmethod
    async def get_action_plan(session_id: str) -> Optional[dict]:
        """Recupera plan existente o None si no existe."""
        if USE_MOCK:
            return ActionPlanService._mock_action_plan(session_id)
            
        supabase = get_supabase()
        result = supabase.table("action_plans").select("*").eq("session_id", session_id).execute()
        
        if not result.data:
            return None
            
        return ActionPlanService._format_response(result.data[0])

    @staticmethod
    async def _get_plan_context(perfil: dict) -> dict:
        """Obtiene contexto adicional para el plan."""
        try:
            session_id = perfil.get("session_id")
            
            # Obtener top vacantes
            vacantes = await recomendar_jobs(session_id)
            top_vacantes = []
            for v in vacantes[:5]:
                top_vacantes.append({
                    "titulo": v.titulo,
                    "empresa": v.empresa,
                    "score": v.score_compatibilidad,
                    "habilidades_faltantes": v.habilidades_faltantes or []
                })
            
            # Obtener mercado
            ciudad = perfil.get("ciudad")
            dashboard = await obtener_dashboard(ciudad=ciudad)
            
            return {
                "vacantes_recomendadas": top_vacantes,
                "total_vacantes": dashboard.total_vacantes_activas,
                "salario_promedio": dashboard.salario_promedio,
                "ciudad": ciudad,
                "top_sectores": [s.sector for s in dashboard.top_sectores]
            }
        except Exception as e:
            logger.error(f"Error obteniendo contexto para plan: {e}")
            return {
                "vacantes_recomendadas": [],
                "total_vacantes": 0,
                "salario_promedio": None,
                "ciudad": perfil.get("ciudad"),
                "top_sectores": []
            }

    @staticmethod
    async def _generate_with_gemini(perfil: dict, analisis: dict, contexto: dict) -> dict:
        """Llama a Gemini para generar el plan de acción."""
        try:
            # Cargar prompt
            prompt_template = get_prompt("ACTION_PLAN_GENERATOR")
            
            # Preparar variables
            perfil_json = json.dumps(perfil, ensure_ascii=False, indent=2, default=str)
            analisis_json = json.dumps(analisis, ensure_ascii=False, indent=2)
            vacantes_json = json.dumps(contexto["vacantes_recomendadas"], ensure_ascii=False, indent=2)
            
            market_context = {
                "total_vacantes": contexto["total_vacantes"],
                "salario_promedio": contexto["salario_promedio"],
                "top_sectores": contexto["top_sectores"],
                "ciudad": contexto["ciudad"]
            }
            market_context_json = json.dumps(market_context, ensure_ascii=False, indent=2)
            
            # Reemplazar variables
            prompt = prompt_template.replace("{perfil_json}", perfil_json)
            prompt = prompt.replace("{analisis_json}", analisis_json)
            prompt = prompt.replace("{vacantes_json}", vacantes_json)
            prompt = prompt.replace("{market_context_json}", market_context_json)
            
            # Llamar a Gemini
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
            
            plan = json.loads(texto.strip())
            
            logger.info(f"Plan de acción generado exitosamente para {perfil.get('session_id')}")
            return plan
            
        except Exception as e:
            logger.error(f"Error generando plan con Gemini: {e}")
            return ActionPlanService._fallback_plan(perfil, analisis)

    @staticmethod
    def _format_response(db_record: dict) -> dict:
        """Formatea el registro de BD para la respuesta API."""
        return {
            "session_id": db_record["session_id"],
            "plan": {
                "resumen_ejecutivo": db_record["resumen_ejecutivo"],
                "fase_30": json.loads(db_record["fase_30"]) if isinstance(db_record["fase_30"], str) else db_record["fase_30"],
                "fase_60": json.loads(db_record["fase_60"]) if isinstance(db_record["fase_60"], str) else db_record["fase_60"],
                "fase_90": json.loads(db_record["fase_90"]) if isinstance(db_record["fase_90"], str) else db_record["fase_90"],
                "recursos_recomendados": json.loads(db_record["recursos_recomendados"]) if isinstance(db_record["recursos_recomendados"], str) else db_record["recursos_recomendados"],
                "milestones": json.loads(db_record["milestones"]) if isinstance(db_record["milestones"], str) else db_record["milestones"]
            },
            "generado_en": db_record.get("created_at") or db_record.get("updated_at")
        }

    @staticmethod
    def _fallback_plan(perfil: dict, analisis: dict) -> dict:
        """Genera plan básico si Gemini falla."""
        nombre = perfil.get("nombre", "Usuario")
        sectores = perfil.get("sectores_interes", ["tecnología"])
        sector = sectores[0] if sectores else "tecnología"
        
        return {
            "resumen_ejecutivo": f"Plan de acción personalizado para {nombre}. Enfocado en fortalecer habilidades clave y aumentar visibilidad en el mercado laboral.",
            "fase_30": {
                "titulo": "Fundamentos y Preparación",
                "objetivo": "Sentar bases sólidas para tu búsqueda",
                "acciones": [
                    {
                        "semana": 1,
                        "tarea": "Actualizar CV con proyectos recientes",
                        "duracion_estimada": "5 horas",
                        "recursos_necesarios": ["Plantilla CV", "Proyectos destacados"],
                        "como_verificar": "CV completo y profesional"
                    },
                    {
                        "semana": 2,
                        "tarea": f"Optimizar LinkedIn para {sector}",
                        "duracion_estimada": "3 horas",
                        "recursos_necesarios": ["Foto profesional", "Headline optimizado"],
                        "como_verificar": "Perfíl 100% completo"
                    }
                ],
                "metricas": ["CV actualizado", "LinkedIn optimizado"]
            },
            "fase_60": {
                "titulo": "Aplicación y Visibilidad",
                "objetivo": "Aplicar a oportunidades y construir red",
                "acciones": [
                    {
                        "semana": 5,
                        "tarea": "Postular a 10 vacantes relevantes",
                        "duracion_estimada": "8 horas",
                        "recursos_necesarios": ["Cartas de presentación"],
                        "como_verificar": "10 postulaciones enviadas"
                    }
                ],
                "metricas": ["10 postulaciones", "5 contactos nuevos"]
            },
            "fase_90": {
                "titulo": "Consolidación y Oportunidades",
                "objetivo": "Convertir postulaciones en entrevistas",
                "acciones": [
                    {
                        "semana": 9,
                        "tarea": "Preparar para entrevistas técnicas",
                        "duracion_estimada": "10 horas",
                        "recursos_necesarios": ["Preguntas comunes", "Proyectos demo"],
                        "como_verificar": "Simulacro de entrevista exitoso"
                    }
                ],
                "metricas": ["3 entrevistas completadas", "1 oferta recibida"]
            },
            "recursos_recomendados": [
                {
                    "tipo": "curso",
                    "nombre": "LinkedIn Learning - Optimización de Perfil",
                    "descripcion": "Mejora tu presencia profesional",
                    "duracion": "2 horas",
                    "costo_aprox": "Gratis con biblioteca"
                }
            ],
            "milestones": [
                {"dia": 30, "logro": "CV y LinkedIn profesionales"},
                {"dia": 60, "logro": "10 postulaciones enviadas"},
                {"dia": 90, "logro": "Entrevistas programadas"}
            ]
        }

    @staticmethod
    def _mock_action_plan(session_id: str) -> dict:
        """Plan simulado para modo desarrollo."""
        return {
            "session_id": session_id,
            "plan": {
                "resumen_ejecutivo": "Basado en tu perfil de Analista de Datos en Barranquilla, este plan te llevará de candidato junior a profesional competitivo en 90 días. El mercado local tiene alta demanda (87 vacantes en tecnología), pero requiere certificaciones cloud que actualmente no tienes.",
                "fase_30": {
                    "titulo": "Fundamentos y Preparación",
                    "objetivo": "Obtener certificación AWS y actualizar perfil profesional",
                    "acciones": [
                        {
                            "semana": 1,
                            "tarea": "Completar curso AWS Cloud Practitioner",
                            "duracion_estimada": "20 horas",
                            "recursos_necesarios": ["Cuenta AWS", "Guía de estudio AWS", "Exámenes prácticos"],
                            "como_verificar": "Obtener certificación AWS Cloud Practitioner"
                        },
                        {
                            "semana": 2,
                            "tarea": "Actualizar CV con proyectos de datos",
                            "duracion_estimada": "6 horas",
                            "recursos_necesarios": ["Plantilla profesional", "Proyectos de portafolio"],
                            "como_verificar": "CV con 3 proyectos destacados y certificación AWS"
                        },
                        {
                            "semana": 3,
                            "tarea": "Optimizar LinkedIn con keywords de datos",
                            "duracion_estimada": "4 horas",
                            "recursos_necesarios": ["Foto profesional", "Headline optimizado"],
                            "como_verificar": "Perfil aparece en búsquedas de reclutadores"
                        },
                        {
                            "semana": 4,
                            "tarea": "Crear portafolio GitHub con 2 proyectos",
                            "duracion_estimada": "15 horas",
                            "recursos_necesarios": ["Cuenta GitHub", "Proyectos de análisis"],
                            "como_verificar": "Repositorios con README profesional"
                        }
                    ],
                    "metricas": ["Certificación AWS obtenida", "CV actualizado", "LinkedIn 100% completo", "GitHub activo"]
                },
                "fase_60": {
                    "titulo": "Aplicación y Visibilidad",
                    "objetivo": "Postular activamente y construir red profesional",
                    "acciones": [
                        {
                            "semana": 5,
                            "tarea": "Postular a 15 vacantes de datos en Barranquilla",
                            "duracion_estimada": "10 horas",
                            "recursos_necesarios": ["Cartas personalizadas", "Seguimiento"],
                            "como_verificar": "15 aplicaciones enviadas con seguimiento"
                        },
                        {
                            "semana": 6,
                            "tarea": "Participar en Barranqui-IA y networking",
                            "duracion_estimada": "8 horas",
                            "recursos_necesarios": ["Eventos locales", "Tarjetas digitales"],
                            "como_verificar": "10 contactos nuevos en LinkedIn"
                        },
                        {
                            "semana": 7,
                            "tarea": "Preparar elevator pitch y casos de éxito",
                            "duracion_estimada": "5 horas",
                            "recursos_necesarios": ["Storytelling", "Proyectos destacados"],
                            "como_verificar": "Pitch de 2 minutos ensayado"
                        },
                        {
                            "semana": 8,
                            "tarea": "Solicitar informational interviews",
                            "duracion_estimada": "6 horas",
                            "recursos_necesarios": ["Mensajes personalizados", "LinkedIn"],
                            "como_verificar": "3 conversaciones con profesionales"
                        }
                    ],
                    "metricas": ["15 postulaciones", "10 contactos nuevos", "3 informational interviews"]
                },
                "fase_90": {
                    "titulo": "Consolidación y Oportunidades",
                    "objetivo": "Convertir oportunidades en ofertas",
                    "acciones": [
                        {
                            "semana": 9,
                            "tarea": "Practicar entrevistas técnicas (SQL, Python)",
                            "duracion_estimada": "12 horas",
                            "recursos_necesarios": ["LeetCode", "HackerRank", "Simulacros"],
                            "como_verificar": "Resolver 20 problemas de SQL/Python"
                        },
                        {
                            "semana": 10,
                            "tarea": "Preparar portfolio demo interactivo",
                            "duracion_estimada": "15 horas",
                            "recursos_necesarios": ["Streamlit/Dash", "Dataset público"],
                            "como_verificar": "Dashboard interactivo deployado"
                        },
                        {
                            "semana": 11,
                            "tarea": "Seguimiento agresivo a postulaciones",
                            "duracion_estimada": "6 horas",
                            "recursos_necesarios": ["CRM personal", "Mensajes"],
                            "como_verificar": "Seguimiento a 15 aplicaciones"
                        },
                        {
                            "semana": 12,
                            "tarea": "Negociación y decisión de ofertas",
                            "duracion_estimada": "4 horas",
                            "recursos_necesarios": ["Guía de negociación", "Comparador"],
                            "como_verificar": "Evaluación objetiva de ofertas"
                        }
                    ],
                    "metricas": ["3 entrevistas técnicas", "1 portfolio demo", "1+ ofertas recibidas"]
                },
                "recursos_recomendados": [
                    {
                        "tipo": "curso",
                        "nombre": "AWS Cloud Practitioner Essentials",
                        "descripcion": "Fundamentos de cloud computing, requisito en 70% de vacantes",
                        "duracion": "6 semanas",
                        "costo_aprox": "Gratis (voucher educativo)"
                    },
                    {
                        "tipo": "practica",
                        "nombre": "Kaggle Learn - Python & SQL",
                        "descripcion": "Micro-cursos prácticos con datasets reales",
                        "duracion": "4 horas",
                        "costo_aprox": "Gratis"
                    },
                    {
                        "tipo": "comunidad",
                        "nombre": "Data Science Barranquilla (Meetup)",
                        "descripcion": "Networking y talleres mensuales",
                        "duracion": "Eventos mensuales",
                        "costo_aprox": "Gratis"
                    },
                    {
                        "tipo": "certificacion",
                        "nombre": "Google Data Analytics Certificate",
                        "descripcion": "Certificación reconocida internacionalmente",
                        "duracion": "3 meses",
                        "costo_aprox": "$150.000 COP (becas disponibles)"
                    }
                ],
                "milestones": [
                    {"dia": 30, "logro": "CV actualizado con certificación AWS y portafolio GitHub"},
                    {"dia": 60, "logro": "15 postulaciones enviadas y red profesional activa"},
                    {"dia": 90, "logro": "3 entrevistas técnicas completadas y 1+ ofertas en negociación"}
                ]
            },
            "generado_en": datetime.now(timezone.utc).isoformat(),
            "mock": True
        }


# Instancia singleton para uso directo
action_plan_service = ActionPlanService()
