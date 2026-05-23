import { create } from 'zustand'

/**
 * @typedef {Object} ProfileForm
 * @property {string} name
 * @property {string} city
 * @property {string} age_range
 * @property {string} current_situation
 * @property {string} education_level
 * @property {string} education
 * @property {boolean} has_experience
 * @property {string} experience_summary
 * @property {string} skills
 * @property {string} soft_skills
 * @property {string} interests
 * @property {string} work_mode
 * @property {string} opportunity_type
 * @property {string} availability
 * @property {string} tools
 * @property {string} portfolio_url
 */

/** @typedef {{ profile: string, score: number, opportunities: string[], roadmap: string[] }} AnalysisResult */

/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<{ profile: ProfileForm | null, result: AnalysisResult | null, setProfile: (p: ProfileForm) => void, setResult: (r: AnalysisResult) => void, reset: () => void }>>} */
export const useProfileStore = create((set) => ({
  profile: null,
  result: null,
  setProfile: (profile) => set({ profile }),
  setResult: (result) => set({ result }),
  reset: () => set({ profile: null, result: null }),
}))
