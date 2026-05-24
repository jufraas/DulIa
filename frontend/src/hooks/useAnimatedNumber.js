import { useEffect, useRef, useState } from 'react'

/**
 * Anima un número entero hacia `target` (p. ej. % de progreso).
 * @param {number} target
 * @param {{ duration?: number, enabled?: boolean }} [options]
 */
export function useAnimatedNumber(target, options = {}) {
  const { duration = 650, enabled = true } = options
  const [value, setValue] = useState(0)
  const frameRef = useRef(0)
  const fromRef = useRef(0)

  useEffect(() => {
    if (!enabled) return undefined

    const from = fromRef.current
    const start = performance.now()

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      setValue(Math.round(from + (target - from) * eased))
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration, enabled])

  return enabled ? value : target
}
