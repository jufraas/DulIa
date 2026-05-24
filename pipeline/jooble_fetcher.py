"""
DEPRECADO — Jooble no filtra por Colombia/LATAM correctamente (API free tier).
Reemplazado por remotive_fetcher.py para vacantes remotas tech.

Fetches jobs from Jooble API (Colombia) and upserts them into the Supabase `jobs` table.

Jooble API: POST https://jooble.org/api/{api_key}
Body: { "keywords": "...", "location": "Colombia", "page": 1 }

Run:
    python jooble_fetcher.py
    python jooble_fetcher.py --keywords "junior python" --max-jobs 50

Requires in .env:
    JOOBLE_API_KEY
    SUPABASE_URL
    SUPABASE_KEY
"""

import hashlib
import os
import re
import time
from datetime import datetime, timezone

import requests
from dotenv import load_dotenv
from supabase import create_client

_HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_HERE, "..", "backend", ".env"))
sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

JOOBLE_API_KEY = os.getenv("JOOBLE_API_KEY")
API_URL        = f"https://jooble.org/api/{JOOBLE_API_KEY}"  # cargado después de load_dotenv

# Departamentos colombianos comunes (para parsear "Ciudad, Depto")
DEPTOS_CO = {
    "atlántico", "atlantico", "cundinamarca", "antioquia", "valle del cauca",
    "bolívar", "bolivar", "santander", "norte de santander", "nariño", "narino",
    "córdoba", "cordoba", "cauca", "risaralda", "boyacá", "boyaca", "huila",
    "tolima", "cesar", "magdalena", "sucre", "meta", "caldas", "chocó", "choco",
    "la guajira", "putumayo", "caquetá", "caqueta", "amazonas", "guainía", "guainia",
    "vichada", "vaupés", "vaupes", "guaviare", "arauca", "casanare", "quindío", "quindio",
    "san andrés", "san andres",
}

SECTOR_KEYWORDS = {
    "tecnología":   ["developer", "desarrollador", "software", "programador", "backend",
                     "frontend", "fullstack", "devops", "cloud", "it ", "sistemas"],
    "datos":        ["data", "datos", "analytics", "analítica", "bi ", "machine learning",
                     "inteligencia artificial", "ia ", "ai "],
    "diseño":       ["diseño", "design", "ux", "ui "],
    "fintech":      ["fintech", "finanzas", "contable", "contador", "auditor", "bancolombia",
                     "davivienda"],
    "marketing":    ["marketing", "publicidad", "community", "seo", "sem", "digital"],
    "ventas":       ["ventas", "comercial", "asesor comercial", "sales"],
    "logística":    ["logística", "cadena de suministro", "supply chain", "bodega", "almacén"],
    "salud":        ["médico", "enfermero", "salud", "clínica", "hospital"],
    "educación":    ["docente", "educación", "tutor", "formador"],
}

SKILLS_KEYWORDS = [
    "python", "java", "javascript", "typescript", "react", "angular", "vue",
    "node", "django", "fastapi", "flask", "spring", "sql", "postgresql", "mysql",
    "mongodb", "redis", "docker", "kubernetes", "aws", "azure", "gcp", "git",
    "excel", "power bi", "tableau", "r ", "scala", "hadoop", "spark", "kafka",
    "linux", "bash", "c++", "c#", ".net", "php", "laravel", "flutter", "kotlin",
    "swift", "ios", "android", "react native", "machine learning", "deep learning",
    "nlp", "tensorflow", "pytorch", "photoshop", "illustrator", "figma", "wordpress",
]


def _unique_hash(title: str, company: str, url: str) -> str:
    s = f"{title}|{company}|{url}".lower().strip()
    return hashlib.sha256(s.encode()).hexdigest()


def _parse_location(location_text: str) -> tuple[str | None, str | None]:
    """
    Parses Jooble's free-text location into (city, department).
    Input examples: "Bogotá, Cundinamarca", "Medellín, Antioquia, Colombia", "Colombia"
    """
    if not location_text:
        return None, None

    # Limpiar "Colombia" del final
    text = re.sub(r",?\s*Colombia\s*$", "", location_text, flags=re.IGNORECASE).strip()
    if not text:
        return None, None

    parts = [p.strip() for p in text.split(",") if p.strip()]
    if not parts:
        return None, None

    if len(parts) == 1:
        p = parts[0].lower()
        if p in DEPTOS_CO:
            return None, parts[0]
        return parts[0], None

    # Último token como ciudad, anterior como departamento si está en la lista
    city = parts[-1]
    department_candidate = parts[-2].lower()
    department = parts[-2] if department_candidate in DEPTOS_CO else None
    return city, department


def _infer_sector(title: str, snippet: str) -> str:
    text = f"{title} {snippet}".lower()
    for sector, keywords in SECTOR_KEYWORDS.items():
        for kw in keywords:
            if kw in text:
                return sector
    return "general"


def _extract_skills(title: str, snippet: str) -> list[str]:
    text = f"{title} {snippet}".lower()
    return [skill for skill in SKILLS_KEYWORDS if skill in text]


def _infer_modality(title: str, snippet: str) -> str:
    text = f"{title} {snippet}".lower()
    if any(w in text for w in ["remoto", "remote", "teletrabajo", "home office"]):
        return "remoto"
    if any(w in text for w in ["híbrido", "hibrido", "hybrid"]):
        return "hibrido"
    return "presencial"


def _infer_hires_youth(title: str, snippet: str) -> bool:
    text = f"{title} {snippet}".lower()
    return any(w in text for w in [
        "junior", "jr ", "trainee", "aprendiz", "practicante",
        "auxiliar", "asistente", "entry level", "sin experiencia",
        "recién egresado", "recien egresado",
    ])


def _parse_salary(salary_raw) -> int | None:
    if not salary_raw:
        return None
    try:
        # Jooble puede devolver string "2500000" o "COP 2,500,000"
        cleaned = re.sub(r"[^\d.]", "", str(salary_raw))
        if not cleaned:
            return None
        v = float(cleaned)
        return int(v) if v > 0 else None
    except (ValueError, TypeError):
        return None


def _fetch_page(keywords: str, location: str, page: int) -> dict:
    """Fetches one page from Jooble. Returns raw response dict."""
    payload = {"keywords": keywords, "location": location, "page": page}
    resp = requests.post(API_URL, json=payload, timeout=20)
    resp.raise_for_status()
    return resp.json()


def _map_row(raw: dict) -> dict:
    title   = (raw.get("title") or "").strip()
    company = (raw.get("company") or "Desconocida").strip()
    url     = (raw.get("link") or "").strip()

    snippet = re.sub(r"<[^>]+>", " ", raw.get("snippet") or "")
    snippet = re.sub(r"\s+", " ", snippet).strip()[:2000]

    location_text = (raw.get("location") or "").strip()
    city, department = _parse_location(location_text)

    salary_min = _parse_salary(raw.get("salary"))
    modality   = _infer_modality(title, snippet)

    if modality == "remoto":
        city = None
        department = None

    sector      = _infer_sector(title, snippet)
    skills      = _extract_skills(title, snippet)
    hires_youth = _infer_hires_youth(title, snippet)
    status      = "green" if salary_min or len(snippet) > 200 else "yellow"

    updated_str = raw.get("updated")
    try:
        posted_at = datetime.fromisoformat(updated_str.replace("Z", "+00:00")).isoformat() if updated_str else None
    except (AttributeError, ValueError):
        posted_at = None

    return {
        "title":               title,
        "company":             company,
        "city":                city,
        "department":          department,
        "location":            location_text,
        "salary_min":          salary_min,
        "salary_max":          None,  # Jooble no devuelve rango
        "description":         snippet,
        "skills_required":     skills,
        "sector":              sector,
        "experience_required": 0,
        "education_level_req": None,
        "modality":            modality,
        "source":              "jooble",
        "url":                 url,
        "unique_hash":         _unique_hash(title, company, url),
        "posted_at":           posted_at,
        "scraped_at":          datetime.now(timezone.utc).isoformat(),
        "repost_count":        0,
        "status":              status,
        "hires_youth":         hires_youth,
        "active":              True,
    }


def run(keywords: str = "junior colombia", location: str = "Colombia", max_pages: int = 3, max_jobs: int = 150):
    if not JOOBLE_API_KEY:
        print("ERROR: JOOBLE_API_KEY es requerida en .env")
        return

    collected: list[dict] = []
    seen_hashes: set[str] = set()

    print(f"\n=== Jooble fetcher — keywords='{keywords}' location='{location}' max_pages={max_pages} ===")

    for page in range(1, max_pages + 1):
        if len(collected) >= max_jobs:
            break

        print(f"  Fetching page {page} ...")
        try:
            data = _fetch_page(keywords, location, page)
        except Exception as exc:
            print(f"  Error on page {page}: {exc}")
            break

        jobs = data.get("jobs") or []
        if not jobs:
            print(f"  No jobs on page {page} — stopping.")
            break

        new_this_page = 0
        for raw in jobs:
            if len(collected) >= max_jobs:
                break
            row = _map_row(raw)
            h = row["unique_hash"]
            if h in seen_hashes:
                continue
            seen_hashes.add(h)
            collected.append(row)
            new_this_page += 1

        total_api = data.get("totalCount", "?")
        print(f"  page {page}: +{new_this_page} jobs  (total fetched: {len(collected)} / api_count: {total_api})")

        if len(jobs) < 20:
            print("  Last page reached (< 20 results).")
            break

        time.sleep(1)

    if not collected:
        print("\nNo jobs fetched. Verifica JOOBLE_API_KEY y conectividad.")
        return

    print(f"\nUpserting {len(collected)} jobs into Supabase ...")
    res = sb.table("jobs").upsert(collected, on_conflict="unique_hash").execute()
    print(f"Done — {len(res.data)} rows upserted.\n")
    for v in res.data:
        flag = "[REMOTO]" if v.get("modality") == "remoto" else "[LOCAL] "
        st = v.get("status", "?")
        print(f"  {flag} [{st}] {v.get('title','?')[:55]:55} — {v.get('company','?')}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Jooble fetcher para DulIA")
    parser.add_argument("--keywords",  default="junior colombia",  help="Keywords de búsqueda")
    parser.add_argument("--location",  default="Colombia",         help="Ubicación (default: 'Colombia')")
    parser.add_argument("--max-pages", type=int, default=3,        help="Máximo de páginas (default: 3)")
    parser.add_argument("--max-jobs",  type=int, default=150,      help="Máximo de vacantes (default: 150)")
    args = parser.parse_args()

    run(keywords=args.keywords, location=args.location, max_pages=args.max_pages, max_jobs=args.max_jobs)
