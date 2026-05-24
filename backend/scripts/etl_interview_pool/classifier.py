"""Clasificación y rúbricas específicas con Gemini. — B7.4"""

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
CACHE_CLASSIFICATIONS = ETL_DIR / "cache" / "translated" / "classifications.json"

BATCH_SIZE = 10
SLEEP_ENTRE_BATCHES = 3.0

KEYWORDS_GENERICAS_PROHIBIDAS = {
    "concepto claro",
    "ejemplo práctico",
    "pasos concretos",
    "situación concreta",
    "acción tomada",
    "priorización",
    "comunicación",
    "plan de acción",
}

PROMPT_CLASIFICAR = """Para cada pregunta de entrevista traducida al español, devuelve un JSON array con exactamente {n} objetos, en el mismo orden.
Cada objeto debe tener esta estructura:
{{
  "skill": "<habilidad principal, ej Python, React, JavaScript, SQL, Backend...>",
  "tipo": "tecnica" | "behavioral" | "situacional",
  "nivel": "junior" | "mid" | "senior",
  "rubrica": {{
    "keywords_clave": ["3-5 conceptos ESPECÍFICOS que un buen candidato debe mencionar para ESTA pregunta"],
    "puntos_fuertes_esperados": ["2-3 señales de respuesta excelente ESPECÍFICAS de la pregunta"],
    "red_flags": ["1-2 señales de respuesta mala ESPECÍFICAS de la pregunta"]
  }}
}}

IMPORTANTE:
- keywords_clave y red_flags deben ser ESPECÍFICAS del contenido de cada pregunta, NO genéricas.
- NO uses frases plantilla como "concepto claro", "ejemplo práctico", "pasos concretos".

Preguntas (español):
{preguntas_json}
"""


def _cargar_cache() -> dict[str, dict[str, Any]]:
    if CACHE_CLASSIFICATIONS.is_file():
        return json.loads(CACHE_CLASSIFICATIONS.read_text(encoding="utf-8"))
    return {}


def _guardar_cache(cache: dict[str, dict[str, Any]]) -> None:
    CACHE_CLASSIFICATIONS.parent.mkdir(parents=True, exist_ok=True)
    CACHE_CLASSIFICATIONS.write_text(
        json.dumps(cache, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def _rubrica_es_generica(rubrica: dict[str, Any]) -> bool:
    keywords = rubrica.get("keywords_clave") or []
    if not isinstance(keywords, list):
        return True
    for kw in keywords:
        if str(kw).strip().lower() in KEYWORDS_GENERICAS_PROHIBIDAS:
            return True
    return len(keywords) < 2


def _validar_clasificacion(data: dict[str, Any]) -> bool:
    if data.get("tipo") not in ("tecnica", "behavioral", "situacional"):
        return False
    if data.get("nivel") not in ("junior", "mid", "senior"):
        return False
    rubrica = data.get("rubrica")
    if not isinstance(rubrica, dict):
        return False
    if _rubrica_es_generica(rubrica):
        return False
    return bool(data.get("skill"))


async def _clasificar_una(pregunta_es: str, contexto: str = "") -> dict[str, Any]:
    payload = [{"pregunta": pregunta_es, "contexto": contexto}] if contexto else [{"pregunta": pregunta_es}]
    prompt = PROMPT_CLASIFICAR.format(
        n=1,
        preguntas_json=json.dumps(payload, ensure_ascii=False),
    )
    raw = await llamar_gemini(prompt)
    resultados = parse_json_array_from_llm(raw)
    if not resultados or not _validar_clasificacion(resultados[0]):
        # Reintento estricto anti-plantilla
        prompt_retry = prompt + "\n\nATENCIÓN: la rúbrica anterior fue demasiado genérica. Sé MÁS específico con términos técnicos de la pregunta."
        raw = await llamar_gemini(prompt_retry)
        resultados = parse_json_array_from_llm(raw)
    if not resultados:
        raise ValueError(f"Clasificación vacía para: {pregunta_es[:80]}")
    return resultados[0]


async def clasificar_y_rubrica_batch(
    items: list[dict[str, Any]],
    cache: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    """Clasifica un batch de 10 items con caché por hash de pregunta_en."""
    resultados: list[dict[str, Any] | None] = [None] * len(items)
    pendientes_idx: list[int] = []

    for i, item in enumerate(items):
        h = hash_pregunta(item["pregunta_en"])
        if h in cache and _validar_clasificacion(cache[h]):
            resultados[i] = cache[h]
        else:
            pendientes_idx.append(i)

    if not pendientes_idx:
        return resultados  # type: ignore[return-value]

    payload = []
    for idx in pendientes_idx:
        entry = {"pregunta": items[idx]["pregunta_es"]}
        ctx = items[idx].get("respuesta_en") or items[idx].get("contexto_en")
        if ctx:
            entry["contexto"] = str(ctx)[:500]
        payload.append(entry)

    try:
        prompt = PROMPT_CLASIFICAR.format(
            n=len(payload),
            preguntas_json=json.dumps(payload, ensure_ascii=False),
        )
        raw = await llamar_gemini(prompt)
        clasificaciones = parse_json_array_from_llm(raw)

        if len(clasificaciones) != len(pendientes_idx):
            logger.warning("Batch clasificación incompleto. Fallback item-a-item.")
            clasificaciones = []
            for idx in pendientes_idx:
                ctx = items[idx].get("respuesta_en") or items[idx].get("contexto_en") or ""
                clasificaciones.append(
                    await _clasificar_una(items[idx]["pregunta_es"], str(ctx))
                )
                await asyncio.sleep(0.5)
        else:
            # Re-pedir rúbricas genéricas
            for j, idx in enumerate(pendientes_idx):
                if not _validar_clasificacion(clasificaciones[j]):
                    ctx = items[idx].get("respuesta_en") or items[idx].get("contexto_en") or ""
                    clasificaciones[j] = await _clasificar_una(items[idx]["pregunta_es"], str(ctx))
                    await asyncio.sleep(0.5)

        for idx, clasif in zip(pendientes_idx, clasificaciones):
            resultados[idx] = clasif
            cache[hash_pregunta(items[idx]["pregunta_en"])] = clasif

    except Exception as exc:
        logger.error("Error batch clasificación: %s. Fallback item-a-item.", exc)
        for idx in pendientes_idx:
            if resultados[idx] is not None:
                continue
            ctx = items[idx].get("respuesta_en") or items[idx].get("contexto_en") or ""
            clasif = await _clasificar_una(items[idx]["pregunta_es"], str(ctx))
            resultados[idx] = clasif
            cache[hash_pregunta(items[idx]["pregunta_en"])] = clasif
            await asyncio.sleep(0.5)

    _guardar_cache(cache)
    if any(r is None for r in resultados):
        raise RuntimeError("Clasificación incompleta en batch")
    return resultados  # type: ignore[return-value]


async def clasificar_todas(
    items: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], dict[str, int]]:
    """Clasifica todo el pool en batches de 10."""
    cache = _cargar_cache()
    stats = {"cache_hits": 0, "batches": 0, "items": len(items), "fallidos": 0}

    for item in items:
        h = hash_pregunta(item["pregunta_en"])
        if h in cache and _validar_clasificacion(cache[h]):
            stats["cache_hits"] += 1

    for i in range(0, len(items), BATCH_SIZE):
        batch = items[i : i + BATCH_SIZE]
        clasificaciones = await clasificar_y_rubrica_batch(batch, cache)
        for it, clasif in zip(batch, clasificaciones):
            it["skill"] = clasif.get("skill", "General")
            it["tipo"] = clasif.get("tipo", "tecnica")
            it["nivel"] = clasif.get("nivel", "junior")
            it["rubrica"] = clasif.get("rubrica", {})
            it["sector"] = "tecnologia"
            it["idioma"] = "es"
        stats["batches"] += 1
        logger.info(
            "Clasificación batch %s/%s",
            stats["batches"],
            (len(items) + BATCH_SIZE - 1) // BATCH_SIZE,
        )
        if i + BATCH_SIZE < len(items):
            await asyncio.sleep(SLEEP_ENTRE_BATCHES)

    _guardar_cache(cache)
    return items, stats
