import { useCallback, useState } from 'react'
import { useProfileStore } from '../store/useProfileStore'

/**
 * @owner compañero-front
 * Descarga del PDF de análisis.
 */
export function usePdfDownload() {
  const profile = useProfileStore((s) => s.profile)
  const result = useProfileStore((s) => s.result)
  const cvFileName = useProfileStore((s) => s.cvFileName)
  const [downloading, setDownloading] = useState(false)

  const downloadPdf = useCallback(async () => {
    if (!result) return
    setDownloading(true)
    try {
      const { generateAnalysisPdf } = await import('../utils/generateAnalysisPdf')
      generateAnalysisPdf({ profile, result, cvFileName })
    } finally {
      setDownloading(false)
    }
  }, [profile, result, cvFileName])

  return { downloading, downloadPdf }
}
