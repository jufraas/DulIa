import { useEffect, useState } from 'react'

/**
 * Anima el ancho de una barra de 0 → target al montar; luego transición CSS en updates.
 * @param {number} pct 0–100
 */
export function useProgressBarWidth(pct) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(pct))
    return () => cancelAnimationFrame(id)
  }, [pct])

  return width
}
