import { useState, useEffect } from 'react'

function AnimatedDots() {
  const [dots, setDots] = useState('')
  useEffect(() => {
    const id = setInterval(() => setDots(d => (d.length >= 3 ? '' : d + '.')), 500)
    return () => clearInterval(id)
  }, [])
  return <span>{dots}</span>
}

export default function GeminiLoader({ message = 'La IA está pensando' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5">
        <div
          className="h-14 w-14 animate-spin rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #8B5CF6, #EC4899, transparent 270deg)',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), white calc(100% - 5px))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), white calc(100% - 5px))',
          }}
        />
        <p className="animate-pulse text-base font-medium text-white">
          {message}<AnimatedDots />
        </p>
      </div>
    </div>
  )
}
