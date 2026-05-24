"""Aplica pool_final_with_no_tech.json a Supabase vía PostgREST (B7.5)."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND_ROOT))

from dotenv import load_dotenv

load_dotenv(BACKEND_ROOT / ".env")

from supabase import create_client

POOL_FINAL = Path(__file__).resolve().parent / "cache" / "translated" / "pool_final_with_no_tech.json"
BATCH = 50


def _row_db(item: dict) -> dict:
    row = {
        "sector": item["sector"],
        "skill": item.get("skill"),
        "nivel": item["nivel"],
        "tipo": item["tipo"],
        "pregunta": item.get("pregunta") or item.get("pregunta_es"),
        "rubrica": item.get("rubrica"),
        "fuente": item.get("fuente"),
        "idioma": item.get("idioma", "es"),
    }
    if item.get("fuente_url"):
        row["fuente_url"] = item["fuente_url"]
    if item.get("idioma_origen"):
        row["idioma_origen"] = item["idioma_origen"]
    return row


def main() -> None:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL y SUPABASE_ANON_KEY requeridos")

    pool = json.loads(POOL_FINAL.read_text(encoding="utf-8"))
    rows = [_row_db(it) for it in pool]
    client = create_client(url, key)

    for i in range(0, len(rows), BATCH):
        chunk = rows[i : i + BATCH]
        client.table("interview_questions_seed").insert(chunk).execute()
        print(f"Insertados {min(i + BATCH, len(rows))}/{len(rows)}")

    print("OK — pool aplicado")


if __name__ == "__main__":
    main()
