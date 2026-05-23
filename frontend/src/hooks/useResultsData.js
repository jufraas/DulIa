import { useEffect, useState } from 'react'
import { getMarketDashboard, getRecommendedJobs } from '../services/api'
import { getOrCreateSessionId } from '../utils/session'
import { useProfileStore } from '../store/useProfileStore'

export function useResultsData() {
  const savedProfile = useProfileStore((s) => s.savedProfile)
  const jobs = useProfileStore((s) => s.jobs)
  const market = useProfileStore((s) => s.market)
  const setJobs = useProfileStore((s) => s.setJobs)
  const setMarket = useProfileStore((s) => s.setMarket)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!savedProfile) return

    let cancelled = false
    setLoading(true)

    const sessionId = getOrCreateSessionId()
    const city = savedProfile.ciudad

    Promise.all([
      getRecommendedJobs(sessionId),
      market ? Promise.resolve(market) : getMarketDashboard({ city }),
    ])
      .then(([nextJobs, nextMarket]) => {
        if (cancelled) return
        setJobs(nextJobs)
        if (!market) setMarket(nextMarket)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedProfile])

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
