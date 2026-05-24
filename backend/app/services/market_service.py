import os
import unicodedata
from collections import Counter
from datetime import datetime, timedelta, timezone

from app.db.jobs_row import normalize_job_row, job_city
from app.db.supabase import get_supabase
from app.models.market import MarketDashboard, SectorCount, SkillDemand
from app.services.jobs_service import _sector_matches
from app.utils.logger import get_logger

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"
TOP_SECTORES = 5
TOP_EMPRESAS = 5
TOP_SKILLS = 8
MODALIDADES_CANONICAS = ("remoto", "presencial", "hibrido")


class ProfileNotFoundError(Exception):
    def __init__(self, session_id: str):
        self.session_id = session_id
        super().__init__(f"Perfil no encontrado: session_id={session_id}")

# Ciudades colombianas frecuentes en getonbrd (sin acentos)
_COLOMBIA_CITIES = frozenset(
    {
        "colombia",
        "bogota",
        "medellin",
        "cali",
        "barranquilla",
        "cartagena",
        "bucaramanga",
        "pereira",
        "manizales",
        "cucuta",
        "ibague",
        "santa marta",
        "villavicencio",
        "pasto",
        "monteria",
        "neiva",
        "armenia",
        "popayan",
        "valledupar",
        "sincelejo",
    }
)


async def obtener_dashboard(
    ciudad: str | None = None,
    sector: str | None = None,
) -> MarketDashboard:
    """
    Agrega estadísticas del mercado laboral desde la tabla jobs (schema EN).

    Con `city`, el alcance es **accesible desde esa ciudad**:
    vacantes locales + remotas + nacionales (Colombia), alineado con getonbrd + Remotive.
    """
    if USE_MOCK:
        logger.info("[MOCK] Dashboard de mercado simulado")
        return _mock_dashboard(ciudad, sector)

    supabase = get_supabase()
    jobs_res = supabase.table("jobs").select("*").eq("active", True).execute()
    raw_jobs = jobs_res.data or []

    jobs = [normalize_job_row(j) for j in raw_jobs]
    if ciudad:
        jobs = [j for j in jobs if _accesible_desde_ciudad(j, ciudad)]
    if sector:
        s = sector.strip().lower()
        jobs = [j for j in jobs if s in (j.get("sector") or "").lower()]

    logger.info(
        f"Dashboard: {len(jobs)} vacantes accesibles — ciudad={ciudad}, sector={sector}"
    )

    return _agregar(jobs, ciudad, sector)


async def obtener_dashboard_para_perfil(session_id: str) -> MarketDashboard:
    """
    Termómetro personalizado: pool filtrado por ciudad accesible + sectores del perfil.
    Salario, crecimiento y conteos reflejan el scope del usuario, no el mercado global.
    """
    if USE_MOCK:
        logger.info(f"[MOCK] Dashboard personalizado session_id={session_id}")
        return _mock_dashboard_personalizado(session_id)

    supabase = get_supabase()
    perfil_res = (
        supabase.table("profiles").select("*").eq("session_id", session_id).execute()
    )
    if not perfil_res.data:
        raise ProfileNotFoundError(session_id)

    perfil = perfil_res.data[0]
    ciudad = perfil.get("ciudad")
    sectores = [s for s in (perfil.get("sectores_interes") or []) if s]

    jobs_res = supabase.table("jobs").select("*").eq("active", True).execute()
    jobs = [normalize_job_row(j) for j in (jobs_res.data or [])]

    if ciudad:
        jobs = [j for j in jobs if _accesible_desde_ciudad(j, ciudad)]
    if sectores:
        jobs = [j for j in jobs if _job_matches_sectores_perfil(j, sectores)]

    top_skills = _top_skills_demandadas(jobs, perfil.get("habilidades") or [])

    logger.info(
        f"Dashboard perfil: {len(jobs)} vacantes en scope — "
        f"session_id={session_id}, ciudad={ciudad}, sectores={sectores[:3]}"
    )

    return _agregar(
        jobs,
        ciudad,
        None,
        top_skills_demandadas=top_skills,
        sectores_filtro=sectores,
    )


def _job_haystack(job: dict) -> str:
    return " ".join(
        [
            job.get("sector") or "",
            job.get("title") or "",
            job.get("description") or "",
        ]
    )


def _job_matches_sectores_perfil(job: dict, sectores: list[str]) -> bool:
    if not sectores:
        return True
    haystack = _job_haystack(job)
    normalized = [_normalize_text(s) for s in sectores if s]
    return any(_sector_matches(s, haystack) for s in normalized)


def _top_skills_demandadas(jobs: list[dict], habilidades_perfil: list[str]) -> list[SkillDemand]:
    perfil_skills = {_normalize_text(s) for s in habilidades_perfil if s}
    counter: Counter[str] = Counter()
    display_names: dict[str, str] = {}

    for job in jobs:
        for skill in job.get("skills_required") or []:
            if not skill:
                continue
            key = _normalize_text(skill)
            counter[key] += 1
            display_names.setdefault(key, str(skill).strip())

    result: list[SkillDemand] = []
    for skill_key, count in counter.most_common(TOP_SKILLS):
        tienes = skill_key in perfil_skills or any(
            skill_key in ps or ps in skill_key for ps in perfil_skills
        )
        result.append(
            SkillDemand(
                skill=display_names.get(skill_key, skill_key),
                count=count,
                tienes=tienes,
            )
        )
    return result


def _normalize_text(value: str) -> str:
    text = (value or "").strip().lower()
    return "".join(
        c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn"
    )


def _accesible_desde_ciudad(job: dict, ciudad: str) -> bool:
    """
    Vacante alcanzable desde la ciudad del usuario:
    remoto, sin ciudad (Remotive), local exacto o mercado nacional colombiano.
    """
    ciudad_norm = _normalize_text(ciudad)
    if not ciudad_norm:
        return True

    modality = _normalize_text(job.get("modality") or "")
    jc = _normalize_text(job_city(job))

    if modality == "remoto" or not jc:
        return True
    if ciudad_norm in jc or jc in ciudad_norm:
        return True
    if "colombia" in jc or jc in _COLOMBIA_CITIES:
        return True
    return False


def _es_local_en_ciudad(job: dict, ciudad: str) -> bool:
    ciudad_norm = _normalize_text(ciudad)
    jc = _normalize_text(job_city(job))
    return bool(ciudad_norm and jc and (ciudad_norm in jc or jc in ciudad_norm))


def _agregar(
    jobs: list[dict],
    ciudad: str | None,
    sector: str | None,
    *,
    top_skills_demandadas: list[SkillDemand] | None = None,
    sectores_filtro: list[str] | None = None,
) -> MarketDashboard:
    total = len(jobs)

    vacantes_locales = 0
    vacantes_remotas = 0
    if ciudad:
        for j in jobs:
            mod = _normalize_text(j.get("modality") or "")
            jc = _normalize_text(job_city(j))
            if _es_local_en_ciudad(j, ciudad):
                vacantes_locales += 1
            elif mod == "remoto" or not jc:
                vacantes_remotas += 1
    vacantes_nacionales = max(0, total - vacantes_locales - vacantes_remotas)

    sectores = Counter(j.get("sector") for j in jobs if j.get("sector"))
    top_sectores = [
        SectorCount(sector=s, count=c)
        for s, c in sectores.most_common(TOP_SECTORES)
    ]

    salarios = []
    for j in jobs:
        smin, smax = j.get("salary_min"), j.get("salary_max")
        if smin and smax:
            salarios.append((smin + smax) // 2)
        elif smin:
            salarios.append(smin)
        elif smax:
            salarios.append(smax)
    salario_promedio = round(sum(salarios) / len(salarios)) if salarios else None

    verdes = [
        j["company"]
        for j in jobs
        if j.get("status") == "green" and j.get("company")
    ]
    top_empresas = [emp for emp, _ in Counter(verdes).most_common(TOP_EMPRESAS)]

    crecimiento = _crecimiento_semanal(jobs)

    modalidades = Counter(
        j["modality"]
        for j in jobs
        if j.get("modality") in MODALIDADES_CANONICAS
    )
    por_modalidad = {m: modalidades.get(m, 0) for m in MODALIDADES_CANONICAS}

    fuentes = Counter(
        str(j["source"]).lower().strip()
        for j in jobs
        if j.get("source")
    )
    por_fuente = dict(sorted(fuentes.items(), key=lambda x: (-x[1], x[0])))

    return MarketDashboard(
        total_vacantes_activas=total,
        vacantes_locales=vacantes_locales,
        vacantes_remotas=vacantes_remotas,
        vacantes_nacionales=vacantes_nacionales,
        top_sectores=top_sectores,
        salario_promedio=salario_promedio,
        top_empresas_verdes=top_empresas,
        crecimiento_semanal_pct=crecimiento,
        ciudad_filtro=ciudad,
        sector_filtro=sector,
        por_modalidad=por_modalidad,
        por_fuente=por_fuente,
        top_skills_demandadas=top_skills_demandadas or [],
        sectores_filtro=sectores_filtro or [],
    )


def _crecimiento_semanal(jobs: list[dict]) -> float | None:
    """
    Variación de vacantes indexadas en DulIA (scraped_at), no fecha de publicación
    original que suele ser stale en fuentes externas.
    """
    ahora = datetime.now(timezone.utc)
    hace_7 = ahora - timedelta(days=7)
    hace_14 = ahora - timedelta(days=14)

    esta_semana = 0
    semana_anterior = 0

    for j in jobs:
        fecha_raw = j.get("scraped_at") or j.get("posted_at")
        if not fecha_raw:
            continue
        fecha = _parse_fecha(fecha_raw)
        if fecha is None:
            continue
        if fecha >= hace_7:
            esta_semana += 1
        elif fecha >= hace_14:
            semana_anterior += 1

    if semana_anterior == 0:
        return None if esta_semana == 0 else 100.0

    pct = ((esta_semana - semana_anterior) / semana_anterior) * 100
    return round(pct, 1)


def _parse_fecha(valor) -> datetime | None:
    if isinstance(valor, datetime):
        dt = valor
    else:
        try:
            dt = datetime.fromisoformat(str(valor).replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _mock_dashboard(ciudad: str | None, sector: str | None) -> MarketDashboard:
    return MarketDashboard(
        total_vacantes_activas=312,
        vacantes_locales=24,
        vacantes_remotas=288,
        vacantes_nacionales=0,
        top_sectores=[
            SectorCount(sector="tecnología", count=87),
            SectorCount(sector="comercial", count=64),
            SectorCount(sector="logística", count=52),
        ],
        salario_promedio=2800000,
        top_empresas_verdes=["Bancolombia", "Rappi", "Teleperformance"],
        crecimiento_semanal_pct=12.4,
        ciudad_filtro=ciudad,
        sector_filtro=sector,
        por_modalidad={"remoto": 58, "presencial": 198, "hibrido": 56},
        por_fuente={"getonbrd": 100, "remotive": 8, "mock": 204},
    )


def _mock_dashboard_personalizado(session_id: str) -> MarketDashboard:
    base = _mock_dashboard("Barranquilla", None)
    return base.model_copy(
        update={
            "total_vacantes_activas": 142,
            "vacantes_locales": 3,
            "vacantes_remotas": 128,
            "vacantes_nacionales": 11,
            "sectores_filtro": ["technology", "user experience"],
            "top_skills_demandadas": [
                SkillDemand(skill="Python", count=28, tienes=True),
                SkillDemand(skill="React", count=22, tienes=False),
                SkillDemand(skill="JavaScript", count=19, tienes=True),
                SkillDemand(skill="SQL", count=15, tienes=False),
            ],
        }
    )
