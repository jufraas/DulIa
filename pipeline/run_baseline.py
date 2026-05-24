"""
Scrape baseline manual con filtros explícitos (sin pasar por scrape_queue).

Run:
  python run_baseline.py --city Barranquilla --sector tecnologia --skills python,javascript
  python run_baseline.py --limit 100 --dry-run
  python run_baseline.py --sources remotive --limit 30
"""

from __future__ import annotations

import argparse
import os
import sys
import time

from dotenv import load_dotenv

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

load_dotenv(os.path.join(_HERE, "..", "backend", ".env"))

import getonbrd_fetcher
import remotive_fetcher

DEFAULT_SOURCES = ["getonbrd", "remotive"]


def _dedupe_rows(rows: list[dict]) -> list[dict]:
    seen: set[str] = set()
    out: list[dict] = []
    for row in rows:
        key = row.get("unique_hash") or row.get("url")
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(row)
    return out


def run_baseline(
    city: str | None = None,
    sector: str | None = None,
    skills: list[str] | None = None,
    limit: int = 200,
    sources: list[str] | None = None,
    dry_run: bool = False,
) -> dict:
    started = time.time()
    sources = sources or DEFAULT_SOURCES
    skills = skills or []
    skill_keyword = skills[0] if skills else None

    collected: list[dict] = []
    per_source = max(limit // max(len(sources), 1), 10)

    for source in sources:
        if len(collected) >= limit:
            break
        remaining = limit - len(collected)
        cap = min(per_source, remaining)

        if source == "getonbrd":
            rows = getonbrd_fetcher.fetch_jobs(limit=cap, sector=sector, city=city)
            collected.extend(rows)
        elif source == "remotive":
            rows = remotive_fetcher.fetch_jobs(max_jobs=cap, skill_keyword=skill_keyword)
            collected.extend(rows)

    collected = _dedupe_rows(collected)[:limit]

    inserted = 0
    if not dry_run and collected:
        getonbrd_rows = [r for r in collected if r.get("source") == "getonbrd"]
        remotive_rows = [r for r in collected if r.get("source") == "remotive"]
        if getonbrd_rows:
            inserted += getonbrd_fetcher.upsert_jobs(getonbrd_rows)
        if remotive_rows:
            inserted += remotive_fetcher.upsert_jobs(remotive_rows)

    elapsed = round(time.time() - started, 1)
    summary = {
        "fetched": len(collected),
        "inserted": inserted if not dry_run else 0,
        "dry_run": dry_run,
        "elapsed_s": elapsed,
    }

    mode = "dry-run" if dry_run else "live"
    print(
        f"\n[{mode}] Baseline — city={city} sector={sector} skills={skills}\n"
        f"Fetched: {summary['fetched']} | Inserted: {summary['inserted']} | "
        f"Tiempo: {summary['elapsed_s']}s"
    )
    return summary


def main():
    parser = argparse.ArgumentParser(description="Scrape baseline con filtros explícitos")
    parser.add_argument("--city", default=None, help="Ciudad objetivo")
    parser.add_argument("--sector", default=None, help="Sector objetivo")
    parser.add_argument(
        "--skills",
        default="",
        help="Skills separadas por coma (primera usada como keyword en Remotive)",
    )
    parser.add_argument("--limit", type=int, default=200, help="Máximo global de vacantes")
    parser.add_argument(
        "--sources",
        default=",".join(DEFAULT_SOURCES),
        help="Fuentes separadas por coma",
    )
    parser.add_argument("--dry-run", action="store_true", help="Fetch sin upsert")
    args = parser.parse_args()

    skills = [s.strip() for s in args.skills.split(",") if s.strip()]
    sources = [s.strip() for s in args.sources.split(",") if s.strip()]

    run_baseline(
        city=args.city,
        sector=args.sector,
        skills=skills,
        limit=args.limit,
        sources=sources,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
