import { useCallback, useEffect, useRef, useState } from 'react'

const SCROLL_OFFSET = 88

/**
 * @param {string[]} sectionIds
 */
export function useResultsSectionNav(sectionIds) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '')
  const scrollingRef = useRef(false)
  const scrollTimerRef = useRef(/** @type {number | undefined} */ (undefined))

  useEffect(() => {
    if (!sectionIds.length) return undefined

    const visible = new Map()

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return

        for (const entry of entries) {
          visible.set(entry.target.id, entry.intersectionRatio)
        }

        let bestId = sectionIds[0]
        let bestRatio = 0

        for (const id of sectionIds) {
          const ratio = visible.get(id) ?? 0
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = id
          }
        }

        if (bestRatio > 0) setActiveId(bestId)
      },
      {
        root: null,
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    )

    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [sectionIds])

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id)
    if (!el) return

    setActiveId(id)
    scrollingRef.current = true
    window.clearTimeout(scrollTimerRef.current)

    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
    window.scrollTo({ top, behavior: 'smooth' })

    scrollTimerRef.current = window.setTimeout(() => {
      scrollingRef.current = false
    }, 700)
  }, [])

  return { activeId, scrollToSection }
}
