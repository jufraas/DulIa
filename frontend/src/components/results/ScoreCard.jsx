import { Target, TrendingUp } from 'lucide-react'
import ScoreRing from '../brand/ScoreRing'

/**
 * @param {{
 *   score: number,
 *   comparativa?: string | null,
 * }} props
 */
export default function ScoreCard({ score, comparativa }) {
  const badgeText =
    comparativa?.trim() || 'Tu perfil ya está en el radar del mercado laboral.'

  return (
    <div
      className="card-dl flex flex-col items-center gap-5 p-9"
      style={{ boxShadow: 'var(--glow-violet-strong)' }}
    >
      <div className="eyebrow-dl">
        <Target className="h-3.5 w-3.5" aria-hidden />
        Tu score de empleabilidad
      </div>
      <ScoreRing value={score} size={240} stroke={18} />
      <div
        className="inline-flex max-w-sm items-center gap-1.5 rounded-full px-4 py-2 text-center text-[13px] font-bold leading-snug text-[#34D399]"
        style={{
          background: 'rgba(52,211,153,0.14)',
          border: '1px solid rgba(52,211,153,0.35)',
        }}
      >
        <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {badgeText}
      </div>
    </div>
  )
}
