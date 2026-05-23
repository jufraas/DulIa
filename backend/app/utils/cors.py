"""Configuración CORS según entorno (dev abierto, prod restringido)."""

import os

from app.utils.logger import get_logger

logger = get_logger(__name__)

# Orígenes típicos Vite/React en local
_DEV_DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


def get_cors_config() -> dict:
    """
    Devuelve allow_origins y allow_credentials para CORSMiddleware.
    - development: CORS_ORIGINS del .env o defaults locales; si no hay env, también '*'
    - production: solo CORS_ORIGINS (obligatorio lista explícita)
    """
    env = os.getenv("APP_ENV", "development").lower()
    raw = os.getenv("CORS_ORIGINS", "").strip()
    origins = [o.strip() for o in raw.split(",") if o.strip()]

    if env == "production":
        if not origins:
            logger.warning(
                "APP_ENV=production sin CORS_ORIGINS — usando solo localhost:5173. "
                "Define CORS_ORIGINS en el deploy."
            )
            origins = ["http://localhost:5173"]
        return {"allow_origins": origins, "allow_credentials": True}

    # development
    if origins:
        return {"allow_origins": origins, "allow_credentials": True}

    # Sin CORS_ORIGINS: * sin cookies (evita conflicto credentials + *)
    return {"allow_origins": ["*"], "allow_credentials": False}
