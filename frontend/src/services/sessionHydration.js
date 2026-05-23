import { getProfile, getMarketDashboard, getPlan, getRecommendedJobs } from './api'
import { useProfileStore } from '../store/useProfileStore'
import { getOrCreateSessionId } from '../utils/session'
import { persistSessionCacheFromState, readSessionCache } from '../utils/sessionCache'

let hydrationPromise = null

/** Restaura perfil, vacantes y mercado desde cache local y/o API. */
export async function hydrateSession() {
  if (hydrationPromise) return hydrationPromise

  hydrationPromise = (async () => {
    const sessionId = getOrCreateSessionId()
    const store = useProfileStore.getState()

    store.setSessionId(sessionId)

    const cached = readSessionCache(sessionId)
    if (cached?.savedProfile) {
      store.setSavedProfile(cached.savedProfile)
      if (cached.formSnapshot) store.setFormSnapshot(cached.formSnapshot)
      if (cached.jobs?.length) store.setJobs(cached.jobs)
      if (cached.market) store.setMarket(cached.market)
      if (cached.plan) store.setPlan(cached.plan)
    }

    let profile = useProfileStore.getState().savedProfile
    if (!profile) {
      profile = await getProfile(sessionId)
      if (profile) store.setSavedProfile(profile)
    }

    profile = useProfileStore.getState().savedProfile
    if (profile) {
      const { jobs, market, plan } = useProfileStore.getState()
      const tasks = []

      if (!jobs.length) {
        tasks.push(
          getRecommendedJobs(sessionId).then((nextJobs) => {
            if (nextJobs.length) store.setJobs(nextJobs)
          }),
        )
      }

      if (!market) {
        tasks.push(
          getMarketDashboard({ city: profile.ciudad }).then((nextMarket) => {
            if (nextMarket) store.setMarket(nextMarket)
          }),
        )
      }

      if (!plan) {
        tasks.push(
          getPlan(sessionId, profile).then((nextPlan) => {
            if (nextPlan) store.setPlan(nextPlan)
          }),
        )
      }

      await Promise.all(tasks)
      persistSessionCacheFromState(useProfileStore.getState())
    }

    useProfileStore.getState().setSessionHydrated(true)
  })()

  try {
    await hydrationPromise
  } finally {
    hydrationPromise = null
  }
}
