"""Traducción batch con Gemini + caché local. — B7.4"""

from __future__ import annotations

import asyncio
import json
import logging
from pathlib import Path
from typing import Any

from scripts.etl_interview_pool.gemini_utils import llamar_gemini, parse_json_array_from_llm
from scripts.etl_interview_pool.parsers import hash_pregunta

logger = logging.getLogger(__name__)

ETL_DIR = Path(__file__).resolve().parent
CACHE_TRANSLATIONS = ETL_DIR / "cache" / "translated" / "translations.json"

BATCH_SIZE = 20
SLEEP_ENTRE_BATCHES = 2.0

PROMPT_TRADUCIR = """Traduce al español las siguientes preguntas de entrevista técnica.
Mantén terminología técnica en su versión estándar en español latino (ej. "render" → "renderizado", "hook" → "hook" sin traducir).
Devuelve SOLO un JSON array de strings con exactamente {n} traducciones, en el mismo orden.

Preguntas en inglés:
{preguntas_json}
"""


def _cargar_cache() -> dict[str, str]:
    if CACHE_TRANSLATIONS.is_file():
        return json.loads(CACHE_TRANSLATIONS.read_text(encoding="utf-8"))
    return {}


def _guardar_cache(cache: dict[str, str]) -> None:
    CACHE_TRANSLATIONS.parent.mkdir(parents=True, exist_ok=True)
    CACHE_TRANSLATIONS.write_text(
        json.dumps(cache, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


async def _traducir_una(pregunta_en: str) -> str:
    prompt = PROMPT_TRADUCIR.format(
        n=1,
        preguntas_json=json.dumps([pregunta_en], ensure_ascii=False),
    )
    raw = await llamar_gemini(prompt)
    traducciones = parse_json_array_from_llm(raw)
    if not traducciones or not isinstance(traducciones[0], str):
        raise ValueError(f"Traducción inválida para: {pregunta_en[:80]}")
    return traducciones[0].strip()


async def traducir_batch(preguntas_en: list[str], cache: dict[str, str]) -> list[str]:
    """
    Traduce un batch de preguntas. Usa caché MD5 por pregunta original.
    Fallback item-a-item si el batch devuelve menos elementos.
    """
    resultados: list[str | None] = [None] * len(preguntas_en)
    pendientes_idx: list[int] = []

    for i, pregunta in enumerate(preguntas_en):
        h = hash_pregunta(pregunta)
        if h in cache:
            resultados[i] = cache[h]
        else:
            pendientes_idx.append(i)

    if not pendientes_idx:
        return [r for r in resultados if r is not None]

    pendientes_texto = [preguntas_en[i] for i in pendientes_idx]

    try:
        prompt = PROMPT_TRADUCIR.format(
            n=len(pendientes_texto),
            preguntas_json=json.dumps(pendientes_texto, ensure_ascii=False),
        )
        raw = await llamar_gemini(prompt)
        traducciones = parse_json_array_from_llm(raw)

        if len(traducciones) != len(pendientes_texto):
            logger.warning(
                "Batch traducción incompleto (%s/%s). Fallback item-a-item.",
                len(traducciones),
                len(pendientes_texto),
            )
            traducciones = []
            for texto in pendientes_texto:
                traducciones.append(await _traducir_una(texto))
                await asyncio.sleep(0.5)

        for idx, traduccion in zip(pendientes_idx, traducciones):
            texto_es = str(traduccion).strip()
            resultados[idx] = texto_es
            cache[hash_pregunta(preguntas_en[idx])] = texto_es

    except Exception as exc:
        logger.error("Error en batch traducción: %s. Fallback item-a-item.", exc)
        for idx in pendientes_idx:
            if resultados[idx] is not None:
                continue
            texto_es = await _traducir_una(preguntas_en[idx])
            resultados[idx] = texto_es
            cache[hash_pregunta(preguntas_en[idx])] = texto_es
            await asyncio.sleep(0.5)

    _guardar_cache(cache)
    return [r or preguntas_en[i] for i, r in enumerate(resultados)]


async def traducir_todas(
    items: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], dict[str, int]]:
    """
    Traduce todo el pool en batches de 20.
    Devuelve items con campo pregunta_es + stats.
    """
    cache = _cargar_cache()
    stats = {"cache_hits": 0, "batches": 0, "items": len(items)}

    for item in items:
        h = hash_pregunta(item["pregunta_en"])
        if h in cache:
            stats["cache_hits"] += 1

    for i in range(0, len(items), BATCH_SIZE):
        batch = items[i : i + BATCH_SIZE]
        preguntas_en = [it["pregunta_en"] for it in batch]
        traducciones = await traducir_batch(preguntas_en, cache)
        for it, pregunta_es in zip(batch, traducciones):
            it["pregunta_es"] = pregunta_es
            it["idioma_origen"] = "en"
        stats["batches"] += 1
        logger.info("Traducción batch %s/%s", stats["batches"], (len(items) + BATCH_SIZE - 1) // BATCH_SIZE)
        if i + BATCH_SIZE < len(items):
            await asyncio.sleep(SLEEP_ENTRE_BATCHES)

    return items, stats
