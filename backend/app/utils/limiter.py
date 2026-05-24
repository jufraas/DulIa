"""Rate limiting compartido (slowapi) — endpoints que llaman a Gemini."""

import os

from slowapi import Limiter
from slowapi.util import get_remote_address

# 10 req/min por IP en endpoints Gemini (configurable vía .env)
GEMINI_RATE_LIMIT = os.getenv("RATE_LIMIT_GEMINI", "10/minute")

# Mock interview — límites asimétricos por costo (B5)
INTERVIEW_START_LIMIT = os.getenv("RATE_LIMIT_INTERVIEW_START", "5/minute")
INTERVIEW_ANSWER_LIMIT = os.getenv("RATE_LIMIT_INTERVIEW_ANSWER", "10/minute")
INTERVIEW_FINISH_LIMIT = os.getenv("RATE_LIMIT_INTERVIEW_FINISH", "3/minute")

limiter = Limiter(key_func=get_remote_address)
