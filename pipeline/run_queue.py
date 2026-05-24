"""
Procesa filas pending de scrape_queue llamando getonbrd y remotive.

Sin cron en hackathon — ejecutar manualmente o vía cron futuro:
  */30 * * * * cd /path/DulIa/pipeline && ../backend/venv/bin/python run_queue.py --batch 5

Run:
  python run_queue.py
  python run_queue.py --batch 3 --dry-run
  python run_queue.py --sources getonbrd,remotive --max-retries 3
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from datetime import datetime, timezone

from dotenv import load_dotenv
from supabase import create_client

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

load_dotenv(os.path.join(_HERE, "..", "backend", ".env"))

import getonbrd_fetcher
import remotive_fetcher

DEFAULT_SOURCES = ["getonbrd", "remotive"]
PER_SOURCE_LIMIT = 50


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


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


def _process_sources(
    filters: dict,
    sources: list[str],
    dry_run: bool,
) -> tuple[int, list[str]]:
    """Ejecuta fetchers según filters. Devuelve (jobs_inserted, errores)."""
    city = filters.get("city")
    sector = filters.get("sector")
    skills = filters.get("skills") or []
    skill_keyword = skills[0] if skills else None

    collected: list[dict] = []
    errors: list[str] = []

    for source in sources:
        try:
            if source == "getonbrd":
                rows = getonbrd_fetcher.fetch_jobs(
                    limit=PER_SOURCE_LIMIT,
                    sector=sector,
                    city=city,
                )
                if not rows and sector and not getonbrd_fetcher._is_tech_sector(sector):
                    continue
                collected.extend(rows)
            elif source == "remotive":
                rows = remotive_fetcher.fetch_jobs(
                    max_jobs=PER_SOURCE_LIMIT,
                    skill_keyword=skill_keyword,
                )
                collected.extend(rows)
            else:
                errors.append(f"source desconocida: {source}")
        except Exception as exc:
            errors.append(f"{source}: {exc}")

    collected = _dedupe_rows(collected)
    if dry_run:
        return len(collected), errors

    inserted = 0
    getonbrd_rows = [r for r in collected if r.get("source") == "getonbrd"]
    remotive_rows = [r for r in collected if r.get("source") == "remotive"]
    if getonbrd_rows:
        inserted += getonbrd_fetcher.upsert_jobs(getonbrd_rows)
    if remotive_rows:
        inserted += remotive_fetcher.upsert_jobs(remotive_rows)
    return inserted, errors


def _fetch_pending(supabase, batch: int, max_retries: int) -> list[dict]:
    res = (
        supabase.table("scrape_queue")
        .select("*")
        .eq("status", "pending")
        .lt("retry_count", max_retries)
        .order("priority", desc=True)
        .order("created_at", desc=False)
        .limit(batch)
        .execute()
    )
    return res.data or []


def run_batch(
    batch: int = 5,
    sources: list[str] | None = None,
    dry_run: bool = False,
    max_retries: int = 3,
) -> dict:
    started = time.time()
    sources = sources or DEFAULT_SOURCES
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

    pending = _fetch_pending(supabase, batch, max_retries)
    if not pending:
        return {
            "processed": 0,
            "done": 0,
            "failed": 0,
            "jobs_inserted": 0,
            "elapsed_s": round(time.time() - started, 1),
        }

    done = failed = total_inserted = 0

    for row in pending:
        queue_id = row["id"]
        filters = row.get("filters") or {}
        row_sources = row.get("source_hint") or sources
        if not row_sources:
            row_sources = sources

        label = f"id={queue_id} filters={filters} sources={row_sources}"
        if dry_run:
            print(f"[dry-run] procesaría {label}")
            done += 1
            continue

        supabase.table("scrape_queue").update(
            {"status": "processing", "started_at": _now_iso()}
        ).eq("id", queue_id).execute()

        try:
            inserted, errors = _process_sources(filters, row_sources, dry_run=False)
            total_inserted += inserted
            update = {
                "status": "done",
                "finished_at": _now_iso(),
                "jobs_inserted": inserted,
                "error_msg": "; ".join(errors) if errors else None,
            }
            supabase.table("scrape_queue").update(update).eq("id", queue_id).execute()
            done += 1
            print(f"OK {label} → {inserted} jobs")
        except Exception as exc:
            retry = int(row.get("retry_count") or 0) + 1
            supabase.table("scrape_queue").update(
                {
                    "status": "failed",
                    "finished_at": _now_iso(),
                    "error_msg": str(exc),
                    "retry_count": retry,
                }
            ).eq("id", queue_id).execute()
            failed += 1
            print(f"FAIL {label} → {exc}")

    elapsed = round(time.time() - started, 1)
    summary = {
        "processed": len(pending),
        "done": done,
        "failed": failed,
        "jobs_inserted": total_inserted,
        "elapsed_s": elapsed,
    }
    print(
        f"\nProcesadas: {summary['processed']} | Done: {summary['done']} | "
        f"Failed: {summary['failed']}\n"
        f"Jobs insertados: {summary['jobs_inserted']} | Tiempo: {summary['elapsed_s']}s"
    )
    return summary


def main():
    parser = argparse.ArgumentParser(description="Procesa scrape_queue (manual, sin cron)")
    parser.add_argument("--batch", type=int, default=5, help="Filas pending a procesar")
    parser.add_argument(
        "--sources",
        default=",".join(DEFAULT_SOURCES),
        help="Fuentes separadas por coma (default: getonbrd,remotive)",
    )
    parser.add_argument("--dry-run", action="store_true", help="Solo muestra qué procesaría")
    parser.add_argument("--max-retries", type=int, default=3, help="Máx reintentos por fila")
    args = parser.parse_args()

    sources = [s.strip() for s in args.sources.split(",") if s.strip()]
    run_batch(
        batch=args.batch,
        sources=sources,
        dry_run=args.dry_run,
        max_retries=args.max_retries,
    )


if __name__ == "__main__":
    main()
