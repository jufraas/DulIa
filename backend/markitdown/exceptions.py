class CvValidationError(ValueError):
    """CV inválido (formato, tamaño o contenido)."""


class CvConversionError(RuntimeError):
    """Fallo al convertir PDF a Markdown con MarkItDown."""
