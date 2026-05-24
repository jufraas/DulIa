import { mockJobs, mockMarket } from './mockData'
import { buildMockPlanFromProfile } from './mockPlan'
import { RADAR_DIMENSION_KEYS, RADAR_DIMENSION_LABELS } from '../utils/radarApi'

/** @param {string} skill */
function normSkill(skill) {
  return skill.trim().toLowerCase()
}

/**
 * Vacantes de ejemplo adaptadas al perfil (ciudad, skills, scores).
 * @param {import('../store/useProfileStore').SavedProfile | null | undefined} profile
 * @returns {import('../store/useProfileStore').Job[]}
 */
export function buildMockJobsFromProfile(profile) {
  const city = profile?.ciudad?.trim() || 'Barranquilla'
  const dept = profile?.departamento?.trim() || 'Atlántico'
  const userSkills = new Set((profile?.habilidades ?? []).map(normSkill))

  return mockJobs.map((job) => {
    const req = (job.habilidades_requeridas ?? []).map(normSkill)
    const match = req.filter((s) => userSkills.has(s))
    const missing = req.filter((s) => !userSkills.has(s))
    let score = job.score_compatibilidad ?? 0

    if (req.length > 0) {
      score = Math.round(25 + (match.length / req.length) * 65)
      if (profile?.experiencia_anios && profile.experiencia_anios >= (job.experiencia_requerida ?? 0)) {
        score = Math.min(95, score + 8)
      }
    }

    const semaforo =
      score >= 80 ? 'green' : score >= 55 ? 'yellow' : score === 0 ? 'red' : 'yellow'

    return {
      ...job,
      ciudad: city,
      departamento: dept,
      habilidades_match: match,
      habilidades_faltantes: missing,
      score_compatibilidad: score,
      semaforo,
    }
  })
}

/**
 * @param {import('../store/useProfileStore').SavedProfile | null | undefined} profile
 * @returns {import('../store/useProfileStore').MarketDashboard}
 */
export function buildMockMarketFromProfile(profile) {
  const city = profile?.ciudad?.trim() || mockMarket.ciudad_filtro || 'Barranquilla'
  const sectors = profile?.sectores_interes?.filter(Boolean).slice(0, 3) ?? []
  const sector = sectors[0] ?? null
  const userSkills = new Set(
    (profile?.habilidades ?? []).map((s) => String(s).toLowerCase()),
  )

  const topSkills = (mockMarket.top_skills_demandadas ?? []).map((item) => ({
    ...item,
    tienes: userSkills.has(item.skill.toLowerCase()),
  }))

  return {
    ...mockMarket,
    ciudad_filtro: city,
    sector_filtro: sector,
    sectores_filtro: sectors.length > 0 ? sectors : mockMarket.sectores_filtro,
    top_skills_demandadas: topSkills,
    top_sectores: sector
      ? [{ sector, count: 42 }, ...mockMarket.top_sectores.filter((s) => s.sector !== sector)]
      : mockMarket.top_sectores,
  }
}

/**
 * @param {import('../store/useProfileStore').SavedProfile | null | undefined} profile
 * @param {import('../store/useProfileStore').Job[]} [jobs]
 * @returns {import('../utils/radarApi').RadarChartData}
 */
export function buildMockRadarFromProfile(profile, jobs = []) {
  const list = jobs.length ? jobs : buildMockJobsFromProfile(profile)
  const topJob = list.reduce(
    (best, job) =>
      !best || (job.score_compatibilidad ?? 0) > (best.score_compatibilidad ?? 0)
        ? job
        : best,
    /** @type {import('../store/useProfileStore').Job | null} */ (null),
  )
  const topScore = topJob?.score_compatibilidad ?? 65
  const skillsCount = profile?.habilidades?.length ?? 0
  const expYears = profile?.experiencia_anios ?? 0
  const modalidad = (profile?.modalidad ?? '').toLowerCase()

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

  /** @type {Record<string, string>} */
  const descriptions = {}
  for (const key of RADAR_DIMENSION_KEYS) {
    descriptions[key] = RADAR_DIMENSION_LABELS[key]?.sub ?? key
  }

  return {
    usuario: {
      habilidades_tecnicas: Math.min(95, 35 + skillsCount * 9),
      experiencia: Math.min(95, 30 + expYears * 12),
      educacion: edu,
      ubicacion_modalidad: modalidad.includes('remot') ? 95 : profile?.ciudad ? 88 : 72,
      preparacion: topScore,
    },
    mercado: {
      habilidades_tecnicas: 70,
      experiencia: 60,
      educacion: 75,
      ubicacion_modalidad: 80,
      preparacion: 65,
    },
    descriptions,
  }
}

/**
 * @param {import('../store/useProfileStore').SavedProfile | null | undefined} profile
 * @param {import('../store/useProfileStore').ActionPlan | null | undefined} plan
 * @param {import('../store/useProfileStore').Job[]} [jobs]
 */
export function buildMockTimelineFromProfile(profile, plan, jobs = []) {
  const list = jobs.length ? jobs : buildMockJobsFromProfile(profile)
  const topScore = Math.max(...list.map((j) => j.score_compatibilidad ?? 0), 65)
  const skillsCount = profile?.habilidades?.length ?? 3
  const hoy = new Date().toISOString().slice(0, 10)
  const nombre = profile?.nombre?.split(' ')[0] ?? 'tu perfil'

  const semanas = plan?.semanas ?? buildMockPlanFromProfile(profile).semanas

  /** @type {unknown[]} */
  const fases = [
    {
      dia: 0,
      tipo: 'inicio',
      titulo: 'Hoy',
      descripcion: `${nombre}, comienzas tu plan de acción personalizado en DulIA.`,
      metricas: {
        score_promedio: topScore,
        vacantes_match: list.filter((j) => (j.score_compatibilidad ?? 0) >= 60).length,
        habilidades: skillsCount,
      },
    },
  ]

  for (const [dia, offset] of [
    [30, 10],
    [60, 15],
    [90, 20],
  ]) {
    const semanaIdx = Math.min(semanas.length - 1, Math.floor(dia / 30) - 1)
    const semana = semanas[Math.max(0, semanaIdx)]
    fases.push({
      dia,
      tipo: 'milestone',
      titulo: `Día ${dia}: ${semana?.titulo ?? 'Hito del plan'}`,
      descripcion: semana?.tareas?.[0] ?? 'Continúa con las acciones de tu plan.',
      metricas_esperadas: {
        score_promedio: Math.min(95, topScore + offset),
        vacantes_match: Math.min(20, list.length + Math.floor(offset / 3)),
        habilidades: skillsCount + Math.floor(offset / 10),
      },
      acciones_completadas: (semana?.tareas ?? []).slice(0, 3),
    })
  }

  const scoreObjetivo = Math.min(95, topScore + 20)

  return {
    inicio: hoy,
    fases,
    proyeccion: {
      descripcion: `Con este plan, esperamos aumentar tu score de compatibilidad de ${topScore} a ${scoreObjetivo} en 90 días.`,
      tasa_crecimiento_semanal: Number(((scoreObjetivo - topScore) / 12).toFixed(1)),
    },
  }
}

/**
 * @param {import('../store/useProfileStore').SavedProfile | null | undefined} profile
 */
export function buildMockAnalysisFromProfile(profile) {
  const skills = profile?.habilidades ?? ['comunicación', 'trabajo en equipo']
  const city = profile?.ciudad ?? 'tu ciudad'
  const overall = Math.min(
    92,
    55 +
      (profile?.habilidades?.length ?? 0) * 4 +
      (profile?.experiencia_anios ?? 0) * 3,
  )

  return {
    session_id: profile?.session_id ?? 'mock',
    analisis: {
      fortalezas: skills.slice(0, 2).map((area) => ({
        area,
        descripcion: `Tienes experiencia demostrable en ${area}.`,
        nivel: 'alto',
      })),
      debilidades: [
        {
          area: 'Experiencia formal',
          descripcion:
            (profile?.experiencia_anios ?? 0) < 1
              ? 'Pocos años en rol formal; compensa con proyectos.'
              : 'Refuerza logros cuantificables en tu CV.',
          impacto: 'medio',
        },
      ],
      gaps_mercado: [
        {
          habilidad: skills[0] ?? 'habilidades técnicas',
          demanda: 'alta',
          tu_nivel: 'medio',
          brecha: `Demanda activa en ${city}; sigue practicando y certificando.`,
        },
      ],
      oportunidades: (profile?.sectores_interes ?? ['tecnología']).slice(0, 1).map((sector) => ({
        sector,
        razon: `Hay vacantes activas en ${city} para perfiles como el tuyo.`,
        potencial: 'alto',
        accion_inmediata: 'Postula a vacantes verdes esta semana.',
      })),
      nivel_preparacion: {
        overall,
        descripcion: 'Perfil competitivo para primer empleo o transición.',
        comparativa: 'Por encima del promedio de candidatos junior en la región.',
      },
      recomendaciones: [
        'Actualiza tu CV con logros medibles.',
        profile?.ciudad
          ? `Prioriza vacantes en ${profile.ciudad}.`
          : 'Define tu ciudad objetivo.',
        'Completa el plan de 30 días de DulIA.',
      ],
    },
    generado_en: new Date().toISOString(),
    mock: true,
  }
}

/**
 * Completa cualquier hueco del bundle con mocks personalizados al perfil.
 * @param {{
 *   jobs?: import('../store/useProfileStore').Job[]
 *   market?: import('../store/useProfileStore').MarketDashboard | null
 *   plan?: import('../store/useProfileStore').ActionPlan | null
 *   radar?: import('../utils/radarApi').RadarChartData | null
 *   timeline?: unknown
 *   analysis?: unknown
 * }} partial
 * @param {import('../store/useProfileStore').SavedProfile | null | undefined} profile
 */
export function fillResultsFallbacks(partial, profile) {
  const jobs =
    partial.jobs?.length ? partial.jobs : buildMockJobsFromProfile(profile)
  const market = partial.market ?? buildMockMarketFromProfile(profile)
  const plan = partial.plan ?? buildMockPlanFromProfile(profile)
  const radar = partial.radar ?? buildMockRadarFromProfile(profile, jobs)
  const timeline =
    partial.timeline ?? buildMockTimelineFromProfile(profile, plan, jobs)
  const analysis = partial.analysis ?? buildMockAnalysisFromProfile(profile)

  return { jobs, market, plan, radar, timeline, analysis }
}
