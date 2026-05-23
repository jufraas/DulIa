/** @param {import('../store/useProfileStore').OnboardingFormState} form */
export function validateOnboardingStep(currentStep, form) {
  /** @type {Record<string, string>} */
  const errors = {}

  if (currentStep === 0) {
    if (!form.name.trim()) errors.name = 'Escribe tu nombre'
    if (!form.city.trim()) errors.city = 'Indica tu ciudad'
    if (!form.age_range) errors.age_range = 'Selecciona tu rango de edad'
    if (!form.current_situation) {
      errors.current_situation = 'Indica tu situación actual'
    }
  }

  if (currentStep === 1) {
    if (!form.education_level) {
      errors.education_level = 'Selecciona tu nivel de estudios'
    }
    if (!form.education.trim()) {
      errors.education = 'Cuéntanos qué estudias o estudiaste'
    }
    if (!form.has_experience) {
      errors.has_experience = 'Indica si has trabajado antes'
    }
    if (form.has_experience === 'si' && !form.experience_summary.trim()) {
      errors.experience_summary = 'Describe brevemente tu experiencia'
    }
    if (!form.skills.trim()) errors.skills = 'Menciona al menos una habilidad'
  }

  if (currentStep === 2) {
    if (!form.interests.trim()) {
      errors.interests = 'Indica tus intereses laborales'
    }
    if (!form.work_mode) errors.work_mode = 'Selecciona modalidad de trabajo'
    if (!form.opportunity_type) {
      errors.opportunity_type = 'Selecciona tipo de oportunidad'
    }
    if (!form.availability) errors.availability = 'Indica cuándo puedes empezar'
  }

  return errors
}
