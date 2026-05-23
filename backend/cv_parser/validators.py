"""Validación de CV PDF — alineado con frontend (5 MB, solo PDF)."""

from __future__ import annotations

import os

from .exceptions import CvValidationError

MAX_CV_SIZE_BYTES = 5 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"application/pdf", "application/x-pdf"}
ALLOWED_EXTENSIONS = {".pdf"}


def validate_cv_pdf(
    file_bytes: bytes,
    filename: str | None = None,
    content_type: str | None = None,
) -> None:
    if not file_bytes:
        raise CvValidationError("El archivo CV está vacío.")

    if len(file_bytes) > MAX_CV_SIZE_BYTES:
        raise CvValidationError("El CV supera el tamaño máximo de 5 MB.")

    if not file_bytes.startswith(b"%PDF"):
        raise CvValidationError("Solo se aceptan archivos PDF válidos.")

    if filename:
        ext = os.path.splitext(filename.lower())[1]
        if ext and ext not in ALLOWED_EXTENSIONS:
            raise CvValidationError("Solo se acepta extensión .pdf.")

    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        # Algunos navegadores envían octet-stream; no bloquear si el magic bytes es PDF.
        if content_type != "application/octet-stream":
            raise CvValidationError("Content-Type debe ser application/pdf.")
