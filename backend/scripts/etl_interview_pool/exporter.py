"""Generación de migración SQL 015 e inserción en Supabase. — B7.5"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parents[3]
MIGRATION_PATH = REPO_ROOT / "backend" / "migrations" / "015_replace_interview_pool_with_real_sources.sql"
ETL_DIR = Path(__file__).resolve().parent
POOL_FINAL = ETL_DIR / "cache" / "translated" / "pool_final_with_no_tech.json"

INSERT_CHUNK = 100


def _esc_sql_text(value: str | None) -> str:
    """Escapa string para literal SQL."""
    if value is None:
        return "NULL"
    return "'" + value.replace("'", "''") + "'"


def _esc_sql_json(value: dict[str, Any] | None) -> str:
    if value is None:
        return "NULL"
    raw = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return f"'{raw.replace(chr(39), chr(39) + chr(39))}'::jsonb"


def _fila_tech(item: dict[str, Any]) -> str:
    return (
        f"({_esc_sql_text(item.get('sector', 'tecnologia'))}, "
        f"{_esc_sql_text(item.get('skill'))}, "
        f"{_esc_sql_text(item.get('nivel'))}, "
        f"{_esc_sql_text(item.get('tipo'))}, "
        f"{_esc_sql_text(item.get('pregunta'))}, "
        f"{_esc_sql_json(item.get('rubrica'))}, "
        f"{_esc_sql_text(item.get('fuente'))}, "
        f"{_esc_sql_text(item.get('fuente_url'))}, "
        f"{_esc_sql_text(item.get('idioma', 'es'))}, "
        f"{_esc_sql_text(item.get('idioma_origen', 'en'))})"
    )


def _fila_no_tech(item: dict[str, Any]) -> str:
    return (
        f"({_esc_sql_text(item.get('sector'))}, "
        f"{_esc_sql_text(item.get('skill'))}, "
        f"{_esc_sql_text(item.get('nivel'))}, "
        f"{_esc_sql_text(item.get('tipo'))}, "
        f"{_esc_sql_text(item.get('pregunta'))}, "
        f"{_esc_sql_json(item.get('rubrica'))}, "
        f"{_esc_sql_text(item.get('fuente', 'ai_generated'))}, "
        f"{_esc_sql_text(item.get('idioma', 'es'))})"
    )


def generar_sql_truncate_y_inserts(
    items_tech: list[dict[str, Any]],
    items_no_tech: list[dict[str, Any]],
) -> str:
    """Genera SQL completo: backup + truncate + inserts tech + inserts no-tech."""
    lineas = [
        "-- B7.5: Reemplazo del pool interview_questions_seed con fuentes reales",
        "-- Generado por ETL backend/scripts/etl_interview_pool/",
        "",
        "BEGIN;",
        "",
        "-- Backup defensivo",
        "CREATE TABLE IF NOT EXISTS interview_questions_seed_backup_2026_05_24 AS",
        "  SELECT * FROM interview_questions_seed;",
        "",
        "TRUNCATE TABLE interview_questions_seed RESTART IDENTITY;",
        "",
    ]

    if items_tech:
        lineas.append("-- Inserts fuentes reales (tech)")
        filas = [_fila_tech(it) for it in items_tech]
        for i in range(0, len(filas), INSERT_CHUNK):
            chunk = filas[i : i + INSERT_CHUNK]
            lineas.append(
                "INSERT INTO public.interview_questions_seed "
                "(sector, skill, nivel, tipo, pregunta, rubrica, fuente, fuente_url, idioma, idioma_origen) VALUES"
            )
            lineas.append("  " + ",\n  ".join(chunk) + ";")
        lineas.append("")

    if items_no_tech:
        lineas.append("-- Inserts pool no-tech preservado (ai_generated)")
        filas_nt = [_fila_no_tech(it) for it in items_no_tech]
        for i in range(0, len(filas_nt), INSERT_CHUNK):
            chunk = filas_nt[i : i + INSERT_CHUNK]
            lineas.append(
                "INSERT INTO public.interview_questions_seed "
                "(sector, skill, nivel, tipo, pregunta, rubrica, fuente, idioma) VALUES"
            )
            lineas.append("  " + ",\n  ".join(chunk) + ";")
        lineas.append("")

    lineas.append("COMMIT;")
    lineas.append("")
    return "\n".join(lineas)


def escribir_migracion(path: Path, sql: str) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(sql, encoding="utf-8")
    logger.info("Migración escrita: %s (%s bytes)", path, path.stat().st_size)
    return path


def cargar_pool_desde_cache() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Carga pool final y separa tech vs no-tech."""
    if not POOL_FINAL.is_file():
        raise FileNotFoundError(
            f"No existe {POOL_FINAL}. Ejecuta primero: python -m scripts.etl_interview_pool.main --fase enrich"
        )
    pool = json.loads(POOL_FINAL.read_text(encoding="utf-8"))
    tech = [it for it in pool if it.get("fuente") != "ai_generated"]
    no_tech = [it for it in pool if it.get("fuente") == "ai_generated"]
    return tech, no_tech


def generar_migracion_desde_cache() -> Path:
    tech, no_tech = cargar_pool_desde_cache()
    sql = generar_sql_truncate_y_inserts(tech, no_tech)
    return escribir_migracion(MIGRATION_PATH, sql)
