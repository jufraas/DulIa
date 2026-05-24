import { useCallback, useState } from 'react'
import { useProfileStore } from '../store/useProfileStore'

export function usePdfDownload() {
  const savedProfile = useProfileStore((s) => s.savedProfile)
  const jobs = useProfileStore((s) => s.jobs)
  const market = useProfileStore((s) => s.market)
  const analysis = useProfileStore((s) => s.analysis)
  const plan = useProfileStore((s) => s.plan)
  const radar = useProfileStore((s) => s.radar)
  const [downloading, setDownloading] = useState(false)

  const downloadPdf = useCallback(async () => {
    if (!savedProfile) return
    setDownloading(true)
    try {
      const { generateAnalysisPdf } = await import('../utils/generateAnalysisPdf')
      await generateAnalysisPdf({
        profile: savedProfile,
        jobs,
        market,
        analysis,
        plan,
        radar,
      })
    } finally {
      setDownloading(false)
    }
  }, [savedProfile, jobs, market, analysis, plan, radar])

  return { downloading, downloadPdf }
}
