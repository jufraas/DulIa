import { useEffect, useMemo, useState } from 'react'
import {
  getMarketDashboard,
  getRecommendedJobs,
  loadResultsBundle,
} from '../services/api'
import { getOrCreateSessionId } from '../utils/session'
import {
  parseAnalysisResponse,
  resolveEmployabilityScore,
} from '../utils/analysisDisplay'
import { useProfileStore } from '../store/useProfileStore'

export function useResultsData() {
  const savedProfile = useProfileStore((s) => s.savedProfile)
  const jobs = useProfileStore((s) => s.jobs)
  const market = useProfileStore((s) => s.market)
  const plan = useProfileStore((s) => s.plan)
  const radar = useProfileStore((s) => s.radar)
  const analysis = useProfileStore((s) => s.analysis)
  const setJobs = useProfileStore((s) => s.setJobs)
  const setMarket = useProfileStore((s) => s.setMarket)
  const setPlan = useProfileStore((s) => s.setPlan)
  const setRadar = useProfileStore((s) => s.setRadar)
  const setTimeline = useProfileStore((s) => s.setTimeline)
  const setAnalysis = useProfileStore((s) => s.setAnalysis)
  const [loading, setLoading] = useState(false)

  const insights = useMemo(() => parseAnalysisResponse(analysis), [analysis])

  useEffect(() => {
    if (!savedProfile) return undefined

    let cancelled = false
    const sessionId = getOrCreateSessionId()

    ;(async () => {
      try {
        const [marketData, jobsData] = await Promise.all([
          getMarketDashboard({ city: savedProfile?.ciudad }, savedProfile, sessionId),
          getRecommendedJobs(sessionId, savedProfile),
        ])
        if (!cancelled) {
          setMarket(marketData)
          setJobs(jobsData)
        }
      } catch {
        /* fallbacks ya manejados en api.js */
      }
    })()

    return () => {
      cancelled = true
    }
  }, [savedProfile, setMarket, setJobs])

  useEffect(() => {
    const hasSlowBundle = plan && radar && analysis
    if (!savedProfile || hasSlowBundle) return undefined

    let cancelled = false
    const sessionId = getOrCreateSessionId()

    ;(async () => {
      setLoading(true)
      try {
        const bundle = await loadResultsBundle(sessionId, savedProfile)
        if (cancelled) return

        if (bundle.jobs.length) setJobs(bundle.jobs)
        if (bundle.market) setMarket(bundle.market)
        if (bundle.plan) setPlan(bundle.plan)
        if (bundle.radar) setRadar(bundle.radar)
        if (bundle.timeline) setTimeline(bundle.timeline)
        if (bundle.analysis) setAnalysis(bundle.analysis)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    savedProfile,
    plan,
    radar,
    analysis,
    setJobs,
    setMarket,
    setPlan,
    setRadar,
    setTimeline,
    setAnalysis,
  ])

  const topScore = resolveEmployabilityScore({ insights, jobs, radar })

  const topJob = jobs.reduce(
    (best, job) =>
      !best || (job.score_compatibilidad ?? 0) > (best.score_compatibilidad ?? 0)
        ? job
        : best,
    /** @type {import('../store/useProfileStore').Job | null} */ (null),
  )

  return {
    savedProfile,
    jobs,
    market,
    plan,
    radar,
    analysis,
    insights,
    loading,
    topScore,
    topJob,
  }
}
