import { stageLabel } from '../../../utils/interviewV2Display'

/** @param {{ steps: Array<{ stage: string, status: 'done' | 'doing' | 'pending' }> }} props */
export default function StageStepper({ steps }) {
  return (
    <div className="mx-auto flex max-w-2xl items-center justify-between gap-1 px-2 py-3">
      {steps.map((step, i) => {
        const isDone = step.status === 'done'
        const isDoing = step.status === 'doing'
        return (
          <div key={step.stage} className="flex flex-1 items-center">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isDone
                    ? 'border-2 border-green-500 bg-green-500/15 text-green-400'
                    : isDoing
                      ? 'border-2 border-purple-500 bg-purple-500/20 text-[#C4B5FD] shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : 'border-2 border-white/12 bg-white/5 text-white/30'
                }`}
              >
                {isDone ? '✓' : i + 1}
              </div>
              <span
                className={`max-w-[4.5rem] truncate text-center text-[10px] font-semibold sm:max-w-none sm:text-xs ${
                  isDoing ? 'text-[#C4B5FD]' : isDone ? 'text-green-400/80' : 'text-white/30'
                }`}
              >
                {stageLabel(step.stage)}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-0.5 h-0.5 flex-1 rounded ${
                  isDone ? 'bg-green-500/40' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
