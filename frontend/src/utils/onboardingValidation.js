/** Edad mínima para usar la plataforma (Colombia — jóvenes) */
export const MIN_AGE = 15

export const MAX_AGE = 99

/** @param {string | undefined | null} value */
export function parseAgeYears(value) {
  if (value == null || String(value).trim() === '') return null
  const age = Number.parseInt(String(value).trim(), 10)
  return Number.isFinite(age) ? age : null
}

/**
 * @param {import('../store/useProfileStore').OnboardingFormState} form
 * @returns {Record<string, string>}
 */
export function validateAgeFields(form) {
  /** @type {Record<string, string>} */
  const errors = {}
  const hasExactAge = Boolean(form.edad?.trim())
  const hasRange = Boolean(form.age_range)

  if (!hasExactAge && !hasRange) {
    errors.edad = 'Indica tu edad o rango'
    return errors
  }

  if (hasExactAge) {
    const age = parseAgeYears(form.edad)
    if (age === null) {
      errors.edad = 'Indica una edad válida'
    } else if (age < MIN_AGE) {
      errors.edad = `Debes tener al menos ${MIN_AGE} años`
    } else if (age > MAX_AGE) {
      errors.edad = `Indica una edad de ${MAX_AGE} años o menos`
    }
  }

  return errors
}

/**
 * @param {import('../store/useProfileStore').OnboardingFormState} form
 * @returns {Record<string, string>}
 */
export function validateExperienceOpportunity(form) {
  if (form.has_experience === 'si' && form.opportunity_type === 'primer_empleo') {
    return {
      opportunity_type:
        'Ya indicaste que tienes experiencia. Elige empleo formal, práctica o freelance.',
    }
  }
  return {}
}

/**
 * @param {string} hasExperience
 * @param {readonly { value: string, label: string }[]} options
 */
export function filterOpportunityTypeOptions(hasExperience, options) {
  if (hasExperience !== 'si') return options
  return options.filter((opt) => opt.value !== 'primer_empleo')
}
