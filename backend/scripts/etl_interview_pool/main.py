"""
Entrypoint del ETL de pool de entrevistas (B7).

Uso:
  cd backend && python -m scripts.etl_interview_pool.main --fase enrich
  cd backend && python -m scripts.etl_interview_pool.main --fase enrich --limit 30

Requiere: GEMINI_API_KEY en backend/.env (fase enrich).
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import random
import sys
import time
from pathlib import Path

# Asegurar imports de app.* desde backend/
BACKEND_ROOT = Path(__file__).resolve().parents[2]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from dotenv import load_dotenv

load_dotenv(BACKEND_ROOT / ".env")

from scripts.etl_interview_pool.classifier import clasificar_todas
from scripts.etl_interview_pool.non_tech_pool import cargar_pool_no_tech_desde_seed
from scripts.etl_interview_pool.parsers import consolidar_pool, parsear_todas_fuentes
from scripts.etl_interview_pool.sources import descargar_todas_fuentes, resumen_cache
from scripts.etl_interview_pool.exporter import MIGRATION_PATH, generar_migracion_desde_cache
from scripts.etl_interview_pool.translator import traducir_todas


ETL_DIR = Path(__file__).resolve().parent
POOL_ENRIQUECIDO = ETL_DIR / "cache" / "translated" / "pool_tech_enriched.json"
POOL_FINAL = ETL_DIR / "cache" / "translated" / "pool_final_with_no_tech.json"

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("etl_interview_pool")


async def fase_download() -> dict:
    """B7.2 — descarga fuentes externas con caché."""
    fuentes = await descargar_todas_fuentes()

    print("\n=== Checkpoint B7.2 — Descarga ===")
    for item in resumen_cache():
        print(f"  {item['name']}: {item['bytes']:,} bytes → {item['path']}")

    print("\nResumen por fuente:")
    for clave, data in fuentes.items():
        if isinstance(data, str):
            print(f"  {clave}: {len(data.encode('utf-8')):,} bytes (markdown)")
        else:
            print(f"  {clave}: {len(data):,} filas (JSON)")

    return fuentes


async def fase_parse(fuentes: dict | None = None, limit: int | None = None) -> list[dict]:
    """B7.3 — parsing y normalización."""
    if fuentes is None:
        fuentes = await descargar_todas_fuentes()

    parsed_por_fuente, conteos_parseo = parsear_todas_fuentes(fuentes)

    print("\n=== Checkpoint B7.3 — Parsing ===")
    print("\nConteo tras parseo (antes de limitar):")
    for fuente_id in sorted(conteos_parseo.keys()):
        print(f"  {fuente_id}: {conteos_parseo[fuente_id]}")
    print("\nConteo tras limitar_pool:")
    total_antes_dedup = 0
    for fuente_id, items in sorted(parsed_por_fuente.items()):
        print(f"  {fuente_id}: {len(items)}")
        total_antes_dedup += len(items)
    print(f"  TOTAL (sin dedup cross-fuente): {total_antes_dedup}")

    pool = consolidar_pool(parsed_por_fuente)
    print(f"\nConteo tras deduplicar_preguntas: {len(pool)}")

    if limit:
        pool = pool[:limit]
        print(f"  (limitado a {limit} para esta corrida)")

    rng = random.Random(42)
    print("\n5 ejemplos aleatorios por fuente:")
    for fuente_id in sorted(parsed_por_fuente.keys()):
        ejemplos = rng.sample(
            parsed_por_fuente[fuente_id],
            min(5, len(parsed_por_fuente[fuente_id])),
        )
        print(f"\n  [{fuente_id}]")
        for ex in ejemplos:
            print(f"    • {ex['pregunta_en'][:120]}{'…' if len(ex['pregunta_en']) > 120 else ''}")

    return pool


async def fase_enrich(limit: int | None = None, skip_gemini: bool = False) -> tuple[list[dict], list[dict]]:
    """B7.4 — traducción + clasificación Gemini + pool no-tech."""
    inicio = time.time()

    # Reutilizar pool enriquecido si existe y no hay limit
    if not limit and not skip_gemini and POOL_ENRIQUECIDO.is_file():
        pool_tech = json.loads(POOL_ENRIQUECIDO.read_text(encoding="utf-8"))
        logger.info("Caché hit pool tech enriquecido: %s items", len(pool_tech))
    else:
        pool = await fase_parse(limit=limit)
        if skip_gemini:
            pool_tech = pool
        else:
            pool_traducido, stats_tr = await traducir_todas(pool)
            pool_tech, stats_cl = await clasificar_todas(pool_traducido)

            # Normalizar campos finales tech
            for item in pool_tech:
                item["pregunta"] = item.get("pregunta_es") or item["pregunta_en"]
                item["sector"] = "tecnologia"

            POOL_ENRIQUECIDO.parent.mkdir(parents=True, exist_ok=True)
            POOL_ENRIQUECIDO.write_text(
                json.dumps(pool_tech, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )

            elapsed = time.time() - inicio
            print("\n=== Checkpoint B7.4 — Traducción + Clasificación ===")
            print(f"\nStats traducción: {stats_tr}")
            print(f"Stats clasificación: {stats_cl}")
            print(f"Tiempo parcial Gemini: {elapsed / 60:.1f} min")

    pool_no_tech = cargar_pool_no_tech_desde_seed()
    pool_final = pool_tech + pool_no_tech
    POOL_FINAL.write_text(
        json.dumps(pool_final, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    elapsed_total = time.time() - inicio
    print(f"\nPool tech: {len(pool_tech)} | Pool no-tech (ai_generated): {len(pool_no_tech)}")
    print(f"Pool final combinado: {len(pool_final)}")
    print(f"Tiempo total fase enrich: {elapsed_total / 60:.1f} min")

    rng = random.Random(7)
    ejemplos = rng.sample(pool_tech, min(10, len(pool_tech)))
    print("\n10 ejemplos traducidos + clasificados:")
    for ex in ejemplos:
        kw = (ex.get("rubrica") or {}).get("keywords_clave", [])
        print(f"\n  EN: {ex['pregunta_en'][:100]}…")
        print(f"  ES: {ex.get('pregunta_es', ex.get('pregunta', ''))[:100]}…")
        print(f"  skill={ex.get('skill')} | tipo={ex.get('tipo')} | nivel={ex.get('nivel')}")
        print(f"  keywords: {kw[:4]}")

    return pool_tech, pool_no_tech


async def fase_export(apply: bool = False) -> Path:
    """B7.5 — genera migración SQL 015 desde caché; opcionalmente aplica vía PostgREST."""
    path = generar_migracion_desde_cache()
    print("\n=== Checkpoint B7.5 — Export SQL ===")
    print(f"  Archivo: {path}")
    print(f"  Tamaño: {path.stat().st_size:,} bytes")
    if apply:
        import subprocess

        subprocess.run(
            [sys.executable, "-m", "scripts.etl_interview_pool.apply_pool"],
            cwd=str(BACKEND_ROOT),
            check=True,
        )
        print("  Pool aplicado a Supabase (PostgREST)")
    return path


async def run_etl(fase: str, limit: int | None = None, apply: bool = False) -> None:
    if fase == "download":
        await fase_download()
    elif fase == "parse":
        await fase_parse(limit=limit)
    elif fase == "enrich":
        await fase_enrich(limit=limit)
    elif fase == "export":
        await fase_export(apply=apply)
    elif fase == "all":
        fuentes = await fase_download()
        await fase_parse(fuentes, limit=limit)
        await fase_enrich(limit=limit)
        await fase_export()
    else:
        logger.info("Fase '%s' no implementada aún.", fase)


def main() -> None:
    parser = argparse.ArgumentParser(description="ETL pool entrevistas DulIA (B7)")
    parser.add_argument(
        "--fase",
        default="download",
        choices=["download", "parse", "enrich", "export", "all"],
        help="Fase del ETL a ejecutar",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limitar preguntas tech a procesar (debug/smoke)",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Tras export, insertar pool en Supabase (requiere TRUNCATE previo)",
    )
    args = parser.parse_args()
    try:
        asyncio.run(run_etl(args.fase, limit=args.limit, apply=args.apply))
    except Exception as exc:
        logger.error("ETL abortado: %s", exc)
        sys.exit(1)


if __name__ == "__main__":
    main()
