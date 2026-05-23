from pydantic import BaseModel, Field
from typing import Optional


class CvWizardPrefill(BaseModel):
    """Campos del wizard frontend — claves alineadas al formulario React."""

    name: Optional[str] = None
    city: Optional[str] = None
    departamento: Optional[str] = None
    edad: Optional[str] = None
    age_range: Optional[str] = None
    current_situation: Optional[str] = None
    education_level: Optional[str] = None
    education: Optional[str] = None
    has_experience: Optional[str] = None
    experience_years: Optional[str] = None
    experience_summary: Optional[str] = None
    skills: Optional[str] = None
    soft_skills: Optional[str] = None
    interests: Optional[str] = None
    work_mode: Optional[str] = None
    opportunity_type: Optional[str] = None
    availability: Optional[str] = None
    tools: Optional[str] = None
    portfolio_url: Optional[str] = None


class CvParseOut(BaseModel):
    parsed: bool
    fields_found: list[str] = Field(default_factory=list)
    prefill: CvWizardPrefill
    message: Optional[str] = None
