"""
Normalización de filas `jobs`: schema en inglés (pipeline / Adzuna)
con fallback a columnas legacy en español.
"""

from typing import Any

# Claves canónicas internas (inglés, alineadas con Supabase post-migración)
JOB_COL = {
    "title": "title",
    "company": "company",
    "city": "city",
    "department": "department",
    "location": "location",
    "salary_min": "salary_min",
    "salary_max": "salary_max",
    "skills_required": "skills_required",
    "sector": "sector",
    "experience_required": "experience_required",
    "education_level_req": "education_level_req",
    "modality": "modality",
    "status": "status",
    "source": "source",
    "url": "url",
    "unique_hash": "unique_hash",
    "description": "description",
    "posted_at": "posted_at",
    "scraped_at": "scraped_at",
    "active": "active",
    "repost_count": "repost_count",
    "hires_youth": "hires_youth",
}

# español legacy → inglés
_LEGACY_ALIASES: dict[str, str] = {
    "titulo": "title",
    "empresa": "company",
    "ciudad": "city",
    "departamento": "department",
    "salario_min": "salary_min",
    "salario_max": "salary_max",
    "habilidades_requeridas": "skills_required",
    "experiencia_requerida": "experience_required",
    "nivel_educativo_req": "education_level_req",
    "modalidad": "modality",
    "semaforo": "status",
    "fuente": "source",
    "hash_unico": "unique_hash",
    "descripcion": "description",
    "publicado_at": "posted_at",
    "scrapeado_at": "scraped_at",
    "activo": "active",
    # alias que el pipeline podría usar
    "skills_req": "skills_required",
    "posted_at": "posted_at",
    "scraped_at": "scraped_at",
}


def normalize_job_row(row: dict[str, Any]) -> dict[str, Any]:
    """Devuelve dict con claves en inglés para lógica de scoring y mercado."""
    out: dict[str, Any] = {"id": row.get("id")}

    for key, value in row.items():
        if key == "id":
            continue
        canonical = _LEGACY_ALIASES.get(key, key)
        out[canonical] = value

    # Normalizar modality/status a valores que usa el scoring
    if out.get("modality"):
        out["modality"] = _normalize_modality(str(out["modality"]))
    if out.get("status"):
        out["status"] = str(out["status"]).lower()

    return out


def _normalize_modality(value: str) -> str:
    """Alinea variantes EN/ES para el bonus remoto."""
    v = value.lower().strip()
    mapping = {
        "remote": "remoto",
        "remoto": "remoto",
        "hybrid": "hibrido",
        "hibrido": "hibrido",
        "on-site": "presencial",
        "onsite": "presencial",
        "presencial": "presencial",
        "in-person": "presencial",
    }
    return mapping.get(v, v)


def job_city(job: dict[str, Any]) -> str:
    """Ciudad para scoring: city explícito o primer segmento de location."""
    n = normalize_job_row(job)
    if n.get("city"):
        return str(n["city"]).strip()
    loc = n.get("location") or ""
    if loc:
        return str(loc).split(",")[0].strip()
    return ""


def job_department(job: dict[str, Any]) -> str:
    n = normalize_job_row(job)
    if n.get("department"):
        return str(n["department"]).strip()
    loc = n.get("location") or ""
    parts = [p.strip() for p in str(loc).split(",")]
    return parts[1] if len(parts) > 1 else ""


def get_job_field(job: dict[str, Any], field: str, default=None):
    """Lee un campo canónico aunque la fila venga en español."""
    n = normalize_job_row(job)
    return n.get(field, default)
