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

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"


class ProfileAnalysisService:
    """Servicio para generar análisis enriquecido del perfil con IA."""

    @staticmethod
    async def analyze_profile(session_id: str, force_regenerate: bool = False) -> dict:
        """
        Genera o recupera análisis enriquecido del perfil.
        
        Args:
            session_id: UUID del usuario
            force_regenerate: Si True, regenera aunque exista
            
        Returns:
            dict con el análisis completo
        """
        if USE_MOCK:
            logger.info(f"[MOCK] Análisis de perfil simulado para {session_id}")
            return ProfileAnalysisService._mock_analysis(session_id)

        supabase = get_supabase()
        
        # Verificar si ya existe análisis
        if not force_regenerate:
            existing = supabase.table("profile_analysis").select("*").eq("session_id", session_id).execute()
            if existing.data:
                logger.info(f"Análisis existente encontrado para {session_id}")
                return ProfileAnalysisService._format_response(existing.data[0])

        # Obtener perfil
        perfil_res = supabase.table("profiles").select("*").eq("session_id", session_id).execute()
        if not perfil_res.data:
            raise ValueError(f"Perfil no encontrado: {session_id}")
        perfil = perfil_res.data[0]

        # Obtener contexto del mercado
        mercado_data = await ProfileAnalysisService._get_market_context(perfil)
        
        # Generar análisis con Gemini
        analisis = await ProfileAnalysisService._generate_with_gemini(perfil, mercado_data)
        
        # Guardar en BD
        analysis_record = {
            "session_id": session_id,
            "fortalezas": analisis["fortalezas"],
            "debilidades": analisis["debilidades"],
            "gaps_mercado": analisis["gaps_mercado"],
            "oportunidades": analisis["oportunidades"],
            "nivel_preparacion": analisis["nivel_preparacion"],
            "recomendaciones": analisis["recomendaciones"],
            "raw_gemini_response": json.dumps(analisis, ensure_ascii=False),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        
        # Upsert (insertar o actualizar)
        existing_check = supabase.table("profile_analysis").select("id").eq("session_id", session_id).execute()
        if existing_check.data:
            result = supabase.table("profile_analysis").update(analysis_record).eq("session_id", session_id).execute()
        else:
            analysis_record["created_at"] = datetime.now(timezone.utc).isoformat()
            result = supabase.table("profile_analysis").insert(analysis_record).execute()
            
        logger.info(f"Análisis guardado para {session_id}")
        
        return ProfileAnalysisService._format_response(result.data[0])

    @staticmethod
    async def get_analysis(session_id: str) -> Optional[dict]:
        """Recupera análisis existente o None si no existe."""
        if USE_MOCK:
            return ProfileAnalysisService._mock_analysis(session_id)
            
        supabase = get_supabase()
        result = supabase.table("profile_analysis").select("*").eq("session_id", session_id).execute()
        
        if not result.data:
            return None
            
        return ProfileAnalysisService._format_response(result.data[0])

    @staticmethod
    async def _get_market_context(perfil: dict) -> dict:
        """Obtiene datos de mercado relevantes para el perfil."""
        try:
            ciudad = perfil.get("ciudad")
            sectores = perfil.get("sectores_interes", [])
            sector = sectores[0] if sectores else None
            
            # Obtener dashboard de mercado
            dashboard = await obtener_dashboard(ciudad=ciudad, sector=sector)
            
            # Obtener vacantes recomendadas para extraer habilidades demandadas
            # Nota: Esto podría ser costoso, considerar cachear
            from app.services.jobs_service import recomendar_jobs
            vacantes = await recomendar_jobs(perfil.get("session_id"))
            
            # Extraer habilidades demandadas de las vacantes
            habilidades_demandadas = set()
            job_scores = []
            for v in vacantes[:10]:  # Top 10
                habilidades_demandadas.update(v.habilidades_requeridas or [])
                if v.score_compatibilidad is not None:
                    job_scores.append(v.score_compatibilidad)
            
            avg_job_score = round(sum(job_scores) / len(job_scores)) if job_scores else None

            return {
                "top_sectores": [s.sector for s in dashboard.top_sectores],
                "total_vacantes": dashboard.total_vacantes_activas,
                "salario_promedio": dashboard.salario_promedio,
                "ciudad": ciudad,
                "habilidades_demandadas": list(habilidades_demandadas)[:20],
                "num_vacantes_recomendadas": len(vacantes),
                "avg_job_score": avg_job_score,
            }
        except Exception as e:
            logger.error(f"Error obteniendo contexto de mercado: {e}")
            return {
                "top_sectores": [],
                "total_vacantes": 0,
                "salario_promedio": None,
                "ciudad": perfil.get("ciudad"),
                "habilidades_demandadas": [],
                "num_vacantes_recomendadas": 0,
                "avg_job_score": None,
            }

    @staticmethod
    async def _generate_with_gemini(perfil: dict, mercado: dict) -> dict:
        """Llama a Gemini para generar el análisis."""
        try:
            # Cargar prompt
            prompt_template = get_prompt("PROFILE_ANALYSIS")
            
            # Preparar variables
            perfil_json = json.dumps(perfil, ensure_ascii=False, indent=2, default=str)
            top_sectores = ", ".join(mercado["top_sectores"]) if mercado["top_sectores"] else "Datos limitados"
            total_vacantes = mercado["total_vacantes"]
            salario_promedio = mercado["salario_promedio"] or "No disponible"
            
            # Reemplazar variables en el prompt
            prompt = prompt_template.replace("{perfil_json}", perfil_json)
            prompt = prompt.replace("{top_sectores}", top_sectores)
            prompt = prompt.replace("{total_vacantes}", str(total_vacantes))
            prompt = prompt.replace("{salario_promedio}", str(salario_promedio))
            
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
            
            analisis = json.loads(texto.strip())
            
            logger.info(f"Análisis generado exitosamente para {perfil.get('session_id')}")
            return analisis
            
        except Exception as e:
            logger.error(f"Error generando análisis con Gemini: {e}")
            # Fallback: generar análisis básico
            return ProfileAnalysisService._fallback_analysis(perfil, mercado)

    @staticmethod
    def _format_response(db_record: dict) -> dict:
        """Formatea el registro de BD para la respuesta API."""
        return {
            "session_id": db_record["session_id"],
            "analisis": {
                "fortalezas": json.loads(db_record["fortalezas"]) if isinstance(db_record["fortalezas"], str) else db_record["fortalezas"],
                "debilidades": json.loads(db_record["debilidades"]) if isinstance(db_record["debilidades"], str) else db_record["debilidades"],
                "gaps_mercado": json.loads(db_record["gaps_mercado"]) if isinstance(db_record["gaps_mercado"], str) else db_record["gaps_mercado"],
                "oportunidades": json.loads(db_record["oportunidades"]) if isinstance(db_record["oportunidades"], str) else db_record["oportunidades"],
                "nivel_preparacion": json.loads(db_record["nivel_preparacion"]) if isinstance(db_record["nivel_preparacion"], str) else db_record["nivel_preparacion"],
                "recomendaciones": json.loads(db_record["recomendaciones"]) if isinstance(db_record["recomendaciones"], str) else db_record["recomendaciones"]
            },
            "generado_en": db_record.get("created_at") or db_record.get("updated_at")
        }

    @staticmethod
    def _estimate_preparacion_overall(perfil: dict, mercado: dict) -> int:
        """Estima overall sin Gemini: heurística + promedio de vacantes recomendadas."""
        exp = float(perfil.get("experiencia_anios") or 0)
        skills_count = len(perfil.get("habilidades") or [])
        edu = (perfil.get("nivel_educativo") or "").lower()

        base = 30 + min(20, skills_count * 4)
        if edu in ("universitario", "posgrado"):
            base += 10
        elif edu in ("tecnologo", "tecnico"):
            base += 6
        base += min(12, exp * 4)

        avg_jobs = mercado.get("avg_job_score")
        if avg_jobs is not None:
            base = round((base + avg_jobs) / 2)

        return max(25, min(85, round(base / 5) * 5))

    @staticmethod
    def _fallback_analysis(perfil: dict, mercado: dict) -> dict:
        """Genera análisis básico si Gemini falla."""
        habilidades = perfil.get("habilidades", [])
        sectores = perfil.get("sectores_interes", [])
        experiencia = perfil.get("experiencia_anios", 0)
        carrera = perfil.get("carrera") or perfil.get("nivel_educativo") or "formación en curso"
        overall = ProfileAnalysisService._estimate_preparacion_overall(perfil, mercado)
        
        return {
            "fortalezas": [
                {
                    "area": "habilidades_tecnicas" if habilidades else "educacion",
                    "descripcion": (
                        f"Base sólida en {', '.join(habilidades[:4])}."
                        if habilidades
                        else f"Trayectoria académica en {carrera} con buen potencial de crecimiento."
                    ),
                    "nivel": "medio"
                }
            ],
            "debilidades": [
                {
                    "area": "experiencia",
                    "descripcion": (
                        f"Con {experiencia} años de experiencia, conviene sumar proyectos prácticos o prácticas."
                        if experiencia
                        else "Aún sin experiencia laboral formal; prioriza portafolio y proyectos reales."
                    ),
                    "impacto": "medio"
                }
            ],
            "gaps_mercado": [],
            "oportunidades": [
                {
                    "sector": sectores[0] if sectores else "tecnologia",
                    "razon": "Sector con demanda en tu ciudad",
                    "potencial": "medio",
                    "accion_inmediata": "Postula a roles junior"
                }
            ],
            "nivel_preparacion": {
                "overall": overall,
                "descripcion": (
                    "Perfil en desarrollo con buenas bases; refuerza experiencia práctica para subir el match."
                    if overall < 55
                    else "Perfil competitivo para roles junior; sigue fortaleciendo habilidades clave del mercado."
                ),
                "comparativa": "Estimado según habilidades, educación y vacantes compatibles en cache"
            },
            "recomendaciones": [
                "Busca proyectos freelance para ganar experiencia",
                "Actualiza tu LinkedIn con tus habilidades",
                "Participa en comunidades de tu sector"
            ]
        }

    @staticmethod
    def _mock_analysis(session_id: str) -> dict:
        """Análisis simulado para modo desarrollo."""
        return {
            "session_id": session_id,
            "analisis": {
                "fortalezas": [
                    {
                        "area": "habilidades_tecnicas",
                        "descripcion": "Fuerte base en Python y análisis de datos",
                        "nivel": "alto"
                    },
                    {
                        "area": "educacion",
                        "descripcion": "Formación universitaria completa",
                        "nivel": "alto"
                    }
                ],
                "debilidades": [
                    {
                        "area": "experiencia",
                        "descripcion": "1 año de experiencia, busca proyectos prácticos",
                        "impacto": "medio"
                    },
                    {
                        "area": "habilidades_tecnicas",
                        "descripcion": "Sin experiencia en cloud (AWS/Azure)",
                        "impacto": "alto"
                    }
                ],
                "gaps_mercado": [
                    {
                        "habilidad": "cloud aws",
                        "demanda": "alta",
                        "tu_nivel": "inexistente",
                        "brecha": "El 70% de vacantes requieren cloud"
                    },
                    {
                        "habilidad": "docker",
                        "demanda": "media",
                        "tu_nivel": "bajo",
                        "brecha": "Habilidad diferenciadora para equipos técnicos"
                    }
                ],
                "oportunidades": [
                    {
                        "sector": "tecnología",
                        "razon": "Alta demanda de analistas en Barranquilla",
                        "potencial": "alto",
                        "accion_inmediata": "Postula a roles junior de datos"
                    },
                    {
                        "sector": "fintech",
                        "razon": "Tus habilidades encajan bien",
                        "potencial": "medio",
                        "accion_inmediata": "Busca startups locales"
                    }
                ],
                "nivel_preparacion": {
                    "overall": 72,
                    "descripcion": "Preparado para roles junior con mentoría",
                    "comparativa": "En el percentil 65 vs jóvenes similares"
                },
                "recomendaciones": [
                    "Toma el curso AWS Cloud Practitioner (gratis para estudiantes)",
                    "Participa en hackatones locales",
                    "Actualiza tu LinkedIn con proyectos de datos"
                ]
            },
            "generado_en": datetime.now(timezone.utc).isoformat(),
            "mock": True
        }


# Instancia singleton para uso directo
profile_analysis_service = ProfileAnalysisService()
