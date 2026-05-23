"""
Enriquecimiento de filas antes de INSERT en Supabase `jobs`.

El pipeline de Adzuna suele traer: title, company, url, location, salary_min/max.
DulIA necesita además: city, sector, skills_required, status, modality, etc.

Uso (desde pipeline/):
    from enrich_job import enrich_job_row
    row = enrich_job_row(raw_from_adzuna)
    supabase.table("jobs").insert(row).execute()
"""

import hashlib
import re
from typing import Any


def enrich_job_row(raw: dict[str, Any], source: str = "adzuna") -> dict[str, Any]:
    """Completa campos faltantes con defaults e inferencias simples."""
    title = raw.get("title") or raw.get("titulo") or ""
    company = raw.get("company") or raw.get("empresa") or ""
    url = raw.get("url") or ""

    location = raw.get("location") or ""
    city, department = _split_location(location, raw.get("city"), raw.get("department"))

    description = (raw.get("description") or raw.get("descripcion") or "").lower()
    modality = raw.get("modality") or raw.get("modalidad") or _infer_modality(description)

    skills = raw.get("skills_required") or raw.get("habilidades_requeridas") or []
    if not skills and description:
        skills = _infer_skills_from_text(description)

    sector = raw.get("sector") or _infer_sector(title, description)

    return {
        "title": title,
        "company": company,
        "url": url,
        "location": location or None,
        "city": city,
        "department": department,
        "salary_min": raw.get("salary_min") or raw.get("salario_min"),
        "salary_max": raw.get("salary_max") or raw.get("salario_max"),
        "skills_required": [s.lower().strip() for s in skills if s],
        "sector": sector,
        "experience_required": raw.get("experience_required", raw.get("experiencia_requerida", 0)) or 0,
        "education_level_req": raw.get("education_level_req") or raw.get("nivel_educativo_req"),
        "modality": modality,
        "status": raw.get("status") or raw.get("semaforo") or _infer_status(raw),
        "source": raw.get("source") or raw.get("fuente") or source,
        "description": raw.get("description") or raw.get("descripcion"),
        "posted_at": raw.get("posted_at") or raw.get("publicado_at"),
        "active": raw.get("active", raw.get("activo", True)),
        "repost_count": raw.get("repost_count", 0),
        "hires_youth": raw.get("hires_youth", _infer_hires_youth(description)),
        "unique_hash": raw.get("unique_hash") or raw.get("hash_unico") or _unique_hash(title, company, url),
    }


def _split_location(
    location: str,
    city: str | None,
    department: str | None,
) -> tuple[str | None, str | None]:
    if city:
        return city.strip(), (department or "").strip() or None
    if not location:
        return None, None
    parts = [p.strip() for p in location.split(",")]
    return (parts[0] or None), (parts[1] if len(parts) > 1 else None)


def _infer_modality(text: str) -> str:
    if "remoto" in text or "remote" in text or "home office" in text:
        return "remoto"
    if "hibrido" in text or "hybrid" in text:
        return "hibrido"
    return "presencial"


def _infer_sector(title: str, description: str) -> str:
    blob = f"{title} {description}".lower()
    rules = [
        ("tecnología", ["developer", "software", "python", "data", "ti ", "tech"]),
        ("logística", ["logist", "bodega", "supply"]),
        ("comercial", ["ventas", "comercial", "vendedor"]),
        ("fintech", ["banco", "financ"]),
        ("salud", ["salud", "enfermer", "hospital"]),
    ]
    for sector, keywords in rules:
        if any(k in blob for k in keywords):
            return sector
    return "general"


def _infer_skills_from_text(text: str) -> list[str]:
    known = [
        "python", "excel", "sql", "javascript", "react", "java",
        "power bi", "git", "fastapi", "postgresql", "ingles",
    ]
    return [s for s in known if s in text]


def _infer_status(raw: dict) -> str:
    """Heurística simple: green si hay salario y descripción."""
    if raw.get("salary_min") or raw.get("salario_min"):
        desc = raw.get("description") or raw.get("descripcion") or ""
        if len(desc) > 80:
            return "green"
        return "yellow"
    return "yellow"


def _infer_hires_youth(text: str) -> bool:
    return any(
        k in text
        for k in ("sin experiencia", "primer empleo", "junior", "practicante", "trainee")
    )


def _unique_hash(title: str, company: str, url: str) -> str:
    payload = f"{title}|{company}|{url}".lower().strip()
    return hashlib.sha256(payload.encode()).hexdigest()
