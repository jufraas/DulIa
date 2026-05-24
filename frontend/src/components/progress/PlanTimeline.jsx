import { useState } from 'react'
import { Calendar, Check, Loader2, Lock } from 'lucide-react'
import { findProgressTaskByLabel } from '../../mocks/mockProgress'
import { useProfileStore } from '../../store/useProfileStore'
import { useProgressStore } from '../../store/useProgressStore'
import { planPhaseToDisplay, planToDisplayWeeks } from '../../utils/planDisplay'
import { ActivePhaseProgressStrip } from './ProgressOverview'
import PhaseLockOverlay from './PhaseLockOverlay'

const TABS = [
  { id: '30', label: '30 días' },
  { id: '60', label: '60 días' },
  { id: '90', label: '90 días' },
]

const TAB_PHASE_LABELS = {
  30: 'Progreso fase 30 días',
  60: 'Progreso fase 60 días',
  90: 'Progreso fase 90 días',
}

/**
 * @param {import('../../mocks/mockProgress').PlanPhase} phase
 */
function phaseLockMessage(phase, threshold) {
  if (phase === '60') return `Completa ${threshold}% de la fase 30 para desbloquear.`
  if (phase === '90') return `Completa ${threshold}% de la fase 60 para desbloquear.`
  return ''
}

/** Timeline 30-60-90 con tareas checkeables — solo en `/progreso`. */
export default function PlanTimeline() {
  const plan = useProfileStore((s) => s.plan)
  const progress = useProgressStore((s) => s.progress)
  const togglingTaskId = useProgressStore((s) => s.togglingTaskId)
  const toggleTask = useProgressStore((s) => s.toggleTask)
  const [activeTab, setActiveTab] = useState('30')

  if (!progress) return null

  const weeks = planToDisplayWeeks(plan)
  const phase60 = planPhaseToDisplay(plan?.fase_60)
  const phase90 = planPhaseToDisplay(plan?.fase_90)
  const milestones = Array.isArray(plan?.milestones) ? plan.milestones : []
  const recursos = Array.isArray(plan?.recursos_recomendados) ? plan.recursos_recomendados : []
  const threshold = progress.unlock_threshold_pct

  const phaseMeta = (phase) => progress.phases.find((p) => p.phase === phase)
  const isPhaseLocked = (phase) => Boolean(phaseMeta(phase)?.locked)

  const hasContent = weeks.length > 0 || phase60 || phase90

  if (!hasContent) {
    return (
      <div className="card-dl p-7">
        <div className="eyebrow-dl">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          Tu plan de acción
        </div>
        <p className="mt-3 text-[15px] text-[color:var(--fg-2)]">
          No hay tareas en tu plan todavía. Completa el wizard para generarlo.
        </p>
      </div>
    )
  }

  return (
    <div className="card-dl flex flex-col overflow-hidden p-0">
      <div className="shrink-0 border-b border-[rgba(168,85,247,0.12)] px-7 pb-4 pt-7">
        <div className="eyebrow-dl">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          Tu plan de acción
        </div>
        {plan?.resumen_ejecutivo && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[color:var(--fg-2)]">
            {plan.resumen_ejecutivo}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const tabLocked = tab.id !== '30' && isPhaseLocked(tab.id)
            return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200"
              aria-disabled={tabLocked || undefined}
              style={
                activeTab === tab.id
                  ? {
                      background: 'var(--grad-brand)',
                      color: '#fff',
                      boxShadow: '0 8px 22px rgba(124,58,237,0.40)',
                    }
                  : {
                      background: 'rgba(168,85,247,0.08)',
                      border: '1px solid rgba(168,85,247,0.25)',
                      color: 'var(--fg-2)',
                    }
              }
            >
              {tabLocked && <Lock className="h-3 w-3 shrink-0 opacity-80" aria-hidden />}
              {tab.label}
            </button>
            )
          })}
        </div>

        <ActivePhaseProgressStrip
          phase={phaseMeta(activeTab)}
          label={TAB_PHASE_LABELS[activeTab] ?? `Fase ${activeTab}`}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-7 py-5">
        {activeTab === '30' && (
          <div id="timeline-phase-30">
            <h3 className="mb-5 text-[22px] font-bold tracking-[-0.015em] text-[color:var(--fg-1)]">
              Una cosa a la vez. <span className="brand-text">Tú puedes.</span>
            </h3>
            <div className="flex flex-col gap-3.5">
              {weeks.map((w, i) => {
                const weekNum = Number(String(w.w).replace(/\D/g, '')) || i + 1
                return (
                  <TimelineWeekBlock
                    key={`${w.w}-${w.title}`}
                    index={i}
                    week={w}
                    weekNum={weekNum}
                    progressTasks={progress.tasks}
                    togglingTaskId={togglingTaskId}
                    onToggle={(taskId) => void toggleTask(taskId)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {activeTab === '60' && (
          <PhaseLockOverlay
            locked={isPhaseLocked('60')}
            message={phaseLockMessage('60', threshold)}
          >
            <TimelinePhaseBlock
              phaseId="timeline-phase-60"
              phaseKey="60"
              phase={phase60}
              locked={isPhaseLocked('60')}
              emptyMessage="La fase de 60 días se generará cuando el backend complete tu plan."
              progressTasks={progress.tasks}
              togglingTaskId={togglingTaskId}
              onToggle={(taskId) => void toggleTask(taskId)}
            />
          </PhaseLockOverlay>
        )}

        {activeTab === '90' && (
          <PhaseLockOverlay
            locked={isPhaseLocked('90')}
            message={phaseLockMessage('90', threshold)}
          >
            <div id="timeline-phase-90">
              <TimelinePhaseBlock
                phaseKey="90"
                phase={phase90}
                locked={isPhaseLocked('90')}
                emptyMessage="La fase de 90 días se generará cuando el backend complete tu plan."
                progressTasks={progress.tasks}
                togglingTaskId={togglingTaskId}
                onToggle={(taskId) => void toggleTask(taskId)}
              />
              {milestones.length > 0 && (
              <div className="mt-6 border-t border-[rgba(168,85,247,0.15)] pt-5">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-[color:var(--violet-200)]">
                  Hitos clave
                </h4>
                <ul className="m-0 list-none space-y-2 p-0">
                  {milestones.map((m) => {
                    if (!m || typeof m !== 'object') return null
                    const ms = /** @type {Record<string, unknown>} */ (m)
                    return (
                      <li
                        key={String(ms.dia ?? ms.logro)}
                        className="text-[13px] text-[color:var(--fg-2)]"
                      >
                        <strong className="text-[color:var(--fg-1)]">Día {ms.dia}:</strong>{' '}
                        {String(ms.logro ?? '')}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {recursos.length > 0 && (
              <div className="mt-6 border-t border-[rgba(168,85,247,0.15)] pt-5">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-[color:var(--violet-200)]">
                  Recursos recomendados
                </h4>
                <ul className="m-0 list-none space-y-2 p-0">
                  {recursos.map((r) => {
                    if (!r || typeof r !== 'object') return null
                    const rec = /** @type {Record<string, unknown>} */ (r)
                    return (
                      <li
                        key={String(rec.nombre ?? rec.tipo)}
                        className="rounded-xl p-3 text-[13px]"
                        style={{
                          background: 'var(--bg-1)',
                          border: '1px solid rgba(168,85,247,0.15)',
                        }}
                      >
                        <strong className="text-[color:var(--fg-1)]">
                          {String(rec.nombre ?? rec.tipo ?? 'Recurso')}
                        </strong>
                        {rec.descripcion && (
                          <p className="mb-0 mt-1 text-[color:var(--fg-3)]">
                            {String(rec.descripcion)}
                          </p>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            </div>
          </PhaseLockOverlay>
        )}
      </div>
    </div>
  )
}

/**
 * @param {{
 *   index: number,
 *   weekNum: number,
 *   week: { w: string, title: string, tasks: string[] },
 *   progressTasks: import('../../mocks/mockProgress').ProgressTask[],
 *   togglingTaskId: string | null,
 *   onToggle: (taskId: string) => void,
 * }} props
 */
function TimelineWeekBlock({ index, weekNum, week, progressTasks, togglingTaskId, onToggle }) {
  return (
    <div id={`timeline-week-${weekNum}`} className="flex gap-3.5">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-[family-name:var(--font-display)] text-[15px] font-extrabold text-white"
        style={{
          background: index === 0 ? 'var(--grad-cta)' : 'var(--grad-brand)',
          boxShadow:
            index === 0
              ? '0 8px 22px rgba(236,72,153,0.40)'
              : '0 6px 16px rgba(124,58,237,0.30)',
        }}
      >
        {index + 1}
      </div>
      <div className="min-w-0 flex-1 pb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[15px] font-bold text-[color:var(--fg-1)]">{week.title}</span>
          <span className="text-[11px] font-semibold text-[color:var(--fg-3)]">{week.w}</span>
        </div>
        <InteractiveTaskList
          phase="30"
          labels={week.tasks}
          progressTasks={progressTasks}
          togglingTaskId={togglingTaskId}
          onToggle={onToggle}
        />
      </div>
    </div>
  )
}

/**
 * @param {{
 *   phaseId?: string,
 *   phaseKey: import('../../mocks/mockProgress').PlanPhase,
 *   phase: import('../../utils/planDisplay').PlanPhaseDisplay | null,
 *   locked: boolean,
 *   emptyMessage: string,
 *   progressTasks: import('../../mocks/mockProgress').ProgressTask[],
 *   togglingTaskId: string | null,
 *   onToggle: (taskId: string) => void,
 * }} props
 */
function TimelinePhaseBlock({
  phaseId,
  phaseKey,
  phase,
  locked,
  emptyMessage,
  progressTasks,
  togglingTaskId,
  onToggle,
}) {
  if (!phase) {
    return <p className="text-[15px] text-[color:var(--fg-2)]">{emptyMessage}</p>
  }

  return (
    <div id={phaseId} className="relative">
      <h3 className="mb-2 text-[20px] font-bold text-[color:var(--fg-1)]">{phase.title}</h3>
      {phase.objetivo && (
        <p className="mb-4 text-[14px] leading-relaxed text-[color:var(--fg-2)]">
          {phase.objetivo}
        </p>
      )}
      <InteractiveTaskList
        phase={phaseKey}
        labels={phase.tasks}
        progressTasks={progressTasks}
        togglingTaskId={togglingTaskId}
        locked={locked}
        onToggle={onToggle}
      />
      {phase.metricas.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
            Métricas de éxito
          </h4>
          <ul className="m-0 list-none space-y-1 p-0 text-[13px] text-[color:var(--fg-2)]">
            {phase.metricas.map((m) => (
              <li key={m} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#34D399]" aria-hidden />
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * @param {{
 *   phase: import('../../mocks/mockProgress').PlanPhase,
 *   labels: string[],
 *   progressTasks: import('../../mocks/mockProgress').ProgressTask[],
 *   togglingTaskId: string | null,
 *   locked?: boolean,
 *   onToggle: (taskId: string) => void,
 * }} props
 */
function InteractiveTaskList({
  phase,
  labels,
  progressTasks,
  togglingTaskId,
  locked = false,
  onToggle,
}) {
  if (!labels.length) {
    return (
      <p className="mt-2 text-[13px] text-[color:var(--fg-3)]">
        Sin tareas definidas para esta fase.
      </p>
    )
  }

  return (
    <ul className="mt-2 list-none space-y-1.5 p-0">
      {labels.map((label) => {
        const task = findProgressTaskByLabel(progressTasks, phase, label)
        const completed = task?.completed ?? false
        const taskId = task?.id
        const isToggling = taskId != null && togglingTaskId === taskId
        const disabled = !taskId || (locked && !completed) || isToggling

        return (
          <li key={`${phase}-${label}`}>
            <label
              className={`flex cursor-pointer items-start gap-2.5 rounded-lg px-1 py-1 ${
                disabled && !completed ? 'cursor-not-allowed opacity-60' : ''
              } ${completed ? 'opacity-80' : ''}`}
            >
              <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                {isToggling ? (
                  <Loader2
                    className="h-4 w-4 animate-spin text-[color:var(--violet-400)]"
                    aria-hidden
                  />
                ) : (
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#8B5CF6]"
                    checked={completed}
                    disabled={disabled}
                    onChange={() => {
                      if (taskId) onToggle(taskId)
                    }}
                  />
                )}
              </span>
              <span
                className={`min-w-0 flex-1 text-[13px] leading-relaxed ${
                  completed
                    ? 'text-[color:var(--fg-3)] line-through decoration-[color:var(--fg-3)]'
                    : 'text-[color:var(--fg-2)]'
                }`}
              >
                {label}
              </span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}
