"""
Fetches up to LIMIT jobs from Get on Board (getonbrd.com) and upserts them
into the Supabase `jobs` table.

Includes: jobs based in Colombia + remote jobs (open to Colombian applicants).
Salary: values < 50 000 are assumed USD and converted to COP at USD_TO_COP rate;
        values >= 50 000 are assumed already in COP.

Run:  python getonbrd_fetcher.py
"""

import os
import re
import time
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client

_HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_HERE, "..", "backend", ".env"))
sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

API_BASE = "https://www.getonbrd.com/api/v0"
LIMIT = 100
USD_TO_COP = 4_200  # approximate fixed rate

# Seniority ID → approximate years of experience required
SENIORITY_TO_EXP = {
    1: 0,   # Sin experiencia
    2: 1,   # Junior
    3: 3,   # Semi Senior
    4: 5,   # Senior
    5: 8,   # Expert
}

# Categories to pull from (tech-focused, relevant for young Colombian talent)
CATEGORIES = [
    "programming",
    "sysadmin-devops-qa",
    "data-science-analytics",
    "mobile-developer",
    "machine-learning-ai",
    "design-ux",
    "technical-support",
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


def _fetch_category_page(category: str, page: int = 1) -> list[dict]:
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
    """Include remote jobs and jobs explicitly in Colombia."""
    attrs = job["attributes"]
    if attrs.get("remote"):
        return True
    return "Colombia" in (attrs.get("countries") or [])


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

    seniority_id = (attrs.get("seniority") or {}).get("data", {}).get("id")
    experience_required = SENIORITY_TO_EXP.get(seniority_id, 2)

    return {
        "title": (attrs.get("title") or "").strip(),
        "company": company,
        "city": city,
        "department": department,
        "salary_min": _to_cop(attrs.get("min_salary")),
        "salary_max": _to_cop(attrs.get("max_salary")),
        "description": description[:2000],  # cap to avoid DB limits
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
    collected: list[dict] = []
    seen_ids: set[str] = set()

    for category in CATEGORIES:
        if len(collected) >= LIMIT:
            break

        print(f"\nFetching [{category}] ...")
        page = 1
        while len(collected) < LIMIT:
            try:
                jobs = _fetch_category_page(category, page)
            except Exception as exc:
                print(f"  Error on page {page}: {exc}")
                break

            if not jobs:
                break

            new_this_page = 0
            for job in jobs:
                if len(collected) >= LIMIT:
                    break
                job_id = job["id"]
                if job_id in seen_ids or not _is_relevant(job):
                    continue
                seen_ids.add(job_id)
                collected.append(_map_row(job))
                new_this_page += 1

            print(f"  page {page}: +{new_this_page} relevant  (total: {len(collected)})")

            # Stop paging if we got fewer than 100 — no more pages
            if len(jobs) < 100:
                break
            page += 1
            time.sleep(0.5)

        time.sleep(1)

    if not collected:
        print("\nNo jobs fetched. Check API connectivity and credentials.")
        return

    print(f"\nUpserting {len(collected)} jobs into Supabase ...")
    res = sb.table("jobs").upsert(collected, on_conflict="url").execute()
    print(f"Done — {len(res.data)} rows upserted.\n")
    for v in res.data:
        flag = "[REMOTO]" if v.get("modality") == "remoto" else "[LOCAL] "
        print(f"  {flag} {v.get('title','?')[:50]:50} — {v.get('company','?')}")


if __name__ == "__main__":
    print("=== Get on Board fetcher ===")
    run()
