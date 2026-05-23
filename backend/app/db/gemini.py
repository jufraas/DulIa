import os
import google.generativeai as genai
from app.utils.logger import get_logger

logger = get_logger(__name__)

_configured = False

def get_gemini_model(model_name: str = "gemini-3.1-flash-lite"):
    global _configured
    if not _configured:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY es requerida en el .env")
        genai.configure(api_key=api_key)
        _configured = True
        logger.info(f"Gemini configurado con modelo: {model_name}")
    return genai.GenerativeModel(model_name)
