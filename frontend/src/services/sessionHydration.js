import { getProfile, loadResultsBundle } from './api'
import { useProfileStore } from '../store/useProfileStore'
import { getOrCreateSessionId } from '../utils/session'
import { persistSessionCacheFromState, readSessionCache } from '../utils/sessionCache'

let hydrationPromise = null

/** Restaura perfil, vacantes, plan y radar desde cache local y/o API. */
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
      if (cached.radar) store.setRadar(cached.radar)
      if (cached.timeline) store.setTimeline(cached.timeline)
    }

    let profile = useProfileStore.getState().savedProfile
    if (!profile) {
      profile = await getProfile(sessionId)
      if (profile) store.setSavedProfile(profile)
    }

    profile = useProfileStore.getState().savedProfile
    if (profile) {
      const { jobs, market, plan, radar } = useProfileStore.getState()
      const needsBundle = !jobs.length || !market || !plan || !radar

      if (needsBundle) {
        const bundle = await loadResultsBundle(sessionId, profile)
        if (!jobs.length && bundle.jobs.length) store.setJobs(bundle.jobs)
        if (!market && bundle.market) store.setMarket(bundle.market)
        if (!plan && bundle.plan) store.setPlan(bundle.plan)
        if (!radar && bundle.radar) store.setRadar(bundle.radar)
        if (bundle.timeline) store.setTimeline(bundle.timeline)
      }

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
