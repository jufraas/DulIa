import { useEffect, useState } from 'react'

/**
 * @param {{ value?: number, size?: number, stroke?: number, animate?: boolean }} props
 */
export default function ScoreRing({
  value = 0,
  size = 240,
  stroke = 18,
  animate = true,
}) {
  const [animatedValue, setAnimatedValue] = useState(animate ? 0 : value)
  const displayValue = animate ? animatedValue : value

  useEffect(() => {
    if (!animate) return undefined
    const id = window.setTimeout(() => setAnimatedValue(value), 150)
    return () => window.clearTimeout(id)
  }, [value, animate])

  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - displayValue / 100)
  const gradientId = `ringGrad-${size}-${stroke}`

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.30,1)',
            filter: 'drop-shadow(0 0 16px rgba(168,85,247,0.55))',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="font-[family-name:var(--font-display)] font-black leading-none tracking-[-0.05em] text-transparent"
          style={{
            fontSize: size * 0.32,
            background: 'linear-gradient(135deg,#C084FC 0%,#EC4899 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
          }}
        >
          {displayValue}
        </div>
        <div
          className="mt-1 font-[family-name:var(--font-display)] font-semibold text-[color:var(--fg-3)]"
          style={{ fontSize: size * 0.07 }}
        >
          / 100 puntos
        </div>
      </div>
    </div>
  )
}
