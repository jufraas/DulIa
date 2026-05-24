import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, CheckCircle2, Loader2, Target } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SiteHeader from '../components/layout/SiteHeader'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { useProfileStore } from '../store/useProfileStore'
import { filterProgressTasks, useProgressStore } from '../store/useProgressStore'
import ProtectedRoute from '../components/auth/ProtectedRoute'

function ProgressPageContent() {
  const savedProfile = useProfileStore((s) => s.savedProfile)
  const plan = useProfileStore((s) => s.plan)
  const progress = useProgressStore((s) => s.progress)
  const loading = useProgressStore((s) => s.loading)
  const error = useProgressStore((s) => s.error)
  const taskFilter = useProgressStore((s) => s.taskFilter)
  const togglingTaskId = useProgressStore((s) => s.togglingTaskId)
  const fetchProgress = useProgressStore((s) => s.fetchProgress)
  const initProgressAction = useProgressStore((s) => s.initProgress)
  const setTaskFilter = useProgressStore((s) => s.setTaskFilter)
  const toggleTask = useProgressStore((s) => s.toggleTask)

  useEffect(() => {
    void (async () => {
      const data = await fetchProgress()
      if (!data?.tasks?.length) {
        await initProgressAction()
      }
    })()
  }, [fetchProgress, initProgressAction])

  const firstName = savedProfile?.nombre?.split(' ')[0] ?? 'Explorador'
  const filteredTasks = progress
    ? filterProgressTasks(progress.tasks, taskFilter, progress.current_day)
    : []

  const filters = [
    { id: /** @type {const} */ ('week'), label: 'Esta semana' },
    { id: /** @type {const} */ ('pending'), label: 'Pendientes' },
    { id: /** @type {const} */ ('completed'), label: 'Completadas' },
  ]

  return (
    <PageShell>
      <SiteHeader />

      <main className="relative z-[1] flex-1 pb-28 pt-14">
        <Container className="max-w-[960px]">
          <div className="anim-in mb-8">
            <div className="eyebrow-dl mb-3">
              <Target className="h-3.5 w-3.5" aria-hidden />
              Mi progreso · DulIA
            </div>
            <h1
              className="m-0 font-[family-name:var(--font-display)] font-extrabold leading-[1.1] tracking-[-0.025em] text-[color:var(--fg-1)]"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}
            >
              Hola, {firstName}
            </h1>
            <p className="body mt-2 text-[color:var(--fg-2)]">
              Sigue tu plan de acción y marca lo que ya completaste.
            </p>
          </div>

          {loading && !progress && (
            <p className="flex items-center gap-2 text-sm text-[color:var(--fg-3)]">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Cargando tu progreso…
            </p>
          )}

          {error && (
            <p className="mb-4 text-sm text-[color:var(--danger)]" role="alert">
              {error}
            </p>
          )}

          {progress && (
            <>
              <div className="anim-in-delay-1 card-dl mb-6 grid gap-4 p-6 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--fg-3)]">
                    Progreso global
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--fg-1)]">
                    {progress.global_pct}%
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--fg-3)]">
                    Día del plan
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--fg-1)]">
                    {progress.current_day}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--fg-3)]">
                    Próximo hito
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[color:var(--fg-2)]">
                    {progress.next_milestone
                      ? `Día ${progress.next_milestone.dia}: ${progress.next_milestone.logro}`
                      : 'Completa tareas de la fase actual'}
                  </p>
                </div>
              </div>

              <div className="anim-in-delay-2 card-dl mb-6 p-6">
                <div className="eyebrow-dl mb-4">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  Fases del plan
                </div>
                <div className="flex flex-col gap-3">
                  {progress.phases.map((phase) => (
                    <div key={phase.phase}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-[color:var(--fg-2)]">
                          Fase {phase.phase} días
                          {phase.locked ? ' · Bloqueada' : ''}
                        </span>
                        <span className="font-semibold text-[color:var(--fg-1)]">{phase.pct}%</span>
                      </div>
                      <div
                        className="h-2 overflow-hidden rounded-full"
                        style={{ background: 'rgba(168,85,247,0.15)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${phase.pct}%`,
                            background: 'var(--grad-brand)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="anim-in-delay-3 card-dl p-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setTaskFilter(filter.id)}
                      className="rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200"
                      style={
                        taskFilter === filter.id
                          ? {
                              background: 'var(--grad-brand)',
                              color: '#fff',
                            }
                          : {
                              background: 'rgba(168,85,247,0.08)',
                              border: '1px solid rgba(168,85,247,0.25)',
                              color: 'var(--fg-2)',
                            }
                      }
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {filteredTasks.map((task) => {
                    const locked = progress.phases.find((p) => p.phase === task.phase)?.locked
                    return (
                      <li key={task.id}>
                        <label
                          className={`flex cursor-pointer items-start gap-3 rounded-[14px] px-3 py-2.5 ${
                            locked && !task.completed ? 'opacity-60' : ''
                          }`}
                          style={{
                            border: '1px solid rgba(168,85,247,0.20)',
                            background: 'rgba(168,85,247,0.06)',
                          }}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 shrink-0 accent-[#8B5CF6]"
                            checked={task.completed}
                            disabled={Boolean(locked && !task.completed) || togglingTaskId === task.id}
                            onChange={() => void toggleTask(task.id)}
                          />
                          <span className="min-w-0 flex-1 text-sm text-[color:var(--fg-1)]">
                            {task.label}
                            <span className="ml-2 text-xs text-[color:var(--fg-3)]">
                              Fase {task.phase}
                            </span>
                          </span>
                          {task.completed && (
                            <CheckCircle2
                              className="h-4 w-4 shrink-0 text-[color:var(--success,#34d399)]"
                              aria-hidden
                            />
                          )}
                        </label>
                      </li>
                    )
                  })}
                  {filteredTasks.length === 0 && (
                    <li className="py-4 text-center text-sm text-[color:var(--fg-3)]">
                      No hay tareas en este filtro.
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}

          {!loading && !progress && !plan && (
            <div className="card-dl p-6">
              <p className="text-sm text-[color:var(--fg-2)]">
                Aún no tienes un plan de acción. Completa el wizard para generarlo.
              </p>
              <Link to="/comenzar" className="mt-4 inline-block">
                <Button variant="primary">Ir a comenzar</Button>
              </Link>
            </div>
          )}
        </Container>
      </main>
    </PageShell>
  )
}

export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <ProgressPageContent />
    </ProtectedRoute>
  )
}
