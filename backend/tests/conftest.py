"""Configuración pytest — smoke M3 sin Supabase ni Gemini."""

import os

os.environ.setdefault("USE_MOCK_DATA", "true")
