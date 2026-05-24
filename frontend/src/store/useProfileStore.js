import { create } from 'zustand'
import {
  clearSessionCache,
  clearWizardDraft,
  persistSessionCacheFromState,
} from '../utils/sessionCache'

/**
 * @typedef {Object} OnboardingFormState
 * @property {string} name
 * @property {string} city
 * @property {string} departamento
 * @property {string} edad
 * @property {string} age_range
 * @property {string} current_situation
 * @property {string} education_level
 * @property {string} education
 * @property {string} has_experience
 * @property {string} experience_years
 * @property {string} experience_summary
 * @property {string} skills
 * @property {string} soft_skills
 * @property {string} interests
 * @property {string} work_mode
 * @property {string} opportunity_type
 * @property {string} availability
 * @property {string} salary_min
 * @property {string} salary_max
 * @property {string} tools
 * @property {string} portfolio_url
 * @property {string} cv_file_name
 * @property {string} cv_parsed
 */

/**
 * Perfil guardado — respuesta POST /api/profile
 * @typedef {Object} SavedProfile
 * @property {string} id
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
 * @property {string} [modalidad]
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} titulo
 * @property {string} empresa
 * @property {string} ciudad
 * @property {string} [departamento]
 * @property {number} [salario_min]
 * @property {number} [salario_max]
 * @property {string[]} [habilidades_requeridas]
 * @property {string} [sector]
 * @property {number} [experiencia_requerida]
 * @property {string} [nivel_educativo_req]
 * @property {string} [modalidad]
 * @property {'green'|'yellow'|'red'} [semaforo]
 * @property {string} [descripcion]
 * @property {string} [publicado_at]
 * @property {number} score_compatibilidad
 * @property {string[]} [habilidades_match]
 * @property {string[]} [habilidades_faltantes]
 * @property {string|null} [url]
 */

/**
 * @typedef {Object} MarketModalityCounts
 * @property {number} [remoto]
 * @property {number} [presencial]
 * @property {number} [hibrido]
 */

/**
 * @typedef {Object} MarketSourceCounts
 * @property {number} [getonbrd]
 * @property {number} [remotive]
 * @property {number} [mock]
 */

/**
 * @typedef {Object} MarketSkillDemand
 * @property {string} skill
 * @property {number} count
 * @property {boolean} tienes
 */

/**
 * @typedef {Object} MarketDashboard
 * @property {number} [total_vacantes_activas]
 * @property {number} [vacantes_locales]
 * @property {number} [vacantes_remotas]
 * @property {number} [vacantes_nacionales]
 * @property {string[]} [sectores_filtro]
 * @property {MarketSkillDemand[]} [top_skills_demandadas]
 * @property {{ sector: string, count: number }[]} [top_sectores]
 * @property {number|null} [salario_promedio]
 * @property {string[]} [top_empresas_verdes]
 * @property {number|null} [crecimiento_semanal_pct]
 * @property {string|null} [ciudad_filtro]
 * @property {string|null} [sector_filtro]
 * @property {MarketModalityCounts} [por_modalidad]
 * @property {MarketSourceCounts} [por_fuente]
 */

/**
 * Semana del plan — derivado de POST /profile/{id}/action-plan (fase_30).
 * @typedef {Object} PlanWeek
 * @property {number} numero
 * @property {string} titulo
 * @property {string[]} tareas
 */

/**
 * @typedef {Object} ActionPlan
 * @property {string} session_id
 * @property {PlanWeek[]} semanas
 * @property {string} [resumen_ejecutivo]
 * @property {unknown} [fase_60]
 * @property {unknown} [fase_90]
 * @property {unknown[]} [milestones]
 * @property {unknown[]} [recursos_recomendados]
 */

/**
 * @typedef {import('../utils/radarApi').RadarChartData} RadarChartData
 */

/**
 * @typedef {Object} CoachChatResponse
 * @property {string} respuesta
 * @property {string[]} sugerencias_rapidas
 */

export const useProfileStore = create((set, get) => ({
  sessionId: null,
  savedProfile: null,
  formSnapshot: null,
  jobs: [],
  market: null,
  plan: null,
  radar: null,
  timeline: null,
  analysis: null,
  apiUsesMock: true,
  sessionHydrated: false,

  setSessionId: (sessionId) => set({ sessionId }),
  setSessionHydrated: (sessionHydrated) => set({ sessionHydrated }),
  setSavedProfile: (savedProfile) => {
    set({ savedProfile })
    persistSessionCacheFromState(get())
  },
  setFormSnapshot: (formSnapshot) => {
    set({ formSnapshot })
    persistSessionCacheFromState(get())
  },
  setJobs: (jobs) => {
    set({ jobs })
    persistSessionCacheFromState(get())
  },
  setMarket: (market) => {
    set({ market })
    persistSessionCacheFromState(get())
  },
  setPlan: (plan) => {
    set({ plan })
    persistSessionCacheFromState(get())
  },
  setRadar: (radar) => {
    set({ radar })
    persistSessionCacheFromState(get())
  },
  setTimeline: (timeline) => {
    set({ timeline })
    persistSessionCacheFromState(get())
  },
  setAnalysis: (analysis) => {
    set({ analysis })
    persistSessionCacheFromState(get())
  },
  setApiUsesMock: (apiUsesMock) => set({ apiUsesMock }),

  reset: () => {
    clearSessionCache()
    clearWizardDraft()
    set({
      savedProfile: null,
      formSnapshot: null,
      jobs: [],
      market: null,
      plan: null,
      radar: null,
      timeline: null,
      analysis: null,
    })
  },
}))
