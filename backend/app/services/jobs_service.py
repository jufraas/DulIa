import os
from app.db.supabase import get_supabase
from app.models.job import JobOut, ScoreBreakdown, ScoreOut
from app.utils.logger import get_logger

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"

# Orden jerárquico de niveles educativos para comparar
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

    # Cargar perfil
    perfil_res = supabase.table("profiles").select("*").eq("session_id", session_id).execute()
    if not perfil_res.data:
        logger.warning(f"Perfil no encontrado para session_id={session_id}")
        return []
    perfil = perfil_res.data[0]

    # Cargar vacantes activas y no rojas
    jobs_res = (
        supabase.table("jobs")
        .select("*")
        .eq("activo", True)
        .neq("semaforo", "red")
        .execute()
    )
    jobs = jobs_res.data
    logger.info(f"Calculando score para {len(jobs)} vacantes — session_id={session_id}")

    # Calcular score para cada vacante y ordenar
    resultados = []
    for job in jobs:
        job_out, score_out = _calcular_score(perfil, job)
        job_out.score_compatibilidad = score_out.score
        job_out.habilidades_match = _skills_match(perfil, job)
        job_out.habilidades_faltantes = _skills_faltantes(perfil, job)
        resultados.append((score_out.score, job_out))

    resultados.sort(key=lambda x: x[0], reverse=True)
    return [j for _, j in resultados[:TOP_N]]


def _calcular_score(perfil: dict, job: dict) -> tuple[JobOut, ScoreOut]:
    """Calcula el score 0-100 para un par perfil-vacante."""

    # ── 1. Skills (40 pts) ───────────────────────────────────────────────────
    skills_req = [s.lower() for s in (job.get("habilidades_requeridas") or [])]
    skills_perfil = [s.lower() for s in (perfil.get("habilidades") or [])]

    if skills_req:
        match_ratio = len(set(skills_perfil) & set(skills_req)) / len(skills_req)
    else:
        match_ratio = 1.0  # si la vacante no pide nada específico, puntuación completa

    pts_skills = round(match_ratio * 40)

    # ── 2. Ciudad (20 pts) ───────────────────────────────────────────────────
    ciudad_perfil = (perfil.get("ciudad") or "").lower().strip()
    ciudad_job = (job.get("ciudad") or "").lower().strip()
    depto_perfil = (perfil.get("departamento") or "").lower().strip()
    depto_job = (job.get("departamento") or "").lower().strip()
    modalidad_job = (job.get("modalidad") or "").lower()

    if modalidad_job == "remoto":
        pts_ciudad = 20  # remoto aplica para cualquier ciudad
    elif ciudad_perfil and ciudad_job and ciudad_perfil == ciudad_job:
        pts_ciudad = 20
    elif depto_perfil and depto_job and depto_perfil == depto_job:
        pts_ciudad = 10
    else:
        pts_ciudad = 0

    # ── 3. Experiencia (25 pts) ──────────────────────────────────────────────
    exp_usuario = float(perfil.get("experiencia_anios") or 0)
    exp_req = float(job.get("experiencia_requerida") or 0)

    if exp_usuario >= exp_req:
        pts_exp = 25
    else:
        brecha = exp_req - exp_usuario
        # descuento lineal: cada año faltante quita 25/3 ≈ 8.3 pts; máx penalización a los 3 años
        pts_exp = max(0, round(25 - (brecha / 3) * 25))

    # ── 4. Nivel educativo (15 pts) ──────────────────────────────────────────
    nivel_usuario = NIVEL_ORDEN.get(perfil.get("nivel_educativo") or "", 0)
    nivel_req = NIVEL_ORDEN.get(job.get("nivel_educativo_req") or "", 0)

    if nivel_usuario >= nivel_req:
        pts_edu = 15
    elif nivel_usuario == nivel_req - 1:
        pts_edu = 8   # un nivel abajo
    else:
        pts_edu = 0

    score_total = pts_skills + pts_ciudad + pts_exp + pts_edu

    job_out = JobOut(
        id=str(job["id"]),
        titulo=job["titulo"],
        empresa=job["empresa"],
        ciudad=job.get("ciudad"),
        departamento=job.get("departamento"),
        salario_min=job.get("salario_min"),
        salario_max=job.get("salario_max"),
        habilidades_requeridas=job.get("habilidades_requeridas") or [],
        sector=job.get("sector"),
        experiencia_requerida=float(job.get("experiencia_requerida") or 0),
        nivel_educativo_req=job.get("nivel_educativo_req"),
        modalidad=job.get("modalidad"),
        semaforo=job.get("semaforo", "green"),
        descripcion=job.get("descripcion"),
        publicado_at=job.get("publicado_at"),
    )

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


def _generar_recomendaciones(pts_skills: int, pts_ciudad: int, pts_exp: int, pts_edu: int, job: dict) -> list[str]:
    """Genera recomendaciones accionables para subir el score."""
    recs = []
    skills_req = job.get("habilidades_requeridas") or []

    if pts_skills < 20 and skills_req:
        faltantes = skills_req[:3]  # máximo 3 sugerencias
        recs.append(f"Aprende: {', '.join(faltantes)}")
    if pts_ciudad == 0:
        modalidad = job.get("modalidad", "presencial")
        if modalidad == "presencial":
            recs.append(f"Esta vacante es presencial en {job.get('ciudad', 'otra ciudad')}")
        else:
            recs.append("Considera modalidad híbrida o remoto para más opciones")
    if pts_exp < 15:
        recs.append(f"Te faltan años de experiencia — busca proyectos o prácticas en {job.get('sector', 'tu área')}")
    if pts_edu == 0:
        recs.append(f"El cargo requiere {job.get('nivel_educativo_req', 'mayor nivel educativo')}")

    return recs


def _skills_match(perfil: dict, job: dict) -> list[str]:
    skills_req = set(s.lower() for s in (job.get("habilidades_requeridas") or []))
    skills_perfil = set(s.lower() for s in (perfil.get("habilidades") or []))
    return sorted(skills_req & skills_perfil)


def _skills_faltantes(perfil: dict, job: dict) -> list[str]:
    skills_req = set(s.lower() for s in (job.get("habilidades_requeridas") or []))
    skills_perfil = set(s.lower() for s in (perfil.get("habilidades") or []))
    return sorted(skills_req - skills_perfil)


def _mock_jobs() -> list[JobOut]:
    """Devuelve vacantes mock para desarrollo sin Supabase."""
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
