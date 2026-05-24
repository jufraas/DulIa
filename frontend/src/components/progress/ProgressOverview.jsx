import { Calendar, Lock, Target } from 'lucide-react'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'
import { useProgressBarWidth } from '../../hooks/useProgressBarWidth'

/**
 * @param {{
 *   pct: number,
 *   label: string,
 *   locked?: boolean,
 *   className?: string,
 * }} props
 */
function ProgressBar({ pct, label, locked = false, className = '' }) {
  const width = useProgressBarWidth(pct)

  return (
    <div
      className={`progress-bar-track ${className}`.trim()}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={`progress-bar-fill${locked ? ' progress-bar-fill--locked' : ''}`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

/**
 * @param {{ pct: number, label: string, locked?: boolean }} props
 */
function PhaseProgressBar({ pct, label, locked = false }) {
  const animatedPct = useAnimatedNumber(pct, { duration: 700 })

  return (
    <div className="progress-phase">
      <div className="progress-phase__head">
        <span className="progress-phase__label">
          {locked && <Lock className="progress-phase__lock" aria-hidden />}
          {label}
          {locked ? ' · Bloqueada' : ''}
        </span>
        <span className="progress-phase__pct">{animatedPct}%</span>
      </div>
      <ProgressBar pct={pct} label={label} locked={locked} />
    </div>
  )
}
/**
 * Resumen de progreso: barra global animada + stats + barras por fase.
 * @param {{ progress: import('../../mocks/mockProgress').ProgressState }} props
 */
export default function ProgressOverview({ progress }) {
  const globalPct = useAnimatedNumber(progress.global_pct, { duration: 800 })
  const globalWidth = useProgressBarWidth(progress.global_pct)

  const phaseLabels = {
    30: 'Fase 30 días',
    60: 'Fase 60 días',
    90: 'Fase 90 días',
  }

  return (
    <div className="progress-overview">
      <div className="card-dl progress-overview__global p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow-dl mb-2">
              <Target className="h-3.5 w-3.5" aria-hidden />
              Progreso global
            </div>
            <p className="progress-overview__global-value">{globalPct}%</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-8">
            <div>
              <p className="progress-overview__stat-label">Día del plan</p>
              <p className="progress-overview__stat-value">{progress.current_day}</p>
            </div>
            <div className="max-w-[220px]">
              <p className="progress-overview__stat-label">Próximo hito</p>
              <p className="progress-overview__milestone">
                {progress.next_milestone
                  ? `Día ${progress.next_milestone.dia}: ${progress.next_milestone.logro}`
                  : 'Completa tareas de la fase actual'}
              </p>
            </div>
          </div>
        </div>

        <div
          className="progress-bar-track progress-bar-track--lg mt-5"
          role="progressbar"
          aria-valuenow={progress.global_pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso global del plan"
        >
          <div
            className="progress-bar-fill progress-bar-fill--global"
            style={{ width: `${globalWidth}%` }}
          />
        </div>
        <p className="progress-overview__hint mt-2">
          {progress.phases.reduce((n, p) => n + p.completed_count, 0)} de{' '}
          {progress.tasks.length} tareas completadas
        </p>
      </div>

      <div className="card-dl progress-overview__phases p-6">
        <div className="eyebrow-dl mb-4">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          Fases del plan
        </div>
        <div className="flex flex-col gap-4">
          {progress.phases.map((phase) => (
            <PhaseProgressBar
              key={phase.phase}
              pct={phase.pct}
              label={phaseLabels[phase.phase] ?? `Fase ${phase.phase}`}
              locked={phase.locked}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Barra compacta de la fase activa (dentro del timeline).
 * @param {{ phase: import('../../mocks/mockProgress').PhaseProgress | undefined, label: string }} props
 */
export function ActivePhaseProgressStrip({ phase, label }) {
  const pct = phase?.pct ?? 0
  const animatedPct = useAnimatedNumber(pct, { duration: 500, enabled: Boolean(phase) })
  const width = useProgressBarWidth(pct)

  if (!phase) return null

  return (
    <div className="progress-phase-strip">
      <div className="progress-phase-strip__head">
        <span className="progress-phase-strip__label">
          {phase.locked && <Lock className="h-3 w-3 shrink-0" aria-hidden />}
          {label}
        </span>
        <span className="progress-phase-strip__pct">{animatedPct}%</span>
      </div>
      <div
        className="progress-bar-track progress-bar-track--sm"
        role="progressbar"
        aria-valuenow={phase.pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`progress-bar-fill${phase.locked ? ' progress-bar-fill--locked' : ''}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="progress-phase-strip__meta">
        {phase.completed_count}/{phase.total_count} tareas
      </p>
    </div>
  )
}
