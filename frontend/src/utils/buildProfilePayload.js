import { getOrCreateSessionId } from './session'

/**
 * @typedef {Object} ProfileApiPayload
 * @property {string} session_id
 * @property {string} [nombre]
 * @property {number} [edad]
 * @property {string} [ciudad]
 * @property {string} [departamento]
 * @property {string} [nivel_educativo]
 * @property {string} [carrera]
 * @property {number} [experiencia_anios]
 * @property {string[]} [habilidades]
 * @property {string[]} [sectores_interes]
 * @property {number} [salario_esperado_min]
 * @property {number} [salario_esperado_max]
 * @property {string} [modalidad]
 * @property {string} [texto_libre]
 */

/** @param {string | undefined} ageRange */
function ageRangeToNumber(ageRange) {
  const map = { '16-20': 18, '21-25': 23, '26-30': 28, '31+': 32 }
  return ageRange ? map[ageRange] : undefined
}

/** @param {string} value */
function splitList(value) {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** @param {string} level */
function mapEducationLevel(level) {
  if (level === 'postgrado') return 'posgrado'
  return level || undefined
}

/** @param {import('../store/useProfileStore').OnboardingFormState} form */
export function buildProfilePayload(form) {
  /** @type {ProfileApiPayload} */
  const payload = {
    session_id: getOrCreateSessionId(),
    nombre: form.name.trim(),
    edad: form.edad ? Number(form.edad) : ageRangeToNumber(form.age_range),
    ciudad: form.city.trim(),
    departamento: form.departamento.trim() || undefined,
    nivel_educativo: mapEducationLevel(form.education_level),
    carrera: form.education.trim() || undefined,
    experiencia_anios:
      form.has_experience === 'si'
        ? Math.max(0, Number(form.experience_years) || 1)
        : 0,
    habilidades: splitList(form.skills),
    sectores_interes: splitList(form.interests),
    modalidad: form.work_mode || undefined,
  }

  if (form.salary_min) payload.salario_esperado_min = Number(form.salary_min)
  if (form.salary_max) payload.salario_esperado_max = Number(form.salary_max)

  const extra = [
    form.cv_file_name && `CV importado: ${form.cv_file_name}`,
    form.current_situation && `Situación: ${form.current_situation}`,
    form.soft_skills && `Habilidades blandas: ${form.soft_skills}`,
    form.tools && `Herramientas: ${form.tools}`,
    form.portfolio_url && `Portafolio: ${form.portfolio_url}`,
    form.opportunity_type && `Busca: ${form.opportunity_type}`,
    form.availability && `Disponibilidad: ${form.availability}`,
    form.has_experience === 'si' &&
      form.experience_summary &&
      `Experiencia: ${form.experience_summary}`,
  ]
    .filter(Boolean)
    .join(' · ')

  if (extra) payload.texto_libre = extra

  return payload
}
