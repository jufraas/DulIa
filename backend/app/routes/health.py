import os
from fastapi import APIRouter

router = APIRouter()

@router.get("/health", tags=["Sistema"])
def health_check():
    """Verifica que el servidor está vivo y muestra la configuración activa."""
    return {
        "status": "ok",
        "env": os.getenv("APP_ENV", "development"),
        "mock_data": os.getenv("USE_MOCK_DATA", "false"),
    }
