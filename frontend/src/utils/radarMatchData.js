/**
 * Deriva scores del radar (0–100) desde el perfil guardado.
 * @param {import('../store/useProfileStore').SavedProfile | null | undefined} profile
 * @param {number} [topScore]
 */
export function profileToRadarScores(profile, topScore = 78) {
  const skillsCount = profile?.habilidades?.length ?? 0
  const skills = Math.round(Math.min(95, 35 + skillsCount * 9))

  const expYears = profile?.experiencia_anios ?? 0
  const exp = Math.round(Math.min(95, 30 + expYears * 12))

  const eduByLevel = {
    bachillerato: 55,
    tecnico: 68,
    tecnólogo: 72,
    tecnologo: 72,
    universitario: 82,
    pregrado: 82,
    posgrado: 92,
  }
  const nivel = (profile?.nivel_educativo ?? '').toLowerCase()
  const edu =
    Object.entries(eduByLevel).find(([key]) => nivel.includes(key))?.[1] ?? 75

  const modalidad = (profile?.modalidad ?? '').toLowerCase()
  const loc =
    modalidad.includes('remot') ? 95 : profile?.ciudad ? 88 : 72

  if (!profile) {
    return { skills: topScore, exp: Math.max(40, topScore - 20), edu: 80, loc: 85 }
  }

  const blend = (value) => Math.round(value * 0.75 + topScore * 0.25)
  return {
    skills: blend(skills),
    exp: blend(exp),
    edu: blend(edu),
    loc: blend(loc),
  }
}

/**
 * @param {import('../store/useProfileStore').Job} job
 * @param {import('../store/useProfileStore').SavedProfile | null | undefined} profile
 */
function jobToVacancy(job, profile) {
  const match = job.score_compatibilidad ?? 70
  const reqExp = job.experiencia_requerida ?? 1

  const req = {
    skills: Math.min(100, Math.max(55, match + 8)),
    exp: Math.min(100, Math.max(35, reqExp * 18 + 35)),
    edu: 72,
    loc: (job.modalidad ?? '').toLowerCase().includes('remot') ? 65 : 82,
  }

  const matched = job.habilidades_match ?? []
  const missing = job.habilidades_faltantes ?? []

  const notes = {
    skills:
      matched.length > 0
        ? `Coinciden ${matched.slice(0, 2).join(' y ')}${missing.length ? `. Refuerza ${missing[0]}.` : '.'}`
        : missing.length > 0
          ? `Te falta destacar ${missing.slice(0, 2).join(' y ')}.`
          : 'Alinea tu CV con las habilidades de la vacante.',
    exp:
      (profile?.experiencia_anios ?? 0) >= reqExp
        ? 'Tu experiencia cubre lo que piden.'
        : `Piden ~${reqExp} año(s). Muestra proyectos que compensen la brecha.`,
    edu: job.nivel_educativo_req
      ? `Requieren ${job.nivel_educativo_req}. Tu nivel ${profile?.nivel_educativo ?? 'actual'} encaja si lo explicitas.`
      : 'Sin requisito académico estricto; el portfolio pesa más.',
    loc: job.ciudad
      ? `${job.ciudad}${job.modalidad ? ` · ${job.modalidad}` : ''}.`
      : 'Modalidad flexible según empresa.',
  }

  return {
    id: String(job.id),
    company: job.empresa || 'Empresa',
    role: job.titulo || 'Vacante',
    meta: [job.ciudad, job.modalidad].filter(Boolean).join(' · ') || 'Colombia',
    req,
    notes,
  }
}

/**
 * @param {import('../store/useProfileStore').Job[]} jobs
 * @param {import('../store/useProfileStore').SavedProfile | null | undefined} profile
 */
export function jobsToRadarVacancies(jobs, profile) {
  if (!jobs.length) return []
  return [...jobs]
    .sort((a, b) => (b.score_compatibilidad ?? 0) - (a.score_compatibilidad ?? 0))
    .slice(0, 3)
    .map((job) => jobToVacancy(job, profile))
}
