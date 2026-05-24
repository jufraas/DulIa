"""
DEPRECADO — Adzuna no tiene endpoint para Colombia (co). País no soportado.
Reemplazado por remotive_fetcher.py para vacantes remotas tech.

Fetches jobs from Adzuna API (Colombia) and upserts them into the Supabase `jobs` table.

Adzuna docs: https://developer.adzuna.com/docs/search
Country code: co (Colombia)

Run:
    python adzuna_fetcher.py
    python adzuna_fetcher.py --what "python developer" --where "Barranquilla" --max-jobs 50

Requires in .env:
    ADZUNA_APP_ID
    ADZUNA_APP_KEY
    SUPABASE_URL
    SUPABASE_KEY
"""

import hashlib
import os
import time
import re
from datetime import datetime, timezone

import requests
from dotenv import load_dotenv
from supabase import create_client

_HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_HERE, "..", "backend", ".env"))
sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

APP_ID  = os.getenv("ADZUNA_APP_ID")
APP_KEY = os.getenv("ADZUNA_APP_KEY")

API_BASE        = "https://api.adzuna.com/v1/api/jobs/co/search"
RESULTS_PER_PAGE = 50
USD_TO_COP      = 4_200   # tasa fija aproximada

# Keywords en título/descripción → sector mapeado
SECTOR_KEYWORDS = {
    "tecnología":   ["developer", "desarrollador", "software", "programador", "backend",
                     "frontend", "fullstack", "devops", "cloud", "it ", "sistemas"],
    "datos":        ["data", "datos", "analytics", "analítica", "bi ", "machine learning",
                     "inteligencia artificial", "ia ", "ai "],
    "diseño":       ["diseño", "design", "ux", "ui ", "gráfico"],
    "fintech":      ["fintech", "bancolombia", "davivienda", "nequi", "finanzas", "contable",
                     "contador", "auditor"],
    "marketing":    ["marketing", "publicidad", "community", "seo", "sem", "digital"],
    "ventas":       ["ventas", "comercial", "asesor comercial", "sales"],
    "logística":    ["logística", "cadena de suministro", "supply chain", "bodega",
                     "almacén", "operaciones"],
    "salud":        ["médico", "enfermero", "salud", "clínica", "hospital", "farmacéutico"],
    "educación":    ["docente", "educación", "tutor", "formador", "capacitación"],
}

# Palabras clave de skills técnicos a extraer del texto libre
SKILLS_KEYWORDS = [
    "python", "java", "javascript", "typescript", "react", "angular", "vue",
    "node", "django", "fastapi", "flask", "spring", "sql", "postgresql", "mysql",
    "mongodb", "redis", "docker", "kubernetes", "aws", "azure", "gcp", "git",
    "excel", "power bi", "tableau", "r ", "scala", "hadoop", "spark", "kafka",
    "linux", "bash", "c++", "c#", ".net", "php", "laravel", "ruby", "rails",
    "flutter", "kotlin", "swift", "ios", "android", "react native",
    "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
    "photoshop", "illustrator", "figma", "sketch", "wordpress",
]


def _unique_hash(title: str, company: str, url: str) -> str:
    s = f"{title}|{company}|{url}".lower().strip()
    return hashlib.sha256(s.encode()).hexdigest()


def _to_cop(value) -> int | None:
    if value is None:
        return None
    try:
        v = float(value)
        return int(v * USD_TO_COP if v < 50_000 else v)
    except (TypeError, ValueError):
        return None


def _infer_sector(title: str, description: str) -> str:
    text = f"{title} {description}".lower()
    for sector, keywords in SECTOR_KEYWORDS.items():
        for kw in keywords:
            if kw in text:
                return sector
    return "general"


def _extract_skills(title: str, description: str) -> list[str]:
    text = f"{title} {description}".lower()
    found = []
    for skill in SKILLS_KEYWORDS:
        if skill in text and skill not in found:
            found.append(skill)
    return found


def _infer_modality(title: str, description: str) -> str:
    text = f"{title} {description}".lower()
    if any(w in text for w in ["remoto", "remote", "teletrabajo", "trabajo en casa", "home office"]):
        return "remoto"
    if any(w in text for w in ["híbrido", "hibrido", "hybrid"]):
        return "hibrido"
    return "presencial"


def _infer_status(salary_min, description: str) -> str:
    if salary_min or len(description) > 200:
        return "green"
    return "yellow"


def _infer_hires_youth(title: str, description: str) -> bool:
    text = f"{title} {description}".lower()
    return any(w in text for w in [
        "junior", "jr ", "trainee", "aprendiz", "practicante",
        "auxiliar", "asistente", "entry level", "sin experiencia",
        "recién egresado", "recien egresado",
    ])


def _parse_location(location: dict) -> tuple[str, str | None, str | None]:
    """Returns (location_text, city, department) from Adzuna location object."""
    display_name = location.get("display_name") or ""
    area = location.get("area") or []
    # area goes broad → specific: [country, region?, city?]
    # We skip area[0] (always country)
    city = None
    department = None
    if len(area) >= 3:
        department = area[-2]
        city = area[-1]
    elif len(area) == 2:
        city = area[-1]
    return display_name, city, department


def _fetch_page(what: str, where: str, page: int, results_per_page: int = RESULTS_PER_PAGE) -> dict:
    """Fetches one page from Adzuna. Returns raw response dict."""
    params = {
        "app_id": APP_ID,
        "app_key": APP_KEY,
        "results_per_page": results_per_page,
        "what": what,
        "where": where,
        "content-type": "application/json",
    }
    resp = requests.get(f"{API_BASE}/{page}", params=params, timeout=20)
    resp.raise_for_status()
    return resp.json()


def _map_row(raw: dict) -> dict:
    title   = (raw.get("title") or "").strip()
    company = (raw.get("company") or {}).get("display_name") or "Desconocida"
    url     = raw.get("redirect_url") or ""

    description = re.sub(r"<[^>]+>", " ", raw.get("description") or "")
    description = re.sub(r"\s+", " ", description).strip()[:2000]

    location_obj = raw.get("location") or {}
    location_text, city, department = _parse_location(location_obj)

    salary_min = _to_cop(raw.get("salary_min"))
    salary_max = _to_cop(raw.get("salary_max"))

    modality = _infer_modality(title, description)
    # Si location no pudo resolverse pero modality es remoto, no necesitamos ciudad
    if modality == "remoto":
        city = None
        department = None

    sector = _infer_sector(title, description)
    skills = _extract_skills(title, description)
    status = _infer_status(salary_min, description)
    hires_youth = _infer_hires_youth(title, description)

    created_str = raw.get("created")
    try:
        posted_at = datetime.fromisoformat(created_str.replace("Z", "+00:00")).isoformat() if created_str else None
    except (AttributeError, ValueError):
        posted_at = None

    return {
        "title":               title,
        "company":             company,
        "city":                city,
        "department":          department,
        "location":            location_text,
        "salary_min":          salary_min,
        "salary_max":          salary_max,
        "description":         description,
        "skills_required":     skills,
        "sector":              sector,
        "experience_required": 0,
        "education_level_req": None,
        "modality":            modality,
        "source":              "adzuna",
        "url":                 url,
        "unique_hash":         _unique_hash(title, company, url),
        "posted_at":           posted_at,
        "scraped_at":          datetime.now(timezone.utc).isoformat(),
        "repost_count":        0,
        "status":              status,
        "hires_youth":         hires_youth,
        "active":              True,
    }


def run(what: str = "trabajo", where: str = "Colombia", max_pages: int = 4, max_jobs: int = 200):
    if not APP_ID or not APP_KEY:
        print("ERROR: ADZUNA_APP_ID y ADZUNA_APP_KEY son requeridas en .env")
        return

    collected: list[dict] = []
    seen_hashes: set[str] = set()

    print(f"\n=== Adzuna fetcher — what='{what}' where='{where}' max_pages={max_pages} ===")

    for page in range(1, max_pages + 1):
        if len(collected) >= max_jobs:
            break

        print(f"  Fetching page {page} ...")
        try:
            data = _fetch_page(what, where, page)
        except Exception as exc:
            print(f"  Error on page {page}: {exc}")
            break

        results = data.get("results") or []
        if not results:
            print(f"  No results on page {page} — stopping.")
            break

        new_this_page = 0
        for raw in results:
            if len(collected) >= max_jobs:
                break
            row = _map_row(raw)
            h = row["unique_hash"]
            if h in seen_hashes:
                continue
            seen_hashes.add(h)
            collected.append(row)
            new_this_page += 1

        total_api = data.get("count", "?")
        print(f"  page {page}: +{new_this_page} jobs  (total fetched: {len(collected)} / api_count: {total_api})")

        if len(results) < RESULTS_PER_PAGE:
            print("  Last page reached.")
            break

        time.sleep(1)  # cortesía a la API

    if not collected:
        print("\nNo jobs fetched. Verifica credenciales y conectividad.")
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

    parser = argparse.ArgumentParser(description="Adzuna fetcher para DulIA")
    parser.add_argument("--what",     default="trabajo",   help="Keywords de búsqueda (default: 'trabajo')")
    parser.add_argument("--where",    default="Colombia",  help="Ubicación (default: 'Colombia')")
    parser.add_argument("--max-pages", type=int, default=4,   help="Máximo de páginas (default: 4)")
    parser.add_argument("--max-jobs",  type=int, default=200, help="Máximo de vacantes (default: 200)")
    args = parser.parse_args()

    run(what=args.what, where=args.where, max_pages=args.max_pages, max_jobs=args.max_jobs)
