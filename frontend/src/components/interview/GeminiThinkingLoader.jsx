import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES = [
  'Analizando tu respuesta con IA…',
  'Evaluando claridad y estructura…',
  'Buscando oportunidades de mejora…',
  'Preparando la siguiente pregunta…',
]

/**
 * Loader de entrevista mock (5–15 s) con mensajes rotativos estilo Gemini.
 * @param {{ visible?: boolean, minMs?: number, maxMs?: number }} props
 */
export default function GeminiThinkingLoader({ visible = true, minMs = 5000, maxMs = 15000 }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!visible) return undefined

    const duration = minMs + Math.random() * Math.max(0, maxMs - minMs)
    const started = performance.now()
    let frame = 0

    const tick = () => {
      const elapsed = performance.now() - started
      setProgress(Math.min(100, (elapsed / duration) * 100))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    const messageTimer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length)
    }, 2800)

    return () => {
      cancelAnimationFrame(frame)
      clearInterval(messageTimer)
    }
  }, [visible, minMs, maxMs])

  if (!visible) return null

  return (
    <div
      className="rounded-2xl border border-violet-500/30 bg-violet-950/40 px-4 py-4 sm:px-5"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: 'var(--grad-brand)' }}
          animate={{ scale: [1, 1.06, 1], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="h-5 w-5" aria-hidden />
        </motion.div>
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="m-0 font-[family-name:var(--font-display)] text-[15px] font-semibold text-[color:var(--fg-1)]"
            >
              {MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
          <p className="mt-1 text-[12px] text-[color:var(--fg-3)]">
            Esto puede tardar unos segundos mientras procesamos tu respuesta.
          </p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ width: `${progress}%`, background: 'var(--grad-brand)' }}
        />
      </div>
    </div>
  )
}
