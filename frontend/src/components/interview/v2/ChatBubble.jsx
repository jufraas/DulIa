import { stageLabel } from '../../../utils/interviewV2Display'

/** @param {{ role: 'interviewer' | 'candidate', text: string, stage?: string, showStageLabel?: boolean }} props */
export default function ChatBubble({ role, text, stage, showStageLabel = false }) {
  const isCandidate = role === 'candidate'

  return (
    <div className={`flex w-full ${isCandidate ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-[75%] ${isCandidate ? 'text-right' : 'text-left'}`}>
        {showStageLabel && stage && !isCandidate && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">
            {stageLabel(stage)}
          </p>
        )}
        <div
          className={`inline-block rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
            isCandidate
              ? 'rounded-br-md bg-purple-500/15 text-[#F1F0FB]'
              : 'rounded-bl-md border border-purple-500/25 bg-[color:var(--surface-card,#1A1A24)] text-[#F1F0FB]'
          }`}
        >
          {text}
        </div>
      </div>
    </div>
  )
}
