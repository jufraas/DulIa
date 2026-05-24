"""Parseo tolerante de JSON devuelto por modelos Gemini."""

from __future__ import annotations

import json
import re


def parse_json_from_llm(text: str) -> dict:
    """Extrae un objeto JSON de la respuesta del modelo (con o sin fences markdown)."""
    cleaned = text.strip()
    if not cleaned:
        raise ValueError("Respuesta vacía del modelo")

    if cleaned.startswith("```"):
        for part in cleaned.split("```")[1:]:
            chunk = part.strip()
            if chunk.lower().startswith("json"):
                chunk = chunk[4:].strip()
            if chunk.startswith("{"):
                cleaned = chunk
                break

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if not match:
            raise
        data = json.loads(match.group(0))

    if not isinstance(data, dict):
        raise ValueError("Se esperaba un objeto JSON")
    return data
