"""Descarga de fuentes externas (GitHub markdown + HuggingFace). — B7.2"""

from __future__ import annotations

import asyncio
import json
import logging
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import httpx

logger = logging.getLogger(__name__)

# Directorio base del ETL (backend/scripts/etl_interview_pool/)
ETL_DIR = Path(__file__).resolve().parent
CACHE_RAW_DIR = ETL_DIR / "cache" / "raw"

# Caché válida 7 días para markdown de GitHub
CACHE_TTL_DAYS = 7
HTTP_TIMEOUT = 30.0


def _repo_slug(repo: str) -> str:
    """Convierte 'owner/name' en slug seguro para nombre de archivo."""
    return re.sub(r"[^a-zA-Z0-9_-]+", "_", repo.replace("/", "_"))


def _cache_es_fresca(path: Path, ttl_days: int = CACHE_TTL_DAYS) -> bool:
    """True si el archivo existe y tiene menos de ttl_days de antigüedad."""
    if not path.is_file():
        return False
    mtime = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
    return datetime.now(timezone.utc) - mtime < timedelta(days=ttl_days)


def _leer_cache_texto(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _guardar_cache_texto(path: Path, contenido: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(contenido, encoding="utf-8")


def _leer_cache_json(path: Path) -> list[dict[str, Any]]:
    return json.loads(path.read_text(encoding="utf-8"))


def _guardar_cache_json(path: Path, data: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")


async def descargar_github_markdown(repo: str, path: str = "README.md") -> str:
    """
    Descarga README (u otro markdown) desde raw.githubusercontent.com.
    Caché local en cache/raw/github_{repo_slug}.md (TTL 7 días).
    Fallback master → main si 404.
    """
    cache_path = CACHE_RAW_DIR / f"github_{_repo_slug(repo)}.md"

    if _cache_es_fresca(cache_path):
        logger.info("Caché hit GitHub: %s (%s bytes)", cache_path.name, cache_path.stat().st_size)
        return _leer_cache_texto(cache_path)

    branches = ("master", "main")
    last_error: Exception | None = None

    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT, follow_redirects=True) as client:
        for branch in branches:
            url = f"https://raw.githubusercontent.com/{repo}/{branch}/{path}"
            try:
                logger.info("Descargando GitHub: %s", url)
                response = await client.get(url)
                if response.status_code == 404:
                    logger.warning("404 en rama %s para %s", branch, repo)
                    continue
                response.raise_for_status()
                contenido = response.text
                _guardar_cache_texto(cache_path, contenido)
                logger.info(
                    "GitHub OK: %s → %s (%s bytes)",
                    repo,
                    cache_path.name,
                    len(contenido.encode("utf-8")),
                )
                return contenido
            except httpx.HTTPStatusError as exc:
                last_error = exc
                logger.warning("HTTP error %s en %s: %s", exc.response.status_code, url, exc)
            except httpx.HTTPError as exc:
                last_error = exc
                logger.warning("Error de red descargando %s: %s", url, exc)

    if cache_path.is_file():
        logger.warning("Descarga falló; usando caché expirada de %s", cache_path.name)
        return _leer_cache_texto(cache_path)

    raise RuntimeError(f"No se pudo descargar markdown de {repo}: {last_error}")


def _cargar_huggingface_dataset(dataset_id: str) -> list[dict[str, Any]]:
    """Carga síncrona del dataset (bloqueante — ejecutar en thread)."""
    import os

    # Evitar escribir en ~/.cache (sandbox/CI); caché dentro del ETL
    hf_cache = ETL_DIR / "cache" / "hf_hub"
    hf_cache.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("HF_HOME", str(hf_cache))
    os.environ.setdefault("HF_DATASETS_CACHE", str(hf_cache / "datasets"))

    from datasets import load_dataset

    ds = load_dataset(dataset_id, split="train")
    return [dict(row) for row in ds]


async def descargar_huggingface_dataset(dataset_id: str) -> list[dict[str, Any]]:
    """
    Descarga dataset HuggingFace y lo guarda como JSON en cache/raw/.
    Si el caché existe, lee del disco sin re-descargar.
    """
    slug = re.sub(r"[^a-zA-Z0-9_-]+", "_", dataset_id.replace("/", "_"))
    cache_path = CACHE_RAW_DIR / f"hf_{slug}.json"

    if cache_path.is_file():
        rows = _leer_cache_json(cache_path)
        logger.info("Caché hit HuggingFace: %s (%s filas)", cache_path.name, len(rows))
        return rows

    logger.info("Descargando HuggingFace: %s", dataset_id)
    try:
        rows = await asyncio.to_thread(_cargar_huggingface_dataset, dataset_id)
    except Exception as exc:
        if cache_path.is_file():
            logger.warning("HF falló; usando caché previa: %s", exc)
            return _leer_cache_json(cache_path)
        raise

    _guardar_cache_json(cache_path, rows)
    logger.info(
        "HuggingFace OK: %s → %s (%s filas, %s bytes)",
        dataset_id,
        cache_path.name,
        len(rows),
        cache_path.stat().st_size,
    )
    return rows


async def descargar_todas_fuentes() -> dict[str, str | list[dict[str, Any]]]:
    """
    Orquesta las 4 fuentes externas.
    Si una falla, continúa con las demás (mínimo 1 GitHub debe funcionar).
    """
    fuentes_config = {
        "sudheerj_react": ("github", "sudheerj/reactjs-interview-questions"),
        "sudheerj_javascript": ("github", "sudheerj/javascript-interview-questions"),
        "arialdomartini_backend": ("github", "arialdomartini/Back-End-Developer-Interview-Questions"),
        "huggingface_alkhars": ("hf", "ali-alkhars/interviews"),
    }

    resultado: dict[str, str | list[dict[str, Any]]] = {}
    errores: dict[str, str] = {}

    for clave, (tipo, identificador) in fuentes_config.items():
        try:
            if tipo == "github":
                contenido = await descargar_github_markdown(identificador)
                resultado[clave] = contenido
                size = len(contenido.encode("utf-8"))
                logger.info("Fuente %s: %s bytes", clave, f"{size:,}")
            else:
                rows = await descargar_huggingface_dataset(identificador)
                resultado[clave] = rows
                logger.info("Fuente %s: %s filas", clave, len(rows))
        except Exception as exc:
            errores[clave] = str(exc)
            logger.warning("Fuente %s falló (continuando): %s", clave, exc)

    github_ok = sum(1 for k in resultado if k.startswith("sudheerj_") or k == "arialdomartini_backend")
    if github_ok == 0:
        raise RuntimeError(
            f"Ninguna fuente GitHub disponible. Errores: {errores}"
        )

    if errores:
        logger.warning("Fuentes con error: %s", errores)

    logger.info(
        "Descarga completada: %s fuentes OK, %s fallidas",
        len(resultado),
        len(errores),
    )
    return resultado


def resumen_cache() -> list[dict[str, Any]]:
    """Lista archivos en cache/raw con tamaño en bytes (para checkpoint)."""
    if not CACHE_RAW_DIR.is_dir():
        return []
    items = []
    for path in sorted(CACHE_RAW_DIR.glob("*")):
        if path.name == ".gitkeep":
            continue
        stat = path.stat()
        items.append(
            {
                "path": str(path),
                "name": path.name,
                "bytes": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
            }
        )
    return items
