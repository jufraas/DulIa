"""
Fetches remote tech jobs from Remotive public API and upserts them into the
Supabase `jobs` table.

Remotive API: GET https://remotive.com/api/remote-jobs
No auth required. Rate limit: max 4 requests/day recommended.
Source attribution required: link back to Remotive URL.

Relevant for DulIA: remote jobs open to Colombia / Latin America / Worldwide.

Run:
    python remotive_fetcher.py
    python remotive_fetcher.py --categories software-dev,data --max-jobs 50
    python remotive_fetcher.py --all-regions --max-jobs 100

Requires in .env:
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

API_URL = "https://remotive.com/api/remote-jobs"
USD_TO_COP = 4_200  # tasa fija aproximada

# Categorías relevantes para jóvenes colombianos
DEFAULT_CATEGORIES = [
    "software-dev",
    "devops-sysadmin",
    "data",
    "design",
    "marketing",
    "product",
    "qa",
    "customer-support",
    "business",
]

# Empresas reconocidas → status green automático
KNOWN_COMPANIES = {
    "stripe", "github", "gitlab", "shopify", "toptal", "automattic",
    "zapier", "buffer", "doist", "invision", "hotjar", "basecamp",
    "remote.com", "deel", "remote", "loom", "notion", "figma",
    "linear", "vercel", "netlify", "hashicorp", "datadog", "elastic",
    "twilio", "sendgrid", "cloudflare", "digitalocean", "mongodb",
    "atlassian", "hubspot", "intercom", "zendesk", "freshworks",
    "mercadolibre", "rappi", "bancolombia", "nubank", "clip",
    "konfio", "truora", "bold", "habi", "addi",
}

# Ubicaciones que permiten candidatos colombianos
LATAM_LOCATIONS = {
    "worldwide", "anywhere", "global", "latin america", "latam",
    "south america", "colombia", "bogota", "medellín", "medellin",
    "barranquilla", "cali", "remote",
}

# Mapeo de categoría Remotive → sector DulIA
CATEGORY_TO_SECTOR = {
    "software-dev":      "tecnología",
    "devops-sysadmin":   "tecnología",
    "data":              "datos",
    "design":            "diseño",
    "marketing":         "marketing",
    "product":           "tecnología",
    "qa":                "tecnología",
    "customer-support":  "ventas",
    "finance":           "fintech",
    "hr":                "general",
    "writing":           "marketing",
    "education":         "educación",
    "other":             "general",
}


def _unique_hash(title: str, company: str, url: str) -> str:
    s = f"{title}|{company}|{url}".lower().strip()
    return hashlib.sha256(s.encode()).hexdigest()


def _parse_salary(salary_str: str) -> tuple[int | None, int | None]:
    """Parses salary strings like '$80k - $100k', 'up to $120k', '$50,000'. Returns (min, max) in COP."""
    if not salary_str:
        return None, None
    text = salary_str.lower().replace(",", "")
    nums = re.findall(r"[\d.]+k?", text)
    values = []
    for n in nums:
        try:
            v = float(n.replace("k", "")) * (1000 if n.endswith("k") else 1)
            values.append(int(v * USD_TO_COP))
        except ValueError:
            pass
    if not values:
        return None, None
    return min(values), max(values) if len(values) > 1 else (values[0], None)


def _is_latam_friendly(location_str: str) -> bool:
    """Returns True if the job is open to Colombian candidates."""
    if not location_str:
        return True  # no restriction = worldwide
    loc = location_str.lower()
    return any(kw in loc for kw in LATAM_LOCATIONS)


def _infer_status(company: str, salary_min: int | None, description: str) -> str:
    """
    green: empresa conocida, O tiene salario, O descripción larga (real).
    yellow: sin salario y descripción corta.
    red: nunca en Remotive (son empresas verificadas).
    """
    if company.lower().strip() in KNOWN_COMPANIES:
        return "green"
    if salary_min:
        return "green"
    if len(description) > 200:
        return "green"
    return "yellow"


def _infer_hires_youth(title: str, description: str) -> bool:
    text = f"{title} {description}".lower()
    return any(w in text for w in [
        "junior", "jr ", "entry level", "entry-level", "trainee",
        "intern", "graduate", "no experience", "new grad",
    ])


def _strip_html(html: str) -> str:
    text = re.sub(r"<[^>]+>", " ", html or "")
    return re.sub(r"\s+", " ", text).strip()


def _map_row(raw: dict) -> dict:
    title   = (raw.get("title") or "").strip()
    company = (raw.get("company_name") or "Desconocida").strip()
    url     = (raw.get("url") or "").strip()

    description = _strip_html(raw.get("description") or "")[:2000]
    tags = [t.lower().strip() for t in (raw.get("tags") or []) if t]

    salary_str = raw.get("salary") or ""
    salary_min, salary_max = _parse_salary(salary_str)

    category_tag = raw.get("category") or "other"
    sector = CATEGORY_TO_SECTOR.get(category_tag, "tecnología")

    pub_date = raw.get("publication_date")
    try:
        posted_at = datetime.fromisoformat(pub_date).astimezone(timezone.utc).isoformat() if pub_date else None
    except (ValueError, AttributeError):
        posted_at = None

    hires_youth = _infer_hires_youth(title, description)
    status = _infer_status(company, salary_min, description)

    return {
        "title":               title,
        "company":             company,
        "city":                None,       # remote — sin ciudad fija
        "department":          None,
        "location":            raw.get("candidate_required_location") or "Worldwide",
        "salary_min":          salary_min,
        "salary_max":          salary_max,
        "description":         description,
        "skills_required":     tags,
        "sector":              sector,
        "experience_required": 0,
        "education_level_req": None,
        "modality":            "remoto",   # Remotive es 100% remoto
        "source":              "remotive",
        "url":                 url,
        "unique_hash":         _unique_hash(title, company, url),
        "posted_at":           posted_at,
        "scraped_at":          datetime.now(timezone.utc).isoformat(),
        "repost_count":        0,
        "status":              status,
        "hires_youth":         hires_youth,
        "active":              True,
    }


def _fetch_category(category: str, limit: int = 100) -> list[dict]:
    """Fetches jobs for one category from Remotive."""
    resp = requests.get(API_URL, params={"category": category, "limit": limit}, timeout=20)
    resp.raise_for_status()
    return resp.json().get("jobs") or []


def fetch_jobs(
    max_jobs: int = 50,
    categories: list[str] | None = None,
    latam_only: bool = True,
    skill_keyword: str | None = None,
) -> list[dict]:
    """Obtiene vacantes de Remotive sin escribir en BD."""
    if categories is None:
        categories = DEFAULT_CATEGORIES

    keyword = (skill_keyword or "").strip().lower()
    collected: list[dict] = []
    seen_hashes: set[str] = set()

    for category in categories:
        if len(collected) >= max_jobs:
            break

        try:
            jobs = _fetch_category(category)
        except Exception:
            continue

        for raw in jobs:
            if len(collected) >= max_jobs:
                break

            cand_location = raw.get("candidate_required_location") or ""
            if latam_only and not _is_latam_friendly(cand_location):
                continue

            row = _map_row(raw)
            if keyword:
                haystack = " ".join(
                    [
                        row.get("title") or "",
                        row.get("description") or "",
                        " ".join(row.get("skills_required") or []),
                    ]
                ).lower()
                if keyword not in haystack:
                    continue

            h = row["unique_hash"]
            if h in seen_hashes:
                continue
            seen_hashes.add(h)
            collected.append(row)

        time.sleep(0.5)

    return collected


def upsert_jobs(rows: list[dict]) -> int:
    if not rows:
        return 0
    res = sb.table("jobs").upsert(rows, on_conflict="unique_hash").execute()
    return len(res.data or [])


def run(categories: list[str] | None = None, max_jobs: int = 50, latam_only: bool = True, skill_keyword: str | None = None):
    if categories is None:
        categories = DEFAULT_CATEGORIES

    print(f"\n=== Remotive fetcher — categories={categories} latam_only={latam_only} ===")
    collected = fetch_jobs(
        max_jobs=max_jobs,
        categories=categories,
        latam_only=latam_only,
        skill_keyword=skill_keyword,
    )

    if not collected:
        print("\nNo jobs fetched.")
        return

    print(f"\nUpserting {len(collected)} jobs into Supabase ...")
    inserted = upsert_jobs(collected)
    print(f"Done — {inserted} rows upserted.\n")
    for v in collected[:10]:
        loc = v.get("location") or "Worldwide"
        st = v.get("status", "?")
        print(f"  [REMOTO] [{st}] {v.get('title','?')[:55]:55} — {v.get('company','?')} ({loc})")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Remotive fetcher para DulIA")
    parser.add_argument(
        "--categories",
        default=",".join(DEFAULT_CATEGORIES),
        help=f"Categorías separadas por coma (default: {','.join(DEFAULT_CATEGORIES)})",
    )
    parser.add_argument("--max-jobs",    type=int,  default=50,   help="Máximo de vacantes por run (default: 50)")
    parser.add_argument("--all-regions", action="store_true",     help="Incluir jobs de cualquier región (default: solo LATAM/Worldwide)")
    args = parser.parse_args()

    run(
        categories=args.categories.split(","),
        max_jobs=args.max_jobs,
        latam_only=not args.all_regions,
    )
