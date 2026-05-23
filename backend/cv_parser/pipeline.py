"""
Pipeline CV → Markdown para DulIA.

Flujo en POST /profile:
  1. Usuario sube PDF (multipart, campo `cv`) — opcional.
  2. Este módulo valida y convierte a `cv_markdown`.
  3. El servicio de IA (Gemini) recibe profile JSON + cv_markdown.
"""

from __future__ import annotations

from dataclasses import dataclass

from .converter import pdf_bytes_to_markdown
from .exceptions import CvConversionError, CvValidationError
from .validators import validate_cv_pdf


@dataclass(frozen=True)
class CvMarkdownResult:
    """Resultado de convertir un CV PDF."""

    markdown: str
    parsed: bool
    filename: str | None
    char_count: int


def cv_file_to_markdown(
    file_bytes: bytes,
    filename: str | None = None,
    content_type: str | None = None,
) -> CvMarkdownResult:
    """
    Punto de entrada principal: bytes del upload → Markdown listo para Gemini.

    Raises:
        CvValidationError: PDF inválido o muy grande.
        CvConversionError: MarkItDown no pudo procesar el archivo.
    """
    validate_cv_pdf(file_bytes, filename=filename, content_type=content_type)

    markdown = pdf_bytes_to_markdown(file_bytes, filename or "cv.pdf")
    cleaned = markdown.strip()

    return CvMarkdownResult(
        markdown=cleaned,
        parsed=bool(cleaned),
        filename=filename,
        char_count=len(cleaned),
    )


def cv_markdown_for_prompt(cv_result: CvMarkdownResult | None) -> str:
    """
    Texto que va en la variable `{cv_markdown}` de docs/PROMPTS.md.
    """
    if not cv_result or not cv_result.parsed:
        return ""
    return cv_result.markdown
