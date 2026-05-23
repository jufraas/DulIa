"""Rate limiting compartido (slowapi) — endpoints que llaman a Gemini."""

import os

from slowapi import Limiter
from slowapi.util import get_remote_address

# 10 req/min por IP en endpoints Gemini (configurable vía .env)
GEMINI_RATE_LIMIT = os.getenv("RATE_LIMIT_GEMINI", "10/minute")

limiter = Limiter(key_func=get_remote_address)
