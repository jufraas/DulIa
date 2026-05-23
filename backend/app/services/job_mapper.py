"""Mapeo fila jobs (EN en BD) → JobOut (ES en API para el frontend)."""

from app.db.jobs_row import normalize_job_row
from app.models.job import JobOut


def row_to_job_out(row: dict, **extra) -> JobOut:
    """Convierte fila Supabase normalizada al contrato español del frontend."""
    j = normalize_job_row(row)
    return JobOut(
        id=str(j["id"]),
        titulo=j["title"],
        empresa=j["company"],
        ciudad=j.get("city") or _city_from_location(j.get("location")),
        departamento=j.get("department") or _dept_from_location(j.get("location")),
        salario_min=j.get("salary_min"),
        salario_max=j.get("salary_max"),
        habilidades_requeridas=j.get("skills_required") or [],
        sector=j.get("sector"),
        experiencia_requerida=float(j.get("experience_required") or 0),
        nivel_educativo_req=j.get("education_level_req"),
        modalidad=j.get("modality"),
        semaforo=j.get("status", "green"),
        descripcion=j.get("description"),
        publicado_at=j.get("posted_at"),
        url=j.get("url"),
        repost_count=j.get("repost_count"),
        hires_youth=j.get("hires_youth"),
        **extra,
    )


def _city_from_location(location: str | None) -> str | None:
    if not location:
        return None
    return location.split(",")[0].strip() or None


def _dept_from_location(location: str | None) -> str | None:
    if not location:
        return None
    parts = [p.strip() for p in location.split(",")]
    return parts[1] if len(parts) > 1 else None
