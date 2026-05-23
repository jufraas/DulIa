import { useState } from 'react'
import { Calendar, Check } from 'lucide-react'
import { useProfileStore } from '../../store/useProfileStore'
import { planPhaseToDisplay, planToDisplayWeeks } from '../../utils/planDisplay'

const TABS = [
  { id: '30', label: '30 días' },
  { id: '60', label: '60 días' },
  { id: '90', label: '90 días' },
]

/** Plan de acción 30-60-90 — POST /api/profile/{id}/action-plan */
export default function ThirtyDayPlan() {
  const plan = useProfileStore((s) => s.plan)
  const [activeTab, setActiveTab] = useState('30')

  const weeks = planToDisplayWeeks(plan)
  const phase60 = planPhaseToDisplay(plan?.fase_60)
  const phase90 = planPhaseToDisplay(plan?.fase_90)
  const milestones = Array.isArray(plan?.milestones) ? plan.milestones : []
  const recursos = Array.isArray(plan?.recursos_recomendados) ? plan.recursos_recomendados : []

  const hasContent = weeks.length > 0 || phase60 || phase90

  if (!hasContent) {
    return (
      <div className="card-dl p-7">
        <div className="eyebrow-dl">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          Tu plan de acción
        </div>
        <p className="mt-3 text-[15px] text-[color:var(--fg-2)]">
          Generando tu plan personalizado…
        </p>
      </div>
    )
  }

  return (
    <div className="card-dl p-7">
      <div className="eyebrow-dl">
        <Calendar className="h-3.5 w-3.5" aria-hidden />
        Tu plan de acción
      </div>
      {plan?.resumen_ejecutivo && (
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--fg-2)]">
          {plan.resumen_ejecutivo}
        </p>
      )}

      <div className="mb-5 mt-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200"
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
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === '30' && (
        <>
          <h3 className="mb-5 text-[22px] font-bold tracking-[-0.015em] text-[color:var(--fg-1)]">
            Una cosa a la vez. <span className="brand-text">Tú puedes.</span>
          </h3>
          <div className="flex flex-col gap-3.5">
            {weeks.map((w, i) => (
              <WeekBlock key={`${w.w}-${w.title}`} index={i} week={w} />
            ))}
          </div>
        </>
      )}

      {activeTab === '60' && (
        <PhaseBlock
          phase={phase60}
          emptyMessage="La fase de 60 días se generará cuando el backend complete tu plan."
        />
      )}

      {activeTab === '90' && (
        <>
          <PhaseBlock
            phase={phase90}
            emptyMessage="La fase de 90 días se generará cuando el backend complete tu plan."
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
                      {(rec.duracion || rec.costo_aprox) && (
                        <p className="mb-0 mt-1 text-[11px] text-[color:var(--fg-3)]">
                          {[rec.duracion, rec.costo_aprox].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/** @param {{ index: number, week: { w: string, title: string, tasks: string[] } }} props */
function WeekBlock({ index, week }) {
  return (
    <div className="flex gap-3.5">
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
      <div className="flex-1 pb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[15px] font-bold text-[color:var(--fg-1)]">{week.title}</span>
          <span className="text-[11px] font-semibold text-[color:var(--fg-3)]">{week.w}</span>
        </div>
        <TaskList tasks={week.tasks} />
      </div>
    </div>
  )
}

/** @param {{ phase: import('../../utils/planDisplay').PlanPhaseDisplay | null, emptyMessage: string }} props */
function PhaseBlock({ phase, emptyMessage }) {
  if (!phase) {
    return <p className="text-[15px] text-[color:var(--fg-2)]">{emptyMessage}</p>
  }

  return (
    <div>
      <h3 className="mb-2 text-[20px] font-bold text-[color:var(--fg-1)]">{phase.title}</h3>
      {phase.objetivo && (
        <p className="mb-4 text-[14px] leading-relaxed text-[color:var(--fg-2)]">
          {phase.objetivo}
        </p>
      )}
      <TaskList tasks={phase.tasks} />
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

/** @param {{ tasks: string[] }} props */
function TaskList({ tasks }) {
  if (!tasks.length) {
    return (
      <p className="mt-2 text-[13px] text-[color:var(--fg-3)]">
        Sin tareas definidas para esta fase.
      </p>
    )
  }

  return (
    <ul className="mt-2 list-none space-y-1.5 p-0 text-[13px] leading-relaxed text-[color:var(--fg-3)]">
      {tasks.map((t) => (
        <li key={t} className="flex items-center gap-2">
          <Check
            className="h-3.5 w-3.5 shrink-0 text-[color:var(--violet-400)]"
            strokeWidth={2.4}
            aria-hidden
          />
          {t}
        </li>
      ))}
    </ul>
  )
}
