import { useCallback, useState } from 'react'
import { useProfileStore } from '../store/useProfileStore'

export function usePdfDownload() {
  const savedProfile = useProfileStore((s) => s.savedProfile)
  const jobs = useProfileStore((s) => s.jobs)
  const market = useProfileStore((s) => s.market)
  const analysis = useProfileStore((s) => s.analysis)
  const plan = useProfileStore((s) => s.plan)
  const radar = useProfileStore((s) => s.radar)
  const timeline = useProfileStore((s) => s.timeline)
  const [downloading, setDownloading] = useState(false)

  const downloadPdf = useCallback(async () => {
    if (!savedProfile) return
    setDownloading(true)
    try {
      const { generateAnalysisPdf } = await import('../utils/generateAnalysisPdf')
      const topJob = jobs.reduce(
        (best, job) =>
          !best || (job.score_compatibilidad ?? 0) > (best.score_compatibilidad ?? 0)
            ? job
            : best,
        null,
      )
      await generateAnalysisPdf({
        profile: savedProfile,
        jobs,
        market,
        analysis,
        plan,
        radar,
        timeline,
        topJob,
      })
    } catch (err) {
      console.error('[PDF]', err)
      window.alert(
        'No pudimos generar el PDF. Intenta de nuevo en unos segundos o recarga la página.',
      )
    } finally {
      setDownloading(false)
    }
  }, [savedProfile, jobs, market, analysis, plan, radar, timeline])

  return { downloading, downloadPdf }
}
