import { motion } from 'framer-motion'

export default function TypingIndicator({ label = 'Está escribiendo…' }) {
  return (
    <div className="flex justify-start px-1 py-2" role="status" aria-live="polite">
      <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-purple-500/20 bg-[#1A1A24] px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-purple-400"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <span className="text-sm text-white/50">{label}</span>
      </div>
    </div>
  )
}
