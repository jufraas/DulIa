import os
import unicodedata
from datetime import datetime, timedelta, timezone

from app.db.jobs_row import normalize_job_row, job_city, job_department
from app.db.supabase import get_supabase
from app.models.job import JobOut, ScoreBreakdown, ScoreOut
from app.services.job_mapper import row_to_job_out
from app.services.queue_service import request_scrape
from app.utils.logger import get_logger

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"
FRESH_HORIZON_HOURS = int(os.getenv("FRESH_HORIZON_HOURS", "48"))
MIN_FRESH_JOBS = int(os.getenv("MIN_FRESH_JOBS", "10"))

NIVEL_ORDEN = {
    "bachiller": 0,
    "tecnico": 1,
    "tecnologo": 2,
    "universitario": 3,
    "posgrado": 4,
}

TOP_N = int(os.getenv("RECOMMENDED_TOP_N", "0"))  # 0 = todas las compatibles scoreadas
SENIORITY_TOLERANCE = 2  # años de holgura exp_req vs perfil (perfiles junior)
YOUTH_BOOST = 5
JUNIOR_EXP_THRESHOLD = 2.0
SKILLS_MAX_PTS = 40
SKILLS_EMPTY_PTS = 15
CIUDAD_REMOTO_PTS = 15
CIUDAD_EXACTA_PTS = 20
CIUDAD_DEPTO_PTS = 10
SECTOR_MATCH_PTS = 10

_SENIOR_TITLE_MARKERS = (
    "senior",
    "sr ",
    "sr.",
    " ssr",
    "lead",
    "tech lead",
    "team lead",
    "manager",
    "director",
    "head of",
    "principal",
    "staff ",
    "architect",
    "vp ",
    "vice president",
)

_JUNIOR_TITLE_MARKERS = (
    "junior",
    "jr ",
    "jr.",
    "entry level",
    "entry-level",
    "trainee",
    "intern",
    "graduate",
    "no experience",
    "new grad",
    "practicante",
    "becario",
    "estudiante",
)


async def recomendar_jobs(session_id: str) -> list[JobOut]:
    """
    Lee el perfil del usuario y las vacantes activas de Supabase,
    calcula el score de compatibilidad y devuelve el top N (default 50).
    Sector y ciudad influyen en el score, no excluyen vacantes del listado.
    """
    if USE_MOCK:
        return _mock_jobs()

    supabase = get_supabase()

    perfil_res = supabase.table("profiles").select("*").eq("session_id", session_id).execute()
    if not perfil_res.data:
        logger.warning(f"Perfil no encontrado para session_id={session_id}")
        return []
    perfil = perfil_res.data[0]

    jobs, encolado = _prepare_jobs_pool(perfil, supabase)
    compatible = [raw for raw in jobs if _seniority_compatible(perfil, raw)]
    excluded = len(jobs) - len(compatible)
    if excluded:
        logger.info(
            f"Filtro seniority: {excluded} vacantes excluidas — session_id={session_id}"
        )
    if not compatible:
        logger.warning(
            f"Sin vacantes compatibles por seniority — session_id={session_id}"
        )
        return []

    logger.info(
        f"Calculando score para {len(compatible)} vacantes — session_id={session_id}, "
        f"encolado={encolado}"
    )

    resultados = []
    for raw in compatible:
        job_out, score_out = _calcular_score(perfil, raw)
        job_out.score_compatibilidad = score_out.score
        job_out.habilidades_match = _skills_match(perfil, raw)
        job_out.habilidades_faltantes = _skills_faltantes(perfil, raw)
        resultados.append((score_out.score, job_out))

    resultados.sort(key=lambda x: x[0], reverse=True)
    limit = TOP_N if TOP_N > 0 else len(resultados)
    return [j for _, j in resultados[:limit]]


def _perfil_sector(perfil: dict) -> str | None:
    sectores = perfil.get("sectores_interes") or []
    return sectores[0] if sectores else None


def _normalize_text(value: str) -> str:
    text = (value or "").strip().lower()
    return "".join(
        c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn"
    )


# Palabras clave por sector de perfil (sin acentos) para match flexible en title/desc/sector del job
_SECTOR_KEYWORDS: dict[str, set[str]] = {
    "tecnologia": {
        "tecnologia",
        "technology",
        "programming",
        "software",
        "developer",
        "desarrollador",
        "devops",
        "data",
        "mobile",
        "machine learning",
        "sysadmin",
        "qa",
        "tech",
        "ingenier",
        "analista",
        "automatizacion",
        "ia",
        "scraping",
        "engineer",
        "engineering",
        "full stack",
        "fullstack",
        "backend",
        "frontend",
        "innovation",
    },
    "ux": {
        "ux",
        "user experience",
        "ui",
        "ui/ux",
        "product design",
        "figma",
        "designer",
        "design",
    },
    "fintech": {"fintech", "finance", "banco", "bank", "pagos", "payments"},
    "marketing": {"marketing", "growth", "content", "seo", "social"},
    "agricultura": {"agricultura", "agro", "agriculture", "farm", "campo"},
}

# Sectores que el LLM puede devolver en inglés → clave canónica en _SECTOR_KEYWORDS
_SECTOR_ALIASES: dict[str, str] = {
    "technology": "tecnologia",
    "tech": "tecnologia",
    "software": "tecnologia",
    "software engineering": "tecnologia",
    "information technology": "tecnologia",
    "innovation": "tecnologia",
    "user experience": "ux",
    "operational efficiency": "tecnologia",
}


def _sector_keywords(sector: str) -> set[str]:
    canonical = _SECTOR_ALIASES.get(sector, sector)
    base = _SECTOR_KEYWORDS.get(canonical, _SECTOR_KEYWORDS.get(sector, set()))
    return base | {sector, canonical}


def _sector_matches(perfil_sector: str, haystack: str) -> bool:
    sector = _normalize_text(perfil_sector)
    text = _normalize_text(haystack)
    if not sector:
        return True
    if sector in text:
        return True
    keywords = _sector_keywords(sector)
    return any(kw in text for kw in keywords)


def _freshness_cutoff() -> datetime:
    return datetime.now(timezone.utc) - timedelta(hours=FRESH_HORIZON_HOURS)


def _parse_scraped_at(raw_job: dict) -> datetime | None:
    raw = raw_job.get("scraped_at")
    if not raw:
        return None
    if isinstance(raw, datetime):
        dt = raw
    else:
        try:
            dt = datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _is_fresh(raw_job: dict, cutoff: datetime) -> bool:
    scraped = _parse_scraped_at(raw_job)
    return scraped is not None and scraped >= cutoff


def _matches_profile(raw_job: dict, perfil: dict) -> bool:
    """Filtro flexible por ciudad/sector del perfil (incluye remoto como match de ciudad)."""
    job = normalize_job_row(raw_job)
    ciudad = _normalize_text(perfil.get("ciudad") or "")
    sectores = [_normalize_text(s) for s in (perfil.get("sectores_interes") or []) if s]

    if not ciudad and not sectores:
        return True

    sector_ok = True
    if sectores:
        haystack = " ".join(
            [
                job.get("sector") or "",
                job.get("title") or "",
                job.get("description") or "",
            ]
        )
        sector_ok = any(_sector_matches(s, haystack) for s in sectores)

    city_ok = True
    if ciudad:
        jc = _normalize_text(job_city(raw_job))
        modality = _normalize_text(job.get("modality") or "")
        city_ok = modality == "remoto" or (bool(jc) and (ciudad in jc or jc in ciudad))

    return sector_ok and city_ok


def _fetch_active_jobs(supabase) -> list[dict]:
    res = (
        supabase.table("jobs")
        .select("*")
        .eq("active", True)
        .neq("status", "red")
        .execute()
    )
    return res.data or []


def _scrape_filters_from_perfil(perfil: dict) -> dict:
    skills = [s for s in (perfil.get("habilidades") or []) if s][:5]
    return {
        "city": perfil.get("ciudad"),
        "sector": _perfil_sector(perfil),
        "skills": skills,
    }


def _job_sector_relevant(perfil: dict, job: dict) -> bool:
    sectores = [_normalize_text(s) for s in (perfil.get("sectores_interes") or []) if s]
    if not sectores:
        return True
    haystack = " ".join(
        [
            job.get("sector") or "",
            job.get("title") or "",
            job.get("description") or "",
        ]
    )
    return any(_sector_matches(s, haystack) for s in sectores)


def _prepare_jobs_pool(perfil: dict, supabase) -> tuple[list[dict], bool]:
    """
    Devuelve todo el cache activo para scorear (más vacantes, match bajo incluido).
    El scrape queue sigue usando vacantes frescas relevantes al perfil.
    """
    cutoff = _freshness_cutoff()
    all_active = _fetch_active_jobs(supabase)
    fresh_relevant = [
        j for j in all_active if _is_fresh(j, cutoff) and _matches_profile(j, perfil)
    ]

    encolado = False
    if len(fresh_relevant) >= MIN_FRESH_JOBS:
        logger.info(
            f"Cache fresh OK: {len(fresh_relevant)} vacantes relevantes (< {FRESH_HORIZON_HOURS}h)"
        )
    else:
        logger.info(
            f"Pocas vacantes frescas ({len(fresh_relevant)} < {MIN_FRESH_JOBS}), "
            "encolando scrape"
        )
        request_scrape(_scrape_filters_from_perfil(perfil), priority=1)
        encolado = True

    logger.info(f"Pool de score: {len(all_active)} vacantes activas")
    return all_active, encolado


def _resolver_jobs_cache(perfil: dict, supabase) -> tuple[list[dict], bool]:
    """
    Cache-first: vacantes frescas y relevantes al perfil.
    Si hay pocas, devuelve todo el cache activo y encola scrape (best-effort).
    """
    cutoff = _freshness_cutoff()
    all_active = _fetch_active_jobs(supabase)
    fresh_relevant = [
        j for j in all_active if _is_fresh(j, cutoff) and _matches_profile(j, perfil)
    ]

    if len(fresh_relevant) >= MIN_FRESH_JOBS:
        logger.info(
            f"Cache fresh OK: {len(fresh_relevant)} vacantes (< {FRESH_HORIZON_HOURS}h)"
        )
        return fresh_relevant, False

    logger.info(
        f"Pocas vacantes frescas ({len(fresh_relevant)} < {MIN_FRESH_JOBS}), "
        "usando cache completo y encolando scrape"
    )
    request_scrape(_scrape_filters_from_perfil(perfil), priority=1)
    return all_active, True


def _perfil_experiencia(perfil: dict) -> float:
    return float(perfil.get("experiencia_anios") or 0)


def _job_hires_youth(job: dict) -> bool:
    return bool(job.get("hires_youth"))


def _title_suggests_senior(title: str) -> bool:
    t = _normalize_text(title)
    return any(marker in t for marker in _SENIOR_TITLE_MARKERS)


def _title_suggests_junior(title: str) -> bool:
    t = _normalize_text(title)
    return any(marker in t for marker in _JUNIOR_TITLE_MARKERS)


def _seniority_compatible(perfil: dict, raw_job: dict) -> bool:
    """
    Perfiles junior (≤2 años): excluye roles senior o con exp_req muy alta.
    hires_youth=true rescata vacantes explícitamente orientadas a jóvenes.
    Perfiles con más experiencia: sin filtro duro.
    """
    exp_usuario = _perfil_experiencia(perfil)
    if exp_usuario > JUNIOR_EXP_THRESHOLD:
        return True

    job = normalize_job_row(raw_job)
    exp_req = float(job.get("experience_required") or 0)
    hires_youth = _job_hires_youth(job)
    title = job.get("title") or ""

    if _title_suggests_senior(title):
        if _title_suggests_junior(title):
            return True
        return False

    if exp_req > exp_usuario + SENIORITY_TOLERANCE:
        return hires_youth

    return True


def _calcular_score(perfil: dict, raw_job: dict) -> tuple[JobOut, ScoreOut]:
    """Calcula el score 0-100 para un par perfil-vacante (columnas EN en BD)."""
    job = normalize_job_row(raw_job)

    skills_req = [s.lower() for s in (job.get("skills_required") or [])]
    skills_perfil = [s.lower() for s in (perfil.get("habilidades") or [])]

    if skills_req:
        match_ratio = len(set(skills_perfil) & set(skills_req)) / len(skills_req)
        pts_skills = round(match_ratio * SKILLS_MAX_PTS)
    else:
        pts_skills = SKILLS_EMPTY_PTS

    ciudad_perfil = (perfil.get("ciudad") or "").lower().strip()
    ciudad_job = job_city(raw_job).lower()
    depto_perfil = (perfil.get("departamento") or "").lower().strip()
    depto_job = job_department(raw_job).lower()
    modalidad_job = (job.get("modality") or "").lower()

    if modalidad_job == "remoto":
        pts_ciudad = CIUDAD_REMOTO_PTS
    elif ciudad_perfil and ciudad_job and ciudad_perfil == ciudad_job:
        pts_ciudad = CIUDAD_EXACTA_PTS
    elif depto_perfil and depto_job and depto_perfil == depto_job:
        pts_ciudad = CIUDAD_DEPTO_PTS
    else:
        pts_ciudad = 0

    exp_usuario = _perfil_experiencia(perfil)
    exp_req = float(job.get("experience_required") or 0)

    if exp_usuario >= exp_req:
        pts_exp = 25
    else:
        brecha = exp_req - exp_usuario
        pts_exp = max(0, round(25 - brecha * 8))

    nivel_usuario = NIVEL_ORDEN.get(perfil.get("nivel_educativo") or "", 0)
    nivel_req = NIVEL_ORDEN.get(job.get("education_level_req") or "", 0)

    if nivel_usuario >= nivel_req:
        pts_edu = 15
    elif nivel_usuario == nivel_req - 1:
        pts_edu = 8
    else:
        pts_edu = 0

    pts_youth = 0
    if exp_usuario <= JUNIOR_EXP_THRESHOLD and _job_hires_youth(job):
        pts_youth = YOUTH_BOOST

    pts_sector = SECTOR_MATCH_PTS if _job_sector_relevant(perfil, job) else 0

    raw_total = min(
        100, pts_skills + pts_ciudad + pts_exp + pts_edu + pts_youth + pts_sector
    )
    score_total = round(raw_total / 5) * 5

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
            youth=pts_youth,
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
