import {
  buildCoachStarterSuggestions,
  buildCoachWelcomeMessage,
} from './coachSuggestions'

/**
 * @typedef {Object} CoachPageContent
 * @property {string} welcomeMessage
 * @property {string[]} starterSuggestions
 * @property {string} teaserTitle
 * @property {string} teaserBody
 * @property {number} teaserDelayMs
 */

/**
 * @param {{
 *   profile?: import('../store/useProfileStore').SavedProfile | null,
 *   topScore?: number,
 *   topJob?: import('../store/useProfileStore').Job | null,
 *   insights?: import('./analysisDisplay').AnalysisInsights | null,
 * }} ctx
 */
function buildVacanciesSuggestions({ topJob }) {
  /** @type {string[]} */
  const items = [
    '¿Qué significa el semáforo amarillo?',
    '¿Debo priorizar vacantes remotas?',
  ]
  if (topJob?.titulo) {
    const short =
      topJob.titulo.length > 40 ? `${topJob.titulo.slice(0, 37)}…` : topJob.titulo
    items.unshift(`¿Cómo aplico a ${short}?`)
  } else {
    items.unshift('¿Cuál vacante me conviene más?')
  }
  return items.slice(0, 3)
}

/**
 * @param {string} routePath
 * @param {{
 *   profile?: import('../store/useProfileStore').SavedProfile | null,
 *   topScore?: number,
 *   topJob?: import('../store/useProfileStore').Job | null,
 *   insights?: import('./analysisDisplay').AnalysisInsights | null,
 * }} ctx
 * @returns {CoachPageContent}
 */
export function buildCoachPageContent(routePath, ctx) {
  const hasProfile = Boolean(ctx.profile)

  if (routePath === '/resultados') {
    return {
      welcomeMessage: buildCoachWelcomeMessage(ctx),
      starterSuggestions: buildCoachStarterSuggestions(ctx),
      teaserTitle: '¿Alguna duda?',
      teaserBody: 'Escríbeme sobre tu score, plan o vacantes.',
      teaserDelayMs: 2800,
    }
  }

  if (routePath === '/vacantes' && hasProfile) {
    return {
      welcomeMessage: buildCoachWelcomeMessage(ctx),
      starterSuggestions: buildVacanciesSuggestions(ctx),
      teaserTitle: '¿Dudas con una vacante?',
      teaserBody: 'Pregúntame por el semáforo o si vale la pena aplicar.',
      teaserDelayMs: 3200,
    }
  }

  if (routePath === '/comenzar') {
    return {
      welcomeMessage: hasProfile
        ? buildCoachWelcomeMessage(ctx)
        : 'Estoy aquí si te trabas con el wizard — estudios, habilidades o qué tipo de trabajo buscas.',
      starterSuggestions: [
        '¿Qué pongo en habilidades técnicas?',
        '¿El CV es obligatorio?',
        '¿Puedo buscar trabajo remoto?',
      ],
      teaserTitle: '¿Te ayudo con el wizard?',
      teaserBody: 'Pregúntame sin salir del formulario.',
      teaserDelayMs: 4500,
    }
  }

  if (routePath === '/sobre') {
    return {
      welcomeMessage: hasProfile
        ? buildCoachWelcomeMessage(ctx)
        : 'Pregúntame cómo funciona DulIA, qué datos usamos o qué obtienes al terminar el wizard.',
      starterSuggestions: hasProfile
        ? buildCoachStarterSuggestions(ctx)
        : ['¿Cómo analiza DulIA mi perfil?', '¿De dónde salen las vacantes?', '¿Es gratis?'],
      teaserTitle: '¿Quieres saber más?',
      teaserBody: 'Te explico el modelo sin tecnicismos.',
      teaserDelayMs: 4000,
    }
  }

  if (routePath === '/perfil') {
    return {
      welcomeMessage: hasProfile
        ? `${ctx.profile?.nombre?.split(' ')[0] ?? 'Hola'}, puedo ayudarte a interpretar tu perfil o qué hacer después.`
        : 'Completa tu perfil en /comenzar para que pueda orientarte mejor.',
      starterSuggestions: hasProfile
        ? ['¿Cómo actualizo mi perfil?', '¿Vuelvo a ver mi análisis?', '¿Qué sigue después del plan?']
        : ['¿Cómo empiezo con DulIA?'],
      teaserTitle: '¿Necesitas orientación?',
      teaserBody: 'Pregúntame sobre tu cuenta o próximos pasos.',
      teaserDelayMs: 3500,
    }
  }

  // Landing y resto
  return {
    welcomeMessage: hasProfile
      ? buildCoachWelcomeMessage(ctx)
      : 'Hola — soy el coach de DulIA. Te explico cómo funciona o qué obtienes al completar tu perfil.',
    starterSuggestions: hasProfile
      ? buildCoachStarterSuggestions(ctx)
      : ['¿Cómo funciona DulIA?', '¿Necesito crear cuenta?', '¿Qué es el score de empleabilidad?'],
    teaserTitle: '¿Tienes una pregunta?',
    teaserBody: hasProfile
      ? 'Sigo aquí por si quieres retomar tu análisis.'
      : 'Te explico DulIA antes de que empieces.',
    teaserDelayMs: routePath === '/' ? 5500 : 3200,
  }
}

/** Rutas donde no mostramos el FAB del coach */
export const COACH_HIDDEN_ROUTES = ['/login', '/registro', '/construccion']
