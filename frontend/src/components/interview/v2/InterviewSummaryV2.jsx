import { motion } from 'framer-motion'
import ScoreRing from '../../brand/ScoreRing'

function scoreColor(score) {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-300'
  return 'text-red-400'
}

/**
 * @param {{
 *   resultado: {
 *     globalScore: number
 *     skill: string
 *     weakSkills: string[]
 *     stages: Array<{ label: string, score: number, strengths: string[], gaps: string[] }>
 *     feedbackGeneral: string
 *     proximosPasos: string[]
 *   }
 *   onAddToPlan: () => void
 *   onNewInterview: () => void
 *   loading?: boolean
 * }} props
 */
export default function InterviewSummaryV2({
  resultado,
  onAddToPlan,
  onNewInterview,
  loading = false,
}) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex flex-col items-center rounded-[18px] border border-purple-500/25 bg-[#1A1A24] px-6 py-9 text-center">
        <ScoreRing value={resultado.globalScore} size={160} stroke={12} />
        <p className="mt-4 mb-0 text-base text-white/50">
          Entrevista conversacional · <strong className="text-[#F1F0FB]">{resultado.skill}</strong>
        </p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">
          {resultado.feedbackGeneral}
        </p>
      </div>

      {resultado.weakSkills?.length > 0 && (
        <div className="mb-4 rounded-[18px] border border-purple-500/25 bg-[#1A1A24] p-5">
          <p className="mb-3 mt-0 font-bold text-[#F1F0FB]">Skills a reforzar</p>
          <div className="flex flex-wrap gap-2">
            {resultado.weakSkills.map((s) => (
              <span
                key={s}
                className="rounded-full border border-yellow-500/35 bg-yellow-500/12 px-3 py-1 text-sm font-semibold text-yellow-300"
              >
                ⚠️ {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onAddToPlan}
        disabled={loading || !resultado.weakSkills?.length}
        className="mb-4 w-full rounded-xl border-none bg-[#EC4899] py-3.5 text-base font-bold text-white shadow-[0_4px_20px_rgba(236,72,153,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Agregando al plan…' : 'Agregar refuerzo a mi plan'}
      </button>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {resultado.stages.map((stage, i) => (
          <motion.div
            key={stage.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-[18px] border border-purple-500/20 bg-[#1A1A24] p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="m-0 font-bold text-[#F1F0FB]">{stage.label}</p>
              <span className={`text-lg font-black ${scoreColor(stage.score)}`}>{stage.score}</span>
            </div>
            {stage.strengths?.length > 0 && (
              <ul className="mb-2 mt-0 list-inside list-disc text-sm text-green-400/90">
                {stage.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            )}
            {stage.gaps?.length > 0 && (
              <ul className="m-0 list-inside list-disc text-sm text-yellow-300/80">
                {stage.gaps.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>

      {resultado.proximosPasos?.length > 0 && (
        <div className="mb-4 rounded-[18px] border border-purple-500/25 bg-[#1A1A24] p-5">
          <p className="mb-3 mt-0 font-bold text-[#F1F0FB]">Próximos pasos</p>
          <ol className="m-0 list-decimal space-y-2 pl-5 text-sm text-white/65">
            {resultado.proximosPasos.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      <button
        type="button"
        onClick={onNewInterview}
        className="w-full rounded-xl border border-white/18 bg-transparent py-3 text-[15px] font-semibold text-white/65"
      >
        Practicar otra vez
      </button>
    </div>
  )
}
