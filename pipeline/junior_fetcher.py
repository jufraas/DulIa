"""
Fetches junior and entry-level jobs from Get on Board (getonbrd.com) across all
18 categories, keeping only Colombia + remote jobs with seniority 1 (Sin
experiencia) or 2 (Junior), plus any with explicit junior keywords in the title.

Upserts into Supabase `jobs` table.

Run:  python junior_fetcher.py
"""

import os
import re
import time
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

API_BASE = "https://www.getonbrd.com/api/v0"
USD_TO_COP = 4_200

# Seniority IDs on Get on Board
JUNIOR_SENIORITY_IDS = {1, 2}  # 1 = Sin experiencia, 2 = Junior

SENIORITY_TO_EXP = {
    1: 0,   # Sin experiencia
    2: 1,   # Junior
    3: 3,   # Semi Senior
    4: 5,   # Senior
    5: 8,   # Expert
}

# Title keywords that also signal entry-level (case-insensitive)
JUNIOR_TITLE_KW = {
    "junior", "jr", "trainee", "aprendiz", "practicante",
    "auxiliar", "asistente", "entry level", "sin experiencia",
}

ALL_CATEGORIES = [
    "programming",
    "sysadmin-devops-qa",
    "data-science-analytics",
    "mobile-developer",
    "machine-learning-ai",
    "design-ux",
    "technical-support",
    "customer-support",
    "innovation-agile",
    "operations-management",
    "sales",
    "digital-marketing",
    "cybersecurity",
    "advertising-media",
    "hr",
    "education-coaching",
    "hardware-electronics",
    "other",
]


def _strip_html(html: str) -> str:
    text = re.sub(r"<[^>]+>", " ", html or "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _to_cop(value):
    if value is None:
        return None
    v = int(value)
    return v * USD_TO_COP if v < 50_000 else v


def _fetch_category_page(category: str, page: int = 1) -> list:
    resp = requests.get(
        f"{API_BASE}/categories/{category}/jobs",
        params={
            "per_page": 100,
            "page": page,
            "expand[]": ["tags", "company"],
        },
        timeout=20,
    )
    resp.raise_for_status()
    return resp.json().get("data", [])


def _is_relevant(job: dict) -> bool:
    """Remote jobs or explicitly Colombia-based."""
    attrs = job["attributes"]
    if attrs.get("remote"):
        return True
    return "Colombia" in (attrs.get("countries") or [])


def _is_junior(job: dict) -> bool:
    """Seniority 1-2 OR junior keyword in title."""
    attrs = job["attributes"]
    seniority_id = (attrs.get("seniority") or {}).get("data", {}).get("id")
    if seniority_id in JUNIOR_SENIORITY_IDS:
        return True
    title = (attrs.get("title") or "").lower()
    return any(kw in title for kw in JUNIOR_TITLE_KW)


def _map_row(job: dict) -> dict:
    attrs = job["attributes"]
    job_id = job["id"]

    company = (
        attrs.get("company", {})
        .get("data", {})
        .get("attributes", {})
        .get("name", "")
    )

    tags = attrs.get("tags", {}).get("data", [])
    skills = [
        t["attributes"]["name"].lower()
        for t in tags
        if t.get("attributes", {}).get("name")
    ]

    seniority_id = (attrs.get("seniority") or {}).get("data", {}).get("id")

    if attrs.get("remote"):
        modality = "remoto"
        city = None
        department = None
    else:
        modality = "presencial"
        countries = attrs.get("countries") or []
        city = countries[0] if countries else None
        department = None

    published_unix = attrs.get("published_at")
    posted_at = (
        datetime.fromtimestamp(published_unix, tz=timezone.utc).isoformat()
        if published_unix
        else None
    )

    description = _strip_html(attrs.get("description") or "")

    experience_required = SENIORITY_TO_EXP.get(seniority_id, 1)

    return {
        "title": (attrs.get("title") or "").strip(),
        "company": company,
        "city": city,
        "department": department,
        "salary_min": _to_cop(attrs.get("min_salary")),
        "salary_max": _to_cop(attrs.get("max_salary")),
        "description": description[:2000],
        "skills_required": skills,
        "sector": attrs.get("category_name"),
        "experience_required": experience_required,
        "education_level_req": None,
        "modality": modality,
        "source": "getonbrd",
        "url": f"https://www.getonbrd.com/jobs/{job_id}",
        "posted_at": posted_at,
        "repost_count": 0,
        "status": "green",
        "hires_youth": None,
        "active": True,
        "unique_hash": job_id,
    }


def run():
    collected: list = []
    seen_ids: set = set()

    for category in ALL_CATEGORIES:
        print(f"\nFetching [{category}] ...")
        page = 1
        cat_count = 0

        while True:
            try:
                jobs = _fetch_category_page(category, page)
            except Exception as exc:
                print(f"  Error on page {page}: {exc}")
                break

            if not jobs:
                break

            for job in jobs:
                job_id = job["id"]
                if job_id in seen_ids:
                    continue
                if not _is_relevant(job):
                    continue
                if not _is_junior(job):
                    continue
                seen_ids.add(job_id)
                collected.append(_map_row(job))
                cat_count += 1

            if len(jobs) < 100:
                break
            page += 1
            time.sleep(0.5)

        print(f"  +{cat_count} junior jobs  (total: {len(collected)})")
        time.sleep(1)

    if not collected:
        print("\nNo junior jobs found.")
        return

    print(f"\nUpserting {len(collected)} junior jobs into Supabase ...")
    res = sb.table("jobs").upsert(collected, on_conflict="url").execute()
    print(f"Done — {len(res.data)} rows upserted.\n")
    for v in res.data:
        flag = "[REMOTO]" if v.get("modality") == "remoto" else "[LOCAL] "
        exp = v.get("experience_required", "?")
        print(f"  {flag} exp={exp} {v.get('title','?')[:50]:50} — {v.get('company','?')}")


if __name__ == "__main__":
    print("=== Get on Board Junior Fetcher ===")
    run()
