import { stageLabel } from '../../../utils/interviewV2Display'

/** @param {{ persona: { nombre?: string, rol_entrevistador?: string, sector?: string } | null, stage: string }} props */
export default function InterviewChatHeader({ persona, stage }) {
  const initials = (persona?.nombre ?? 'A')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="sticky top-14 z-10 border-b border-purple-500/20 bg-[#12121a]/95 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-base font-bold text-[#F1F0FB]">
            {persona?.nombre ?? 'Entrevistadora'}
          </p>
          <p className="m-0 truncate text-xs text-white/45">
            {persona?.rol_entrevistador ?? 'Entrevistadora'} · {persona?.sector ?? 'sector'}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-[#C4B5FD]">
          {stageLabel(stage)}
        </span>
      </div>
    </div>
  )
}
