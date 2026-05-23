"""Carga de system prompts desde docs/PROMPTS.md."""

import re
from pathlib import Path

# repo root: backend/app/utils -> parents[3]
_PROMPTS_FILE = Path(__file__).resolve().parents[3] / "docs" / "PROMPTS.md"
_cache: dict[str, str] = {}


def get_prompt(name: str) -> str:
    """
    Extrae el texto entre ``` del bloque ## `NAME` en PROMPTS.md.
    Ejemplo: get_prompt("CAREER_COACH_SYSTEM")
    """
    if name in _cache:
        return _cache[name]

    if not _PROMPTS_FILE.is_file():
        raise FileNotFoundError(f"No se encontró {_PROMPTS_FILE}")

    contenido = _PROMPTS_FILE.read_text(encoding="utf-8")
    # Coincide: ## `CAREER_COACH_SYSTEM` v1.0 ... ``` ... ```
    patron = rf"## `{re.escape(name)}`[^\n]*\n+>[^\n]*\n+>[^\n]*\n+```\n(.*?)```"
    match = re.search(patron, contenido, re.DOTALL)
    if not match:
        raise ValueError(f"Prompt '{name}' no encontrado en PROMPTS.md")

    texto = match.group(1).strip()
    _cache[name] = texto
    return texto
