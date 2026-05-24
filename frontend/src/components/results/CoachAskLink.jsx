import { MessageCircle } from 'lucide-react'
import { useCoachContextOptional } from '../../hooks/useCoachContext'

/**
 * @param {{ question: string, label?: string, className?: string }} props
 */
export default function CoachAskLink({ question, label = 'Pregúntale a DulIA', className = '' }) {
  const coach = useCoachContextOptional()
  if (!coach) return null

  return (
    <button
      type="button"
      onClick={() => coach.askCoach(question)}
      className={`inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--violet-200)] transition hover:text-[color:var(--fg-1)] ${className}`}
    >
      <MessageCircle className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
      {label}
      <span aria-hidden>→</span>
    </button>
  )
}
