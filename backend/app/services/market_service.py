import os
from collections import Counter
from datetime import datetime, timedelta, timezone

from app.db.jobs_row import normalize_job_row
from app.db.supabase import get_supabase
from app.models.market import MarketDashboard, SectorCount
from app.utils.logger import get_logger

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"
TOP_SECTORES = 5
TOP_EMPRESAS = 5
MODALIDADES_CANONICAS = ("remoto", "presencial", "hibrido")


async def obtener_dashboard(
    ciudad: str | None = None,
    sector: str | None = None,
) -> MarketDashboard:
    """
    Agrega estadísticas del mercado laboral desde la tabla jobs (schema EN).
    Filtros opcionales por ciudad y sector (case-insensitive).
    """
    if USE_MOCK:
        logger.info("[MOCK] Dashboard de mercado simulado")
        return _mock_dashboard(ciudad, sector)

    supabase = get_supabase()
    query = supabase.table("jobs").select("*").eq("active", True)

    if ciudad:
        c = ciudad.strip()
        # Filtrar solo por city (location es opcional y puede no existir en BD)
        query = query.ilike("city", f"%{c}%")
    if sector:
        query = query.ilike("sector", sector.strip())

    jobs_res = query.execute()
    raw_jobs = jobs_res.data or []

    # Pipeline puede dejar city null — no devolver dashboard vacío en demo
    if ciudad and not raw_jobs:
        logger.warning(
            f"Dashboard: 0 vacantes con city~={ciudad!r}; usando todas las activas"
        )
        jobs_res = supabase.table("jobs").select("*").eq("active", True).execute()
        raw_jobs = jobs_res.data or []

    jobs = [normalize_job_row(j) for j in raw_jobs]
    logger.info(f"Dashboard: {len(jobs)} vacantes activas — ciudad={ciudad}, sector={sector}")

    return _agregar(jobs, ciudad, sector)


def _agregar(jobs: list[dict], ciudad: str | None, sector: str | None) -> MarketDashboard:
    total = len(jobs)

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
        top_sectores=top_sectores,
        salario_promedio=salario_promedio,
        top_empresas_verdes=top_empresas,
        crecimiento_semanal_pct=crecimiento,
        ciudad_filtro=ciudad,
        sector_filtro=sector,
        por_modalidad=por_modalidad,
        por_fuente=por_fuente,
    )


def _crecimiento_semanal(jobs: list[dict]) -> float | None:
    ahora = datetime.now(timezone.utc)
    hace_7 = ahora - timedelta(days=7)
    hace_14 = ahora - timedelta(days=14)

    esta_semana = 0
    semana_anterior = 0

    for j in jobs:
        fecha_raw = j.get("posted_at") or j.get("scraped_at")
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
