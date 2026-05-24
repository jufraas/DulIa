import { Target, TrendingUp } from 'lucide-react'
import ScoreRing from '../brand/ScoreRing'

/**
 * @param {{
 *   score: number,
 *   comparativa?: string | null,
 *   className?: string,
 * }} props
 */
export default function ScoreCard({ score, comparativa, className = '' }) {
  const badgeText =
    comparativa?.trim() || 'Tu perfil ya está en el radar del mercado laboral.'

  return (
    <div
      className={`card-dl flex min-h-[360px] shrink-0 flex-col items-center justify-center gap-3 p-6 ${className}`}
      style={{ boxShadow: 'var(--glow-violet-strong)' }}
    >
      <div className="eyebrow-dl shrink-0">
        <Target className="h-3.5 w-3.5" aria-hidden />
        Tu score de empleabilidad
      </div>
      <ScoreRing value={score} size={190} stroke={15} />
      <div
        className="flex w-full items-start gap-2 rounded-2xl px-3.5 py-2.5 text-left text-[12px] font-semibold leading-relaxed text-[#34D399]"
        style={{
          background: 'rgba(52,211,153,0.14)',
          border: '1px solid rgba(52,211,153,0.35)',
        }}
      >
        <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{badgeText}</span>
      </div>
    </div>
  )
}
