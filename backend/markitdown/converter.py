"""Convierte bytes de un CV PDF a Markdown usando Microsoft MarkItDown."""

from __future__ import annotations

import io
import tempfile
from pathlib import Path

from markitdown import MarkItDown

from .exceptions import CvConversionError


def pdf_bytes_to_markdown(
    file_bytes: bytes,
    filename: str = "cv.pdf",
) -> str:
    """
    Convierte un PDF en memoria a Markdown.

    Intenta `convert_stream` primero; si falla, usa archivo temporal
    (más compatible con algunas versiones de MarkItDown).
    """
    markdown = _convert_via_stream(file_bytes, filename)
    if markdown is not None:
        return markdown

    return _convert_via_tempfile(file_bytes)


def _convert_via_stream(file_bytes: bytes, filename: str) -> str | None:
    try:
        stream = io.BytesIO(file_bytes)
        md = MarkItDown()
        result = md.convert_stream(
            stream,
            file_extension=Path(filename).suffix or ".pdf",
        )
        return (result.text_content or "").strip()
    except Exception:
        return None


def _convert_via_tempfile(file_bytes: bytes) -> str:
    tmp_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        md = MarkItDown()
        result = md.convert(tmp_path)
        return (result.text_content or "").strip()
    except Exception as exc:
        raise CvConversionError(
            "No se pudo convertir el CV a Markdown. Verifica que el PDF no esté corrupto."
        ) from exc
    finally:
        if tmp_path:
            Path(tmp_path).unlink(missing_ok=True)
