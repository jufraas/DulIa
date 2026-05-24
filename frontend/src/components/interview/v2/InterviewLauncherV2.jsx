import { useState } from 'react'

const SKILLS = ['React', 'Python', 'SQL', 'Excel', 'Power BI']

const ROLES = ['Desarrollador Jr', 'Analista de Datos', 'Frontend Jr', 'QA', 'Ninguno']

const SKILL_COLORS = {
  React: '#38BDF8',
  Python: '#EAB308',
  SQL: '#22C55E',
  Excel: '#10B981',
  'Power BI': '#F97316',
}

/** @param {{ onStart: (skill: string, rol: string) => void, starting?: boolean }} props */
export default function InterviewLauncherV2({ onStart, starting = false }) {
  const [skill, setSkill] = useState(null)
  const [rol, setRol] = useState('Ninguno')

  return (
    <div className="w-full max-w-xl rounded-[22px] border border-purple-500/30 bg-[#1A1A24] p-8 sm:p-9">
      <h2 className="m-0 text-[22px] font-extrabold text-[#F1F0FB]">
        Conversación con tu entrevistadora IA
      </h2>
      <p className="mt-2 mb-7 text-[15px] leading-relaxed text-white/50">
        No es un cuestionario: Andrea te guiará por rapport, técnica, behavioral y cierre — como
        una entrevista real.
      </p>

      <p className="mb-2.5 text-xs font-bold tracking-wider text-white/40">SKILL A PRACTICAR</p>
      <div className="mb-6 flex flex-wrap gap-2">
        {SKILLS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSkill(s)}
            className="cursor-pointer rounded-full px-[18px] py-2 text-sm font-semibold transition-all"
            style={{
              border: skill === s ? `2px solid ${SKILL_COLORS[s]}` : '2px solid rgba(255,255,255,0.12)',
              backgroundColor: skill === s ? `${SKILL_COLORS[s]}22` : 'rgba(255,255,255,0.04)',
              color: skill === s ? SKILL_COLORS[s] : 'rgba(255,255,255,0.6)',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="mb-2.5 text-xs font-bold tracking-wider text-white/40">ROL (OPCIONAL)</p>
      <select
        value={rol}
        onChange={(e) => setRol(e.target.value)}
        className="mb-6 w-full cursor-pointer rounded-xl border border-white/12 bg-white/[0.06] px-3.5 py-2.5 text-[15px] text-[#F1F0FB] outline-none"
      >
        {ROLES.map((r) => (
          <option key={r} value={r} className="bg-[#1A1A24]">
            {r}
          </option>
        ))}
      </select>

      <div className="mb-7 grid grid-cols-3 gap-2.5">
        {[
          { label: '~4 min', sub: 'Demo fluida' },
          { label: '4', sub: 'Etapas' },
          { label: 'IA', sub: 'Repreguntas en vivo' },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-purple-500/20 bg-purple-500/[0.08] p-3 text-center"
          >
            <p className="m-0 text-xl font-extrabold text-[#C4B5FD]">{card.label}</p>
            <p className="mt-1 mb-0 text-xs text-white/40">{card.sub}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={!skill || starting}
        onClick={() => skill && onStart(skill, rol)}
        className="w-full rounded-xl border-none py-3.5 text-base font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundColor: skill && !starting ? '#EC4899' : 'rgba(236,72,153,0.3)',
          boxShadow: skill && !starting ? '0 4px 20px rgba(236,72,153,0.35)' : 'none',
        }}
      >
        {starting ? 'Conectando con Andrea…' : '💬 Iniciar conversación'}
      </button>
    </div>
  )
}
