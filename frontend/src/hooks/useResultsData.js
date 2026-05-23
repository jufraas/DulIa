import { useEffect, useState } from 'react'
import { getMarketDashboard, getPlan, getRecommendedJobs } from '../services/api'
import { getOrCreateSessionId } from '../utils/session'
import { useProfileStore } from '../store/useProfileStore'

export function useResultsData() {
  const savedProfile = useProfileStore((s) => s.savedProfile)
  const jobs = useProfileStore((s) => s.jobs)
  const market = useProfileStore((s) => s.market)
  const plan = useProfileStore((s) => s.plan)
  const setJobs = useProfileStore((s) => s.setJobs)
  const setMarket = useProfileStore((s) => s.setMarket)
  const setPlan = useProfileStore((s) => s.setPlan)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!savedProfile || (jobs.length > 0 && market && plan)) return

    let cancelled = false
    setLoading(true)

    const sessionId = getOrCreateSessionId()
    const city = savedProfile.ciudad

    Promise.all([
      jobs.length ? Promise.resolve(jobs) : getRecommendedJobs(sessionId),
      market ? Promise.resolve(market) : getMarketDashboard({ city }),
      plan ? Promise.resolve(plan) : getPlan(sessionId, savedProfile),
    ])
      .then(([nextJobs, nextMarket, nextPlan]) => {
        if (cancelled) return
        if (!jobs.length) setJobs(nextJobs)
        if (!market) setMarket(nextMarket)
        if (!plan) setPlan(nextPlan)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [savedProfile, jobs, market, plan, setJobs, setMarket, setPlan])

  const topScore =
    jobs.length > 0
      ? Math.max(...jobs.map((j) => j.score_compatibilidad ?? 0))
      : 0

  const topJob = jobs.reduce(
    (best, job) =>
      !best || (job.score_compatibilidad ?? 0) > (best.score_compatibilidad ?? 0)
        ? job
        : best,
    /** @type {import('../store/useProfileStore').Job | null} */ (null),
  )

  return { savedProfile, jobs, market, loading, topScore, topJob }
}
