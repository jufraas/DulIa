/** Semáforo de vacantes — kit ReBrand Vacancies.jsx */
export const VACANCY_STATUS = {
  green: {
    label: 'Verificada',
    color: '#34D399',
    bg: 'rgba(52,211,153,0.14)',
    br: 'rgba(52,211,153,0.40)',
  },
  yellow: {
    label: 'Revísala',
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.14)',
    br: 'rgba(251,191,36,0.40)',
  },
  red: {
    label: 'Sospechosa',
    color: '#F87171',
    bg: 'rgba(248,113,113,0.12)',
    br: 'rgba(248,113,113,0.45)',
  },
}

/** @param {import('../../store/useProfileStore').Job} job */
export function mapJobToVacancyRow(job) {
  const status = job.semaforo ?? 'green'
  const pay =
    job.salario_min || job.salario_max
      ? new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          maximumFractionDigits: 0,
        }).format(job.salario_min ?? job.salario_max ?? 0)
      : 'A convenir'

  let flag = job.descripcion?.slice(0, 120) ?? ''
  if (!flag) {
    if (status === 'green') flag = 'Vacante alineada con tu perfil y mercado local.'
    else if (status === 'yellow')
      flag = `Revisa requisitos: ${(job.habilidades_faltantes ?? []).join(', ') || 'detalles incompletos'}.`
    else flag = 'Vacante marcada por patrones de riesgo. No apliques sin verificar.'
  }

  return {
    id: job.id,
    status,
    co: job.empresa,
    role: job.titulo,
    loc: [job.ciudad, job.modalidad].filter(Boolean).join(' · ') || 'Colombia',
    pay,
    match: job.score_compatibilidad ?? 0,
    posted: job.publicado_at
      ? new Date(job.publicado_at).toLocaleDateString('es-CO')
      : 'Reciente',
    flag,
    url: job.url ?? null,
  }
}
