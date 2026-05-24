/** Demo offline cuando el backend no responde */
export const MOCK_CV_PREFILL = {
  parsed: true,
  fields_found: [
    'name',
    'city',
    'departamento',
    'edad',
    'current_situation',
    'education_level',
    'education',
    'has_experience',
    'experience_years',
    'experience_summary',
    'skills',
    'soft_skills',
    'interests',
    'work_mode',
    'opportunity_type',
    'availability',
    'tools',
  ],
  prefill: {
    name: 'María González',
    city: 'Barranquilla',
    departamento: 'Atlántico',
    edad: '22',
    current_situation: 'recien_egresado',
    education_level: 'universitario',
    education: 'Comunicación social',
    has_experience: 'si',
    experience_years: '1',
    experience_summary: 'Práctica en contenido digital y apoyo en redes sociales.',
    skills: 'Canva, edición de video, redacción, Excel',
    soft_skills: 'Comunicación, creatividad, trabajo en equipo',
    interests: 'Marketing digital, contenido para redes, medios',
    work_mode: 'hibrido',
    opportunity_type: 'primer_empleo',
    availability: 'inmediata',
    tools: 'Canva, CapCut, Google Analytics',
  },
  message: 'Modo demo: datos de ejemplo desde tu CV. Revisa antes de continuar.',
}

/**
 * Normaliza la respuesta POST /profile/parse-cv del backend.
 * @param {unknown} data
 */
export function normalizeCvParseResponse(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Respuesta inválida al leer el CV.')
  }

  const raw = /** @type {Record<string, unknown>} */ (data)
  const prefill =
    raw.prefill && typeof raw.prefill === 'object'
      ? /** @type {Record<string, string | null | undefined>} */ (raw.prefill)
      : {}

  const fieldsFound = Array.isArray(raw.fields_found)
    ? raw.fields_found.filter((item) => typeof item === 'string')
    : Object.keys(prefill).filter((key) => prefill[key] != null && prefill[key] !== '')

  return {
    parsed: raw.parsed === true,
    fields_found: fieldsFound,
    prefill,
    message: typeof raw.message === 'string' ? raw.message : undefined,
  }
}

/**
 * @param {Record<string, string | undefined | null>} prefill
 * @param {string[]} [fieldsFound]
 * @returns {Partial<import('../store/useProfileStore').OnboardingFormState>}
 */
export function mergeCvPrefillIntoForm(prefill, fieldsFound = []) {
  /** @type {Partial<import('../store/useProfileStore').OnboardingFormState>} */
  const next = {}
  const keys = fieldsFound.length > 0 ? fieldsFound : Object.keys(prefill)

  for (const key of keys) {
    const value = prefill[key]
    if (value == null || value === '') continue
    const str = String(value).trim()
    if (str) next[key] = str
  }

  return next
}
