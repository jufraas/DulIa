/** @type {import('../store/useProfileStore').ActionPlan} */
export const mockPlan = {
  session_id: 'mock',
  semanas: [
    {
      numero: 1,
      titulo: 'Pon tu portfolio en línea',
      tareas: ['Sube 3 proyectos a Behance', 'Conecta tu LinkedIn', 'Reescribe tu bio'],
    },
    {
      numero: 2,
      titulo: 'Aplica a 10 vacantes (con cariño)',
      tareas: ['Carta personalizada cada una', 'Sigue a 5 reclutadores en LinkedIn'],
    },
    {
      numero: 3,
      titulo: 'Sube tu nivel técnico',
      tareas: ['Curso gratuito en tu stack', 'Reto: mejora un proyecto real'],
    },
    {
      numero: 4,
      titulo: 'Entrevistas + cierre',
      tareas: ['Prepara tu storytelling', 'Practica con el coach DulIA'],
    },
  ],
}

/**
 * @param {import('../store/useProfileStore').SavedProfile | null | undefined} profile
 * @returns {import('../store/useProfileStore').ActionPlan}
 */
export function buildMockPlanFromProfile(profile) {
  if (!profile?.nombre) return mockPlan

  const skillList = (profile.habilidades ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)
  const city = profile.ciudad ?? 'tu ciudad'
  const firstName = profile.nombre.split(' ')[0]
  const skillsSummary = skillList.length ? skillList.join(', ') : 'tu stack'
  const skillsTitle =
    skillList.length >= 2
      ? `Refuerza ${skillList.slice(0, 2).join(' y ')}`
      : skillList.length === 1
        ? `Refuerza ${skillList[0]}`
        : 'Sube tu nivel técnico'
  const courseTasks =
    skillList.length > 0
      ? skillList.map((skill) => `Curso corto en ${skill}`)
      : ['Curso corto en tu stack principal']

  return {
    session_id: profile.session_id,
    resumen_ejecutivo: `Plan personalizado para ${firstName} en ${city}: refuerza ${skillsSummary}, actualiza tu perfil y postula con intención durante los próximos 30 días.`,
    semanas: [
      {
        numero: 1,
        titulo: 'Afina tu perfil',
        tareas: [
          `Actualiza tu CV con logros concretos, ${firstName}`,
          profile.ciudad ? `Busca vacantes en ${profile.ciudad}` : 'Define tu ciudad objetivo',
          'Completa LinkedIn con tu carrera y habilidades',
        ],
      },
      {
        numero: 2,
        titulo: 'Aplica con intención',
        tareas: [
          'Prioriza vacantes verdes del panel DulIA',
          'Personaliza 3 postulaciones esta semana',
          'Registra empresas donde aplicaste',
        ],
      },
      {
        numero: 3,
        titulo: skillsTitle,
        tareas: [
          ...courseTasks,
          'Arma un mini proyecto para tu portafolio',
          'Pide feedback a un mentor o par',
        ],
      },
      {
        numero: 4,
        titulo: 'Cierra el mes fuerte',
        tareas: [
          'Practica entrevista con el coach DulIA',
          'Revisa vacantes amarillas que mejoraste',
          'Descarga y comparte tu plan PDF',
        ],
      },
    ],
    fase_60: {
      titulo: 'Consolida entrevistas y networking',
      objetivo: `Amplía tu red en ${city} y convierte postulaciones en conversaciones reales.`,
      acciones: [
        { tarea: 'Agenda 2 cafés virtuales con profesionales del sector' },
        { tarea: 'Prepara respuestas STAR para entrevistas técnicas' },
        { tarea: 'Publica un logro reciente en LinkedIn' },
      ],
      metricas: ['3 entrevistas agendadas', 'Red +15 contactos relevantes'],
    },
    fase_90: {
      titulo: 'Cierra tu transición laboral',
      objetivo: `Objetivo: oferta o pipeline sólido en ${city} con ${skillsSummary}.`,
      acciones: [
        { tarea: 'Negocia al menos una oferta o contrato' },
        { tarea: 'Documenta aprendizajes del proceso de búsqueda' },
        { tarea: 'Actualiza portafolio con proyecto del plan' },
      ],
      metricas: ['Oferta firmada o 5 procesos activos', 'Score de empleabilidad +15 pts'],
    },
    milestones: [
      { dia: 30, logro: 'CV y LinkedIn optimizados; 5+ postulaciones enviadas' },
      { dia: 60, logro: 'Primeras entrevistas y red ampliada' },
      { dia: 90, logro: 'Oferta o pipeline sólido de oportunidades' },
    ],
    recursos_recomendados: skillList.length
      ? skillList.map((skill) => ({
          tipo: 'curso',
          nombre: `Fundamentos de ${skill}`,
          descripcion: `Curso corto para reforzar ${skill} según demanda en ${city}.`,
          duracion: '20–40 horas',
          costo_aprox: 'Gratis / bajo costo',
        }))
      : [
          {
            tipo: 'curso',
            nombre: 'Habilidades blandas para entrevistas',
            descripcion: 'Comunicación y storytelling profesional.',
            duracion: '10 horas',
            costo_aprox: 'Gratis',
          },
        ],
  }
}
