import os
import google.generativeai as genai
from app.utils.logger import get_logger

logger = get_logger(__name__)

_configured = False

DEFAULT_GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")


def get_gemini_model(model_name: str | None = None):
    global _configured
    resolved = model_name or DEFAULT_GEMINI_MODEL
    if not _configured:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY es requerida en el .env")
        genai.configure(api_key=api_key)
        _configured = True
        logger.info(f"Gemini configurado — modelo por defecto: {DEFAULT_GEMINI_MODEL}")
    return genai.GenerativeModel(resolved)
