/** @param {import('../store/useProfileStore').OnboardingFormState} form */
export function buildProfilePayload(form) {
  return {
    name: form.name.trim(),
    city: form.city.trim(),
    age_range: form.age_range,
    current_situation: form.current_situation,
    education_level: form.education_level,
    education: form.education.trim(),
    has_experience: form.has_experience === 'si',
    experience_summary: form.experience_summary.trim(),
    skills: form.skills.trim(),
    soft_skills: form.soft_skills.trim(),
    interests: form.interests.trim(),
    work_mode: form.work_mode,
    opportunity_type: form.opportunity_type,
    availability: form.availability,
    tools: form.tools.trim(),
    portfolio_url: form.portfolio_url.trim(),
  }
}
