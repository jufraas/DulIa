"""Carga del pool no-tech desde el seed SQL original (sin reprocesar con Gemini)."""

from __future__ import annotations

import json
import logging
import re
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parents[3]
SEED_SQL = REPO_ROOT / "backend" / "migrations" / "013_seed_interview_questions.sql"

SECTORES_NO_TECH = {
    "marketing",
    "ventas",
    "contabilidad",
    "servicio_cliente",
    "operaciones",
    "administracion",
    "salud",
    "educacion",
    "general",
}


def _parse_insert_line(linea: str) -> dict[str, Any] | None:
    """Parsea una línea INSERT del seed 013."""
    if not linea.startswith("INSERT INTO"):
        return None

    prefix = "INSERT INTO public.interview_questions_seed (sector, skill, nivel, tipo, pregunta, rubrica) VALUES "
    if prefix not in linea:
        return None

    body = linea.split(prefix, 1)[1].strip()
    if not body.endswith(");"):
        return None
    body = body[:-2]

    campos: list[str | None] = []
    actual: list[str] = []
    en_string = False
    i = 0
    while i < len(body):
        ch = body[i]

        if not en_string and body[i : i + 4] == "NULL":
            campos.append(None)
            i += 4
            if i < len(body) and body[i] == ",":
                i += 1
            continue

        if en_string:
            if ch == "'" and i + 1 < len(body) and body[i + 1] == "'":
                actual.append("'")
                i += 2
                continue
            if ch == "'":
                en_string = False
                campos.append("".join(actual))
                actual = []
                i += 1
                if i < len(body) and body[i] == ",":
                    i += 1
                continue
            actual.append(ch)
            i += 1
            continue

        if ch == "'":
            en_string = True
            i += 1
            continue
        i += 1

    if len(campos) < 6:
        return None

    sector = campos[0]
    skill = campos[1]
    nivel = campos[2]
    tipo = campos[3]
    pregunta = campos[4]
    rubrica_raw = campos[5]

    if not sector or sector not in SECTORES_NO_TECH:
        return None
    if not pregunta or not rubrica_raw:
        return None

    rubrica = json.loads(rubrica_raw)
    return {
        "sector": sector,
        "skill": skill,
        "nivel": nivel,
        "tipo": tipo,
        "pregunta": pregunta,
        "pregunta_es": pregunta,
        "rubrica": rubrica,
        "fuente": "ai_generated",
        "fuente_url": None,
        "idioma": "es",
        "idioma_origen": "es",
    }


def cargar_pool_no_tech_desde_seed() -> list[dict[str, Any]]:
    """
    Lee migración 013 y extrae filas donde sector != 'tecnologia'.
    Marca fuente='ai_generated', fuente_url=NULL.
    """
    if not SEED_SQL.is_file():
        raise FileNotFoundError(f"No se encontró seed SQL: {SEED_SQL}")

    items: list[dict[str, Any]] = []
    for linea in SEED_SQL.read_text(encoding="utf-8").splitlines():
        parsed = _parse_insert_line(linea.strip())
        if parsed:
            items.append(parsed)

    logger.info("Pool no-tech cargado: %s filas desde %s", len(items), SEED_SQL.name)
    return items
