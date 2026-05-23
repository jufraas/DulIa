const SITUATION = {
  estudiante: 'Estudiante',
  recien_egresado: 'Recién egresado',
  primer_empleo: 'Buscando primer empleo',
  desempleado: 'Desempleado',
  cambio_laboral: 'Trabajando, quiero cambiar',
}

const EDUCATION = {
  bachiller: 'Bachiller',
  tecnico: 'Técnico / SENA',
  tecnologo: 'Tecnólogo',
  universitario: 'Universitario',
  postgrado: 'Postgrado',
}

const WORK_MODE = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
  indiferente: 'Indiferente',
}

const OPPORTUNITY = {
  empleo: 'Empleo formal',
  practica: 'Práctica / pasantía',
  freelance: 'Freelance / proyectos',
  primer_empleo: 'Primer empleo junior',
}

const AVAILABILITY = {
  inmediata: 'Inmediata',
  '1_mes': 'En 1 mes',
  fines_semana: 'Fines de semana',
  medio_tiempo: 'Medio tiempo',
}

/** @param {string | undefined} value */
export function labelAgeRange(value) {
  if (!value) return ''
  return value === '31+' ? '31 años o más' : `${value.replace('-', ' – ')} años`
}

/** @param {import('../store/useProfileStore').ProfileForm | null} profile */
export function profileToDisplayFields(profile) {
  if (!profile) return []

  /** @type {{ label: string, value: string }[]} */
  const fields = [
    { label: 'Nombre', value: profile.name },
    { label: 'Ciudad', value: profile.city },
    { label: 'Edad', value: labelAgeRange(profile.age_range) },
    {
      label: 'Situación',
      value: SITUATION[profile.current_situation] ?? profile.current_situation,
    },
    {
      label: 'Nivel de estudios',
      value: EDUCATION[profile.education_level] ?? profile.education_level,
    },
    { label: 'Formación', value: profile.education },
    {
      label: 'Experiencia',
      value: profile.has_experience
        ? profile.experience_summary || 'Sí, con experiencia laboral'
        : 'Buscando primera experiencia',
    },
    { label: 'Habilidades técnicas', value: profile.skills },
    { label: 'Habilidades blandas', value: profile.soft_skills },
    { label: 'Intereses', value: profile.interests },
    { label: 'Modalidad', value: WORK_MODE[profile.work_mode] ?? profile.work_mode },
    {
      label: 'Tipo de oportunidad',
      value: OPPORTUNITY[profile.opportunity_type] ?? profile.opportunity_type,
    },
    {
      label: 'Disponibilidad',
      value: AVAILABILITY[profile.availability] ?? profile.availability,
    },
    { label: 'Herramientas', value: profile.tools },
    { label: 'Portafolio / LinkedIn', value: profile.portfolio_url },
  ]

  return fields.filter((f) => f.value?.trim())
}
