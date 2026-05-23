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

  const skills = (profile.habilidades ?? []).slice(0, 2).join(', ') || 'tu stack'
  const city = profile.ciudad ?? 'tu ciudad'
  const firstName = profile.nombre.split(' ')[0]

  return {
    session_id: profile.session_id,
    resumen_ejecutivo: `Plan personalizado para ${firstName} en ${city}: refuerza ${skills}, actualiza tu perfil y postula con intención durante los próximos 30 días.`,
    semanas: [
      {
        numero: 1,
        titulo: 'Afina tu perfil',
        tareas: [
          `Actualiza tu CV con logros concretos, ${profile.nombre.split(' ')[0]}`,
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
        titulo: `Refuerza ${skills}`,
        tareas: [
          `Curso corto en ${skills}`,
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
  }
}
