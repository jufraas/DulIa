"""Parsing y normalización de preguntas desde markdown/JSON. — B7.3"""

from __future__ import annotations

import hashlib
import logging
import random
import re
import string
from typing import Any

logger = logging.getLogger(__name__)

# Límites por fuente (muestreo reproducible)
LIMITES_FUENTE: dict[str, int] = {
    "github_sudheerj_react": 150,
    "github_sudheerj_javascript": 200,
    "github_arialdomartini_backend": 80,
    "huggingface_ali_alkhars": 100,
}

SEED_MUESTREO = 42

# Regex sudheerj: "1.  ### What is React?" o "10. ### Question"
_RE_SUDHEERJ_PREGUNTA = re.compile(
    r"^\s*\d+\.\s+###\s+(.+?)\s*$",
    re.MULTILINE,
)

# Regex arialdomartini: "#### Title" seguido de cuerpo
_RE_ARIALDO_SECCION = re.compile(
    r"^####\s+(.+?)\s*\n(.*?)(?=^####\s|\Z)",
    re.MULTILINE | re.DOTALL,
)

_RE_HTML_EXCESO = re.compile(r"[<>]")


def _tiene_html_excesivo(texto: str, umbral: int = 4) -> bool:
    """Descarta preguntas con demasiados < o > (probable HTML mal parseado)."""
    return texto.count("<") + texto.count(">") > umbral


def _longitud_valida(texto: str, min_chars: int = 10, max_chars: int = 500) -> bool:
    return min_chars <= len(texto.strip()) <= max_chars


def _limpiar_texto(texto: str) -> str:
    """Quita markdown ruidoso y espacios extra."""
    # Enlaces markdown [text](url) → text
    texto = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", texto)
    # HTML tags simples
    texto = re.sub(r"<[^>]+>", "", texto)
    # Bloques de código
    texto = re.sub(r"```[\s\S]*?```", "", texto)
    # Backticks inline
    texto = re.sub(r"`([^`]+)`", r"\1", texto)
    # Líneas de navegación sudheerj
    texto = re.sub(r"\*\*\[⬆ Back to Top\].*?\*\*", "", texto)
    # Colapsar whitespace
    texto = re.sub(r"\s+", " ", texto).strip()
    return texto


def _normalizar_para_dedup(texto: str) -> str:
    """Hash key: lowercase, sin puntuación."""
    lowered = texto.lower().strip()
    return lowered.translate(str.maketrans("", "", string.punctuation))


def parsear_markdown_sudheerj(md_text: str) -> list[dict[str, Any]]:
    """
    Extrae preguntas del formato sudheerj: `N. ### Pregunta?`
    Devuelve [{pregunta_en, respuesta_en}, ...]
    """
    matches = list(_RE_SUDHEERJ_PREGUNTA.finditer(md_text))
    items: list[dict[str, Any]] = []

    for i, match in enumerate(matches):
        pregunta_raw = match.group(1).strip()
        inicio_resp = match.end()
        fin_resp = matches[i + 1].start() if i + 1 < len(matches) else len(md_text)
        respuesta_raw = md_text[inicio_resp:fin_resp].strip()

        pregunta_en = _limpiar_texto(pregunta_raw)
        respuesta_en = _limpiar_texto(respuesta_raw[:3000])  # truncar para clasificación

        if not _longitud_valida(pregunta_en):
            continue
        if _tiene_html_excesivo(pregunta_en):
            continue

        items.append({"pregunta_en": pregunta_en, "respuesta_en": respuesta_en})

    logger.info("parsear_markdown_sudheerj: %s preguntas extraídas", len(items))
    return items


def parsear_markdown_arialdomartini(md_text: str) -> list[dict[str, Any]]:
    """
    Parser para arialdomartini/Back-End-Developer-Interview-Questions.
    Formato: #### Título + párrafo(s) de pregunta.
    """
    items: list[dict[str, Any]] = []

    for match in _RE_ARIALDO_SECCION.finditer(md_text):
        titulo = _limpiar_texto(match.group(1))
        cuerpo = _limpiar_texto(match.group(2))

        if not cuerpo or len(titulo) < 3:
            continue

        # Combinar título + primera oración del cuerpo si el cuerpo es largo
        if cuerpo.lower().startswith(("why", "what", "how", "tell", "would", "is ", "can ", "do ")):
            pregunta_en = cuerpo[:500]
            respuesta_en = cuerpo
        else:
            pregunta_en = f"{titulo}: {cuerpo}"[:500]
            respuesta_en = cuerpo

        if not _longitud_valida(pregunta_en):
            continue
        if _tiene_html_excesivo(pregunta_en):
            continue

        items.append({"pregunta_en": pregunta_en, "respuesta_en": respuesta_en})

    logger.info("parsear_markdown_arialdomartini: %s preguntas extraídas", len(items))
    return items


def parsear_huggingface_alkhars(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Dataset ali-alkhars/interviews: {input, response} donde response es la pregunta.
    Filtra por 'interview' en input, deduplica por response.
    """
    vistos: set[str] = set()
    items: list[dict[str, Any]] = []

    for row in rows:
        input_text = str(row.get("input", "")).strip()
        response = str(row.get("response", "")).strip()

        if not response:
            continue
        if "interview" not in input_text.lower():
            continue

        clave = _normalizar_para_dedup(response)
        if clave in vistos:
            continue
        vistos.add(clave)

        pregunta_en = _limpiar_texto(response)
        if not _longitud_valida(pregunta_en):
            continue

        items.append(
            {
                "pregunta_en": pregunta_en,
                "contexto_en": _limpiar_texto(input_text),
            }
        )

    logger.info("parsear_huggingface_alkhars: %s preguntas (dedup interno)", len(items))
    return items


def limitar_pool(items: list[dict[str, Any]], max_items: int, seed: int = SEED_MUESTREO) -> list[dict[str, Any]]:
    """Muestreo aleatorio reproducible si hay más de max_items."""
    if len(items) <= max_items:
        return items
    rng = random.Random(seed)
    return rng.sample(items, max_items)


def deduplicar_preguntas(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Elimina duplicados cross-fuente por pregunta normalizada."""
    vistos: set[str] = set()
    unicos: list[dict[str, Any]] = []

    for item in items:
        pregunta = item.get("pregunta_en", "")
        clave = _normalizar_para_dedup(pregunta)
        if not clave or clave in vistos:
            continue
        vistos.add(clave)
        unicos.append(item)

    logger.info("deduplicar_preguntas: %s → %s", len(items), len(unicos))
    return unicos


def parsear_todas_fuentes(
    fuentes_raw: dict[str, str | list[dict[str, Any]]],
    *,
    aplicar_limites: bool = True,
) -> tuple[dict[str, list[dict[str, Any]]], dict[str, int]]:
    """
    Orquesta parsing por fuente y añade metadata `fuente` + `fuente_url`.
    """
    urls = {
        "sudheerj_react": (
            "github_sudheerj_react",
            "https://github.com/sudheerj/reactjs-interview-questions",
        ),
        "sudheerj_javascript": (
            "github_sudheerj_javascript",
            "https://github.com/sudheerj/javascript-interview-questions",
        ),
        "arialdomartini_backend": (
            "github_arialdomartini_backend",
            "https://github.com/arialdomartini/Back-End-Developer-Interview-Questions",
        ),
        "huggingface_alkhars": (
            "huggingface_ali_alkhars",
            "https://huggingface.co/datasets/ali-alkhars/interviews",
        ),
    }

    resultado: dict[str, list[dict[str, Any]]] = {}
    conteos_parseo: dict[str, int] = {}

    for clave_raw, data in fuentes_raw.items():
        fuente_id, fuente_url = urls.get(clave_raw, (clave_raw, None))

        if clave_raw == "sudheerj_react" and isinstance(data, str):
            parsed = parsear_markdown_sudheerj(data)
        elif clave_raw == "sudheerj_javascript" and isinstance(data, str):
            parsed = parsear_markdown_sudheerj(data)
        elif clave_raw == "arialdomartini_backend" and isinstance(data, str):
            parsed = parsear_markdown_arialdomartini(data)
        elif clave_raw == "huggingface_alkhars" and isinstance(data, list):
            parsed = parsear_huggingface_alkhars(data)
        else:
            logger.warning("Fuente desconocida o tipo incorrecto: %s", clave_raw)
            continue

        for item in parsed:
            item["fuente"] = fuente_id
            item["fuente_url"] = fuente_url

        conteos_parseo[fuente_id] = len(parsed)

        max_items = LIMITES_FUENTE.get(fuente_id, 100)
        if aplicar_limites:
            parsed = limitar_pool(parsed, max_items)
        resultado[fuente_id] = parsed
        logger.info("%s: %s preguntas tras limitar_pool(%s)", fuente_id, len(parsed), max_items)

    return resultado, conteos_parseo


def consolidar_pool(parsed_por_fuente: dict[str, list[dict[str, Any]]]) -> list[dict[str, Any]]:
    """Une todas las fuentes y deduplica cross-fuente."""
    todos: list[dict[str, Any]] = []
    for items in parsed_por_fuente.values():
        todos.extend(items)
    return deduplicar_preguntas(todos)


def hash_pregunta(texto: str) -> str:
    """MD5 de pregunta normalizada (útil para caché de traducción)."""
    return hashlib.md5(_normalizar_para_dedup(texto).encode("utf-8")).hexdigest()
