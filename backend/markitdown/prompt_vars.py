"""Variables de prompt para Gemini — ver docs/PROMPTS.md."""

from __future__ import annotations

import json
from typing import Any

from .pipeline import CvMarkdownResult, cv_markdown_for_prompt


def build_gemini_prompt_vars(
    profile: dict[str, Any],
    cv_result: CvMarkdownResult | None = None,
    job_offers: list[Any] | None = None,
) -> dict[str, str]:
    """
    Construye las variables del user prompt PROFILE_ANALYSIS_USER v0.2.

    Returns:
        dict con keys profile_json, cv_markdown, job_offers (strings).
    """
    return {
        "profile_json": json.dumps(profile, ensure_ascii=False, indent=2),
        "cv_markdown": cv_markdown_for_prompt(cv_result) or "(Sin CV adjunto)",
        "job_offers": json.dumps(job_offers or [], ensure_ascii=False, indent=2),
    }
