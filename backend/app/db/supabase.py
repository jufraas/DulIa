import os
from supabase import create_client, Client
from app.utils.logger import get_logger

logger = get_logger(__name__)

_client: Client | None = None

def get_supabase() -> Client:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL y SUPABASE_ANON_KEY (o SUPABASE_KEY legacy) son requeridas en el .env"
            )
        _client = create_client(url, key)
        logger.info("Conexión a Supabase establecida")
    return _client
