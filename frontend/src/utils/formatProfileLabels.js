const EDUCATION = {
  bachiller: 'Bachiller',
  tecnico: 'Técnico / SENA',
  tecnologo: 'Tecnólogo',
  universitario: 'Universitario',
  posgrado: 'Posgrado',
  postgrado: 'Posgrado',
}

const MODALITY = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
  indiferente: 'Indiferente',
}

/** @param {import('../store/useProfileStore').SavedProfile | null} profile */
export function savedProfileToDisplayFields(profile) {
  if (!profile) return []

  /** @type {{ label: string, value: string }[]} */
  const fields = [
    { label: 'Nombre', value: profile.nombre },
    { label: 'Ciudad', value: profile.ciudad },
    { label: 'Departamento', value: profile.departamento },
    {
      label: 'Edad',
      value: profile.edad != null ? `${profile.edad} años` : '',
    },
    {
      label: 'Nivel de estudios',
      value: EDUCATION[profile.nivel_educativo ?? ''] ?? profile.nivel_educativo,
    },
    { label: 'Carrera', value: profile.carrera },
    {
      label: 'Experiencia',
      value:
        profile.experiencia_anios != null
          ? `${profile.experiencia_anios} año(s)`
          : '',
    },
    {
      label: 'Habilidades',
      value: (profile.habilidades ?? []).join(', '),
    },
    {
      label: 'Sectores de interés',
      value: (profile.sectores_interes ?? []).join(', '),
    },
    {
      label: 'Modalidad',
      value: MODALITY[profile.modalidad ?? ''] ?? profile.modalidad,
    },
  ]

  return fields.filter((f) => f.value?.toString().trim())
}
