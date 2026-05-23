import { useCallback, useState } from 'react'
import { useProfileStore } from '../store/useProfileStore'

export function usePdfDownload() {
  const savedProfile = useProfileStore((s) => s.savedProfile)
  const jobs = useProfileStore((s) => s.jobs)
  const market = useProfileStore((s) => s.market)
  const [downloading, setDownloading] = useState(false)

  const downloadPdf = useCallback(async () => {
    if (!savedProfile) return
    setDownloading(true)
    try {
      const { generateAnalysisPdf } = await import('../utils/generateAnalysisPdf')
      generateAnalysisPdf({ profile: savedProfile, jobs, market })
    } finally {
      setDownloading(false)
    }
  }, [savedProfile, jobs, market])

  return { downloading, downloadPdf }
}
