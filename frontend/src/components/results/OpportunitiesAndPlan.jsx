import { useLayoutEffect, useRef, useState } from 'react'
import OpportunitiesPreview from './OpportunitiesPreview'
import ThirtyDayPlan from './ThirtyDayPlan'

/**
 * Oportunidades define la altura; el plan de acción iguala ese alto y hace scroll interno.
 * @param {{ jobs: import('../../store/useProfileStore').Job[] }} props
 */
export default function OpportunitiesAndPlan({ jobs }) {
  const oppsRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const [pairedHeight, setPairedHeight] = useState(null)

  useLayoutEffect(() => {
    const el = oppsRef.current
    if (!el) return

    const syncHeight = () => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches
      setPairedHeight(isDesktop ? el.offsetHeight : null)
    }

    syncHeight()
    const observer = new ResizeObserver(syncHeight)
    observer.observe(el)
    window.addEventListener('resize', syncHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncHeight)
    }
  }, [jobs])

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div ref={oppsRef} className="min-w-0">
        <OpportunitiesPreview jobs={jobs} />
      </div>
      <div
        className="flex min-h-0 min-w-0 flex-col"
        style={pairedHeight != null ? { height: pairedHeight } : undefined}
      >
        <ThirtyDayPlan />
      </div>
    </div>
  )
}
