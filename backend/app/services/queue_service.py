"""Cola de scraping on-demand — best-effort, nunca rompe endpoints."""

import os

from app.db.supabase import get_supabase
from app.utils.logger import get_logger

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"
DEFAULT_SOURCES = ["getonbrd", "remotive"]


def request_scrape(
    filters: dict,
    priority: int = 1,
    source_hint: list[str] | None = None,
) -> str | None:
    """
    Encola un job de scraping. Best-effort: devuelve el id insertado o None.
    Nunca lanza excepción al caller.
    """
    if USE_MOCK:
        logger.debug("[MOCK] scrape_queue omitido")
        return None

    try:
        supabase = get_supabase()
        payload = {
            "filters": filters or {},
            "priority": priority,
            "status": "pending",
            "source_hint": source_hint if source_hint is not None else DEFAULT_SOURCES,
        }
        result = supabase.table("scrape_queue").insert(payload).execute()
        if result.data:
            queue_id = str(result.data[0]["id"])
            logger.info(f"scrape_queue encolado: id={queue_id}, filters={filters}")
            return queue_id
        logger.warning("scrape_queue insert sin data en respuesta")
        return None
    except Exception as exc:
        logger.warning(f"scrape_queue insert falló: {exc}")
        return None
