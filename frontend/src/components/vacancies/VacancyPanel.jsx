import { AlertTriangle, Check, Shield } from 'lucide-react'
import TrafficDot from './TrafficDot'
import { VACANCY_STATUS } from './vacancyStatus'

const ICONS = {
  green: Check,
  yellow: AlertTriangle,
  red: Shield,
}

/** @param {{ status: 'green'|'yellow'|'red' }} props */
export function StatusBadge({ status }) {
  const s = VACANCY_STATUS[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em]"
      style={{ background: s.bg, border: `1px solid ${s.br}`, color: s.color }}
    >
      <span
        className="rounded-full"
        style={{
          width: 6,
          height: 6,
          background: s.color,
          boxShadow: `0 0 6px ${s.color}`,
        }}
      />
      {s.label}
    </span>
  )
}

/** @param {{ status: 'green'|'yellow'|'red', count: number, title: string, body: string }} props */
export function TrafficStat({ status, count, title, body }) {
  const s = VACANCY_STATUS[status]
  return (
    <div
      className="card-dl relative overflow-hidden"
      style={{
        padding: 22,
        borderColor: s.br,
        boxShadow: `0 0 0 1px ${s.br}, 0 14px 40px ${s.bg}`,
      }}
    >
      <div
        className="absolute left-0 right-0 top-0 h-[3px] opacity-85"
        style={{ background: s.color, boxShadow: `0 0 20px ${s.color}` }}
      />
      <div className="mb-3.5 flex items-center gap-3">
        <TrafficDot status={status} pulse />
        <span
          className="text-xs font-bold uppercase tracking-[0.14em]"
          style={{ color: s.color }}
        >
          {s.label}
        </span>
      </div>
      <div className="mb-1.5 flex items-baseline gap-2.5">
        <span className="font-[family-name:var(--font-display)] text-[56px] font-black leading-none tracking-[-0.04em] text-[color:var(--fg-1)]">
          {count}
        </span>
        <span className="text-sm text-[color:var(--fg-3)]">vacantes</span>
      </div>
      <div className="mb-1 text-sm font-semibold text-[color:var(--fg-1)]">{title}</div>
      <div className="text-[13px] leading-snug text-[color:var(--fg-3)]">{body}</div>
    </div>
  )
}

/** @param {{ job: ReturnType<import('./vacancyStatus').mapJobToVacancyRow> }} props */
export function VacancyRow({ job }) {
  const s = VACANCY_STATUS[job.status]
  const FlagIcon = ICONS[job.status] ?? Check

  return (
    <div
      className="grid cursor-pointer items-center gap-4 rounded-[18px] px-5 py-4 transition-transform duration-200 sm:grid-cols-[8px_auto_1fr_auto_auto] sm:gap-[18px]"
      style={{
        background: 'var(--bg-2)',
        border: `1px solid ${s.br}`,
        boxShadow: `0 8px 24px ${s.bg}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = `0 14px 36px ${s.bg}, 0 0 0 1px ${s.color}`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = `0 8px 24px ${s.bg}`
      }}
    >
      <div
        className="hidden h-12 w-1.5 rounded-sm sm:block"
        style={{ background: s.color, boxShadow: `0 0 12px ${s.color}` }}
      />

      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] font-[family-name:var(--font-display)] text-lg font-extrabold text-white"
        style={{
          background:
            job.status === 'red'
              ? 'linear-gradient(135deg, #5A5A6B, #22222F)'
              : 'var(--grad-brand)',
          opacity: job.status === 'red' ? 0.6 : 1,
        }}
      >
        {job.co[0]}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className="font-[family-name:var(--font-display)] text-base font-bold"
            style={{
              color: job.status === 'red' ? 'var(--fg-2)' : 'var(--fg-1)',
              textDecoration: job.status === 'red' ? 'line-through' : 'none',
              textDecorationColor: 'rgba(248,113,113,0.6)',
            }}
          >
            {job.role}
          </span>
          <StatusBadge status={job.status} />
        </div>
        <div className="mt-1 text-[13px] text-[color:var(--fg-3)]">
          <strong className="text-[color:var(--fg-2)]">{job.co}</strong> · {job.loc} ·{' '}
          {job.posted}
        </div>
        <div
          className="mt-1.5 flex items-center gap-1.5 text-xs font-medium"
          style={{ color: s.color }}
        >
          <FlagIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {job.flag}
        </div>
      </div>

      <div className="text-right">
        <div
          className="font-[family-name:var(--font-display)] text-[15px] font-bold"
          style={{ color: job.status === 'red' ? 'var(--fg-3)' : 'var(--fg-1)' }}
        >
          {job.pay}
        </div>
        <div className="mt-0.5 text-[11px] text-[color:var(--fg-3)]">
          {job.match > 0 ? `${job.match}% match` : '—'}
        </div>
      </div>

      <div className="justify-self-end">
        {job.status === 'red' ? (
          <span
            className="rounded-full px-3.5 py-2 text-xs font-bold"
            style={{
              background: 'rgba(248,113,113,0.10)',
              border: '1px solid rgba(248,113,113,0.35)',
              color: '#F87171',
            }}
          >
            BLOQUEADA
          </span>
        ) : (
          <a
            href={job.url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-${job.status === 'green' ? 'primary' : 'secondary'} sm`}
            style={!job.url ? { pointerEvents: 'none', opacity: 0.5 } : {}}
          >
            {job.status === 'green' ? 'Aplicar' : 'Ver'}
          </a>
        )}
      </div>
    </div>
  )
}

/** @param {{ label: string, count: number, active: boolean, onClick: () => void, dot?: string }} props */
export function FilterChip({ label, count, active, onClick, dot }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-all duration-200"
      style={{
        background: active ? 'var(--grad-brand)' : 'rgba(168,85,247,0.08)',
        border: `1px solid ${active ? 'transparent' : 'rgba(168,85,247,0.25)'}`,
        color: active ? '#fff' : 'var(--fg-2)',
        boxShadow: active ? '0 8px 22px rgba(124,58,237,0.40)' : 'none',
      }}
    >
      {dot && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: dot, boxShadow: `0 0 8px ${dot}` }}
        />
      )}
      {label}
      <span
        className="rounded-full px-2 py-0.5 text-[11px] font-bold"
        style={{
          background: active ? 'rgba(13,13,13,0.30)' : 'rgba(255,255,255,0.06)',
          color: active ? '#fff' : 'var(--fg-3)',
        }}
      >
        {count}
      </span>
    </button>
  )
}
