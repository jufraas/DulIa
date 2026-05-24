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

    Orden: MarkItDown (stream) → MarkItDown (tempfile) → pdfplumber (texto plano).
    """
    for attempt in (
        lambda: _convert_via_stream(file_bytes, filename),
        lambda: _convert_via_tempfile(file_bytes, raise_on_fail=False),
        lambda: _convert_via_pdfplumber(file_bytes),
    ):
        markdown = attempt()
        if markdown:
            return markdown

    raise CvConversionError(
        "No se pudo leer texto del PDF. Si es una imagen escaneada, "
        "exporta el CV como PDF con texto seleccionable o completa el formulario manualmente."
    )


def _convert_via_stream(file_bytes: bytes, filename: str) -> str | None:
    try:
        stream = io.BytesIO(file_bytes)
        md = MarkItDown()
        result = md.convert_stream(
            stream,
            file_extension=Path(filename).suffix or ".pdf",
        )
        return (result.text_content or "").strip() or None
    except Exception:
        return None


def _convert_via_tempfile(file_bytes: bytes, *, raise_on_fail: bool = True) -> str | None:
    tmp_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        md = MarkItDown()
        result = md.convert(tmp_path)
        return (result.text_content or "").strip() or None
    except Exception as exc:
        if raise_on_fail:
            raise CvConversionError(
                "No se pudo convertir el CV a Markdown. Verifica que el PDF no esté corrupto."
            ) from exc
        return None
    finally:
        if tmp_path:
            Path(tmp_path).unlink(missing_ok=True)


def _convert_via_pdfplumber(file_bytes: bytes) -> str | None:
    try:
        import pdfplumber
    except ImportError:
        return None

    try:
        parts: list[str] = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    parts.append(text.strip())
        combined = "\n\n".join(parts).strip()
        return combined or None
    except Exception:
        return None
