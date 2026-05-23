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
    # Acepta múltiples líneas de metadatos (las que empiezan con >)
    # Permite líneas vacías entre metadatos y backticks
    patron = rf"## `{re.escape(name)}`[^\n]*\n+(?:>[^\n]*\n)+\s*```\n(.*?)```"
    match = re.search(patron, contenido, re.DOTALL)
    if not match:
        # Debug: mostrar qué encontró
        print(f"DEBUG: Buscando prompt '{name}'")
        print(f"DEBUG: Archivo existe: {_PROMPTS_FILE.is_file()}")
        print(f"DEBUG: Primeros 200 chars: {contenido[:200]}")
        raise ValueError(f"Prompt '{name}' no encontrado en PROMPTS.md")

    texto = match.group(1).strip()
    _cache[name] = texto
    return texto


def clear_prompt_cache():
    """Limpia el caché de prompts. Usar después de modificar PROMPTS.md."""
    global _cache
    _cache = {}


def reload_prompt(name: str) -> str:
    """Recarga un prompt específico (ignora caché)."""
    if name in _cache:
        del _cache[name]
    return get_prompt(name)
