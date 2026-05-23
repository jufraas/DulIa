"""
Datos para gráficas Plan 2: radar perfil vs mercado y timeline del plan de acción.
"""

import os
from datetime import datetime, timezone

from app.models.charts import RadarResponse, TimelineResponse
from app.models.job import JobOut
from app.services import profile_service
from app.services.action_plan_service import action_plan_service
from app.services.jobs_service import recomendar_jobs
from app.services.market_service import obtener_dashboard
from app.services.profile_analysis_service import profile_analysis_service
from app.utils.logger import get_logger

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"

NIVELES_EDUCACION = {
    "bachiller": 25,
    "tecnico": 40,
    "tecnologo": 55,
    "universitario": 75,
    "posgrado": 100,
}


async def obtener_radar(session_id: str) -> RadarResponse | None:
    """Calcula 5 dimensiones comparando perfil vs mercado. None si no hay perfil."""
    perfil = await _cargar_perfil(session_id)
    if not perfil:
        return None

    vacantes = await recomendar_jobs(session_id)
    analisis = await profile_analysis_service.get_analysis(session_id)

    sectores = perfil.get("sectores_interes") or []
    dashboard = await obtener_dashboard(
        ciudad=perfil.get("ciudad"),
        sector=sectores[0] if sectores else None,
    )

    radar = _calcular_radar(perfil, vacantes, dashboard, analisis)
    return RadarResponse(session_id=session_id, radar=radar)


async def obtener_timeline(session_id: str) -> TimelineResponse | None:
    """
    Timeline desde plan de acción 30-60-90.
    None si no hay perfil; lanza ValueError si no hay plan (modo real).
    """
    perfil = await _cargar_perfil(session_id)
    if not perfil:
        return None

    plan_data = await action_plan_service.get_action_plan(session_id)
    if not plan_data:
        raise ValueError("Plan de acción no encontrado")

    plan = plan_data.get("plan", {})
    vacantes = await recomendar_jobs(session_id)
    score_actual = vacantes[0].score_compatibilidad if vacantes else 65
    if score_actual is None:
        score_actual = 65

    hoy = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    fases = [
        {
            "dia": 0,
            "tipo": "inicio",
            "titulo": "Hoy",
            "descripcion": "Comienzas tu plan de acción personalizado",
            "metricas": {
                "score_promedio": score_actual,
                "vacantes_match": len(vacantes),
                "habilidades": len(perfil.get("habilidades") or []),
            },
        }
    ]

    for dia, key, titulo_default in (
        (30, "fase_30", "Fundamentos"),
        (60, "fase_60", "Aplicación"),
        (90, "fase_90", "Consolidación"),
    ):
        fase = plan.get(key) or {}
        if not fase:
            continue
        offset = {30: 10, 60: 15, 90: 20}[dia]
        fases.append(
            {
                "dia": dia,
                "tipo": "milestone",
                "titulo": f"Día {dia}: {fase.get('titulo', titulo_default)}",
                "descripcion": fase.get("objetivo", ""),
                "metricas_esperadas": {
                    "score_promedio": min(95, score_actual + offset),
                    "vacantes_match": min(20, len(vacantes) + offset // 2),
                    "habilidades": len(perfil.get("habilidades") or []) + offset // 5,
                },
                "acciones_completadas": [
                    a.get("tarea", "")
                    for a in (fase.get("acciones") or [])[:3]
                    if a.get("tarea")
                ],
            }
        )

    score_objetivo = min(95, score_actual + 20)
    timeline = {
        "inicio": hoy,
        "fases": fases,
        "proyeccion": {
            "descripcion": (
                f"Con este plan, esperamos aumentar tu score de compatibilidad "
                f"de {score_actual} a {score_objetivo} en 90 días"
            ),
            "tasa_crecimiento_semanal": round((score_objetivo - score_actual) / 12, 1),
        },
    }

    return TimelineResponse(session_id=session_id, timeline=timeline)


async def _cargar_perfil(session_id: str) -> dict | None:
    """Perfil como dict; en mock devuelve perfil de ejemplo."""
    if USE_MOCK:
        return _mock_perfil(session_id)

    perfil_out = await profile_service.obtener_perfil(session_id)
    if not perfil_out:
        return None
    return perfil_out.model_dump()


def _mock_perfil(session_id: str) -> dict:
    return {
        "id": "mock-id",
        "session_id": session_id,
        "nombre": "María Demo",
        "ciudad": "Barranquilla",
        "departamento": "Atlántico",
        "nivel_educativo": "universitario",
        "carrera": "Ingeniería de Sistemas",
        "experiencia_anios": 1.0,
        "habilidades": ["python", "excel", "sql"],
        "sectores_interes": ["tecnología"],
        "modalidad": "hibrido",
    }


def _calcular_radar(perfil: dict, vacantes: list[JobOut], dashboard, analisis: dict | None):
    """Scores 0-100 en 5 dimensiones."""
    habilidades_usuario = {s.lower() for s in (perfil.get("habilidades") or [])}
    habilidades_demandadas: set[str] = set()
    for v in vacantes[:15]:
        habilidades_demandadas.update(s.lower() for s in (v.habilidades_requeridas or []))

    if habilidades_demandadas:
        match = len(habilidades_usuario & habilidades_demandadas)
        score_habilidades = min(100, round((match / max(5, len(habilidades_demandadas))) * 100))
    else:
        score_habilidades = 65

    exp_usuario = float(perfil.get("experiencia_anios") or 0)
    exp_requeridas = [float(v.experiencia_requerida) for v in vacantes if v.experiencia_requerida]
    if exp_requeridas:
        exp_promedio = sum(exp_requeridas) / len(exp_requeridas)
        score_experiencia = (
            90 if exp_usuario >= exp_promedio
            else min(90, round((exp_usuario / max(1, exp_promedio)) * 90))
        )
    else:
        score_experiencia = 60 if exp_usuario >= 1 else 50

    nivel_usuario = NIVELES_EDUCACION.get(perfil.get("nivel_educativo") or "", 50)
    niveles_req = [
        NIVELES_EDUCACION.get(v.nivel_educativo_req or "", 60)
        for v in vacantes
        if v.nivel_educativo_req
    ]
    if niveles_req:
        nivel_promedio = sum(niveles_req) / len(niveles_req)
        score_educacion = (
            95 if nivel_usuario >= nivel_promedio
            else min(95, round((nivel_usuario / nivel_promedio) * 95))
        )
    else:
        score_educacion = 65

    ciudad_perfil = (perfil.get("ciudad") or "").lower().strip()
    modalidad = (perfil.get("modalidad") or "").lower()
    ubicacion_match = any(
        (v.ciudad or "").lower().strip() == ciudad_perfil
        for v in vacantes[:10]
        if v.ciudad and ciudad_perfil
    )
    if modalidad in ("remoto", "hibrido", "indiferente"):
        score_ubicacion = 95 if ubicacion_match else 85
    elif ubicacion_match:
        score_ubicacion = 90
    else:
        score_ubicacion = 45

    if analisis and analisis.get("analisis"):
        score_preparacion = (
            analisis["analisis"].get("nivel_preparacion") or {}
        ).get("overall", 65)
    else:
        score_preparacion = 65

    # Referencia mercado: defaults del plan + ajuste si hay salario en dashboard
    mercado_habilidades = 70
    mercado_exp = 60
    mercado_edu = 75
    mercado_ubicacion = 80
    if dashboard.total_vacantes_activas > 0 and dashboard.salario_promedio:
        mercado_habilidades = min(85, 65 + dashboard.total_vacantes_activas // 20)

    return {
        "usuario": {
            "habilidades_tecnicas": score_habilidades,
            "experiencia": score_experiencia,
            "educacion": score_educacion,
            "ubicacion_modalidad": score_ubicacion,
            "preparacion": int(score_preparacion),
        },
        "mercado_promedio": {
            "habilidades_tecnicas": mercado_habilidades,
            "experiencia": mercado_exp,
            "educacion": mercado_edu,
            "ubicacion_modalidad": mercado_ubicacion,
            "preparacion": 65,
        },
        "descripcion_dimensiones": {
            "habilidades_tecnicas": "Alineación de tus skills con la demanda actual del mercado",
            "experiencia": "Tu experiencia vs el promedio requerido en vacantes",
            "educacion": "Nivel educativo vs estándares del sector",
            "ubicacion_modalidad": "Ventaja geográfica y flexibilidad laboral",
            "preparacion": "Madurez profesional basada en análisis de tu perfil",
        },
    }
