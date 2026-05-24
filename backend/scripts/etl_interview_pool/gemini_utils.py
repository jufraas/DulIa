"""Utilidades compartidas para llamadas Gemini en el ETL B7."""

from __future__ import annotations

import asyncio
import json
import logging
import re
import time
from typing import Any

from app.db.gemini import get_gemini_model

logger = logging.getLogger(__name__)

MAX_RETRIES = 3
BACKOFF_SEGUNDOS = (30, 60, 120)


def parse_json_array_from_llm(text: str) -> list[Any]:
    """Extrae un array JSON de la respuesta del modelo."""
    cleaned = text.strip()
    if not cleaned:
        raise ValueError("Respuesta vacía del modelo")

    if cleaned.startswith("```"):
        for part in cleaned.split("```")[1:]:
            chunk = part.strip()
            if chunk.lower().startswith("json"):
                chunk = chunk[4:].strip()
            if chunk.startswith("["):
                cleaned = chunk
                break

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\[[\s\S]*\]", cleaned)
        if not match:
            raise
        data = json.loads(match.group(0))

    if not isinstance(data, list):
        raise ValueError("Se esperaba un array JSON")
    return data


def _es_rate_limit(exc: Exception) -> bool:
    msg = str(exc).lower()
    return "429" in msg or "rate" in msg or "quota" in msg or "resource exhausted" in msg


def llamar_gemini_sync(prompt: str) -> str:
    """Llamada síncrona a Gemini con backoff exponencial ante 429."""
    last_exc: Exception | None = None
    for intento in range(MAX_RETRIES + 1):
        try:
            model = get_gemini_model()
            response = model.generate_content(prompt)
            return (response.text or "").strip()
        except Exception as exc:
            last_exc = exc
            if _es_rate_limit(exc) and intento < MAX_RETRIES:
                espera = BACKOFF_SEGUNDOS[min(intento, len(BACKOFF_SEGUNDOS) - 1)]
                logger.warning(
                    "Rate limit Gemini (intento %s/%s). Esperando %ss…",
                    intento + 1,
                    MAX_RETRIES,
                    espera,
                )
                time.sleep(espera)
                continue
            raise
    raise RuntimeError(f"Gemini falló tras reintentos: {last_exc}")


async def llamar_gemini(prompt: str) -> str:
    """Wrapper async para no bloquear el event loop."""
    return await asyncio.to_thread(llamar_gemini_sync, prompt)
