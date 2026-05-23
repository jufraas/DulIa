import os

from app.db.jobs_row import normalize_job_row, job_city, job_department
from app.db.supabase import get_supabase
from app.models.job import JobOut, ScoreBreakdown, ScoreOut
from app.services.job_mapper import row_to_job_out
from app.utils.logger import get_logger

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"

NIVEL_ORDEN = {
    "bachiller": 0,
    "tecnico": 1,
    "tecnologo": 2,
    "universitario": 3,
    "posgrado": 4,
}

TOP_N = 20


async def recomendar_jobs(session_id: str) -> list[JobOut]:
    """
    Lee el perfil del usuario y las vacantes activas de Supabase,
    calcula el score de compatibilidad y devuelve el top 20.
    """
    if USE_MOCK:
        return _mock_jobs()

    supabase = get_supabase()

    perfil_res = supabase.table("profiles").select("*").eq("session_id", session_id).execute()
    if not perfil_res.data:
        logger.warning(f"Perfil no encontrado para session_id={session_id}")
        return []
    perfil = perfil_res.data[0]

    jobs_res = (
        supabase.table("jobs")
        .select("*")
        .eq("active", True)
        .neq("status", "red")
        .execute()
    )
    jobs = jobs_res.data
    logger.info(f"Calculando score para {len(jobs)} vacantes — session_id={session_id}")

    resultados = []
    for raw in jobs:
        job_out, score_out = _calcular_score(perfil, raw)
        job_out.score_compatibilidad = score_out.score
        job_out.habilidades_match = _skills_match(perfil, raw)
        job_out.habilidades_faltantes = _skills_faltantes(perfil, raw)
        resultados.append((score_out.score, job_out))

    resultados.sort(key=lambda x: x[0], reverse=True)
    return [j for _, j in resultados[:TOP_N]]


def _calcular_score(perfil: dict, raw_job: dict) -> tuple[JobOut, ScoreOut]:
    """Calcula el score 0-100 para un par perfil-vacante (columnas EN en BD)."""
    job = normalize_job_row(raw_job)

    skills_req = [s.lower() for s in (job.get("skills_required") or [])]
    skills_perfil = [s.lower() for s in (perfil.get("habilidades") or [])]

    if skills_req:
        match_ratio = len(set(skills_perfil) & set(skills_req)) / len(skills_req)
    else:
        match_ratio = 1.0

    pts_skills = round(match_ratio * 40)

    ciudad_perfil = (perfil.get("ciudad") or "").lower().strip()
    ciudad_job = job_city(raw_job).lower()
    depto_perfil = (perfil.get("departamento") or "").lower().strip()
    depto_job = job_department(raw_job).lower()
    modalidad_job = (job.get("modality") or "").lower()

    if modalidad_job == "remoto":
        pts_ciudad = 20
    elif ciudad_perfil and ciudad_job and ciudad_perfil == ciudad_job:
        pts_ciudad = 20
    elif depto_perfil and depto_job and depto_perfil == depto_job:
        pts_ciudad = 10
    else:
        pts_ciudad = 0

    exp_usuario = float(perfil.get("experiencia_anios") or 0)
    exp_req = float(job.get("experience_required") or 0)

    if exp_usuario >= exp_req:
        pts_exp = 25
    else:
        brecha = exp_req - exp_usuario
        pts_exp = max(0, round(25 - (brecha / 3) * 25))

    nivel_usuario = NIVEL_ORDEN.get(perfil.get("nivel_educativo") or "", 0)
    nivel_req = NIVEL_ORDEN.get(job.get("education_level_req") or "", 0)

    if nivel_usuario >= nivel_req:
        pts_edu = 15
    elif nivel_usuario == nivel_req - 1:
        pts_edu = 8
    else:
        pts_edu = 0

    score_total = pts_skills + pts_ciudad + pts_exp + pts_edu

    job_out = row_to_job_out(raw_job)

    score_out = ScoreOut(
        job_id=str(job["id"]),
        profile_id=str(perfil["id"]),
        score=score_total,
        breakdown=ScoreBreakdown(
            skills=pts_skills,
            ciudad=pts_ciudad,
            experiencia=pts_exp,
            educacion=pts_edu,
        ),
        recomendaciones=_generar_recomendaciones(pts_skills, pts_ciudad, pts_exp, pts_edu, job),
    )

    return job_out, score_out


def _generar_recomendaciones(
    pts_skills: int, pts_ciudad: int, pts_exp: int, pts_edu: int, job: dict
) -> list[str]:
    recs = []
    skills_req = job.get("skills_required") or []

    if pts_skills < 20 and skills_req:
        recs.append(f"Aprende: {', '.join(skills_req[:3])}")
    if pts_ciudad == 0:
        modalidad = job.get("modality", "presencial")
        if modalidad == "presencial":
            ciudad = job.get("city") or job.get("location") or "otra ciudad"
            recs.append(f"Esta vacante es presencial en {ciudad}")
        else:
            recs.append("Considera modalidad híbrida o remoto para más opciones")
    if pts_exp < 15:
        recs.append(
            f"Te faltan años de experiencia — busca proyectos o prácticas en {job.get('sector', 'tu área')}"
        )
    if pts_edu == 0:
        recs.append(
            f"El cargo requiere {job.get('education_level_req', 'mayor nivel educativo')}"
        )

    return recs


def _skills_match(perfil: dict, raw_job: dict) -> list[str]:
    job = normalize_job_row(raw_job)
    skills_req = set(s.lower() for s in (job.get("skills_required") or []))
    skills_perfil = set(s.lower() for s in (perfil.get("habilidades") or []))
    return sorted(skills_req & skills_perfil)


def _skills_faltantes(perfil: dict, raw_job: dict) -> list[str]:
    job = normalize_job_row(raw_job)
    skills_req = set(s.lower() for s in (job.get("skills_required") or []))
    skills_perfil = set(s.lower() for s in (perfil.get("habilidades") or []))
    return sorted(skills_req - skills_perfil)


def _mock_jobs() -> list[JobOut]:
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    return [
        JobOut(
            id="mock-job-001",
            titulo="Desarrollador Backend Python",
            empresa="Sophos Solutions",
            ciudad="Barranquilla",
            departamento="Atlántico",
            salario_min=2500000,
            salario_max=3500000,
            habilidades_requeridas=["python", "fastapi", "postgresql", "git"],
            sector="tecnología",
            experiencia_requerida=1.0,
            nivel_educativo_req="universitario",
            modalidad="hibrido",
            semaforo="green",
            descripcion="Backend con Python para proyectos fintech.",
            publicado_at=now,
            score_compatibilidad=84,
            habilidades_match=["python", "fastapi"],
            habilidades_faltantes=["postgresql"],
        ),
        JobOut(
            id="mock-job-002",
            titulo="Analista de Datos Junior",
            empresa="Bancolombia",
            ciudad="Barranquilla",
            departamento="Atlántico",
            salario_min=2800000,
            salario_max=4000000,
            habilidades_requeridas=["python", "sql", "excel", "power bi"],
            sector="fintech",
            experiencia_requerida=1.0,
            nivel_educativo_req="universitario",
            modalidad="hibrido",
            semaforo="green",
            descripcion="Análisis de datos transaccionales regional Caribe.",
            publicado_at=now,
            score_compatibilidad=72,
            habilidades_match=["python", "sql", "excel"],
            habilidades_faltantes=["power bi"],
        ),
    ]
