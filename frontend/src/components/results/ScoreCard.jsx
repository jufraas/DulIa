import { Target, TrendingUp } from 'lucide-react'
import ScoreRing from '../brand/ScoreRing'

/**
 * @param {{ score: number }} props
 */
export default function ScoreCard({ score }) {
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
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-[#34D399]"
        style={{
          background: 'rgba(52,211,153,0.14)',
          border: '1px solid rgba(52,211,153,0.35)',
        }}
      >
        <TrendingUp className="h-3.5 w-3.5" aria-hidden />
        Estás en el top 28% del mercado
      </div>
    </div>
  )
}
