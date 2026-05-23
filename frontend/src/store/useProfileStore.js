import { create } from 'zustand'

/** @typedef {{ name: string, city: string, education: string, skills: string, interests: string }} ProfileForm */

/** @typedef {{ profile: string, score: number, opportunities: string[], roadmap: string[] }} AnalysisResult */

/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<{ profile: ProfileForm | null, result: AnalysisResult | null, setProfile: (p: ProfileForm) => void, setResult: (r: AnalysisResult) => void, reset: () => void }>>} */
export const useProfileStore = create((set) => ({
  profile: null,
  result: null,
  setProfile: (profile) => set({ profile }),
  setResult: (result) => set({ result }),
  reset: () => set({ profile: null, result: null }),
}))
