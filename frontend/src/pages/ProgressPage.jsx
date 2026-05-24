import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Target, Mic } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SiteHeader from '../components/layout/SiteHeader'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import PlanTimeline from '../components/progress/PlanTimeline'
import ProgressOverview from '../components/progress/ProgressOverview'
import TaskList from '../components/progress/TaskList'
import ProgressDataSourceBanner from '../components/progress/ProgressDataSourceBanner'
import { useProfileStore } from '../store/useProfileStore'
import { useProgressStore } from '../store/useProgressStore'
import { useInterviewStore } from '../store/useInterviewStore'
import { useAuth } from '../hooks/useAuth'
import ProtectedRoute from '../components/auth/ProtectedRoute'

function ProgressInterviewCTA() {
  const history = useInterviewStore((s) => s.history)
  const fetchHistory = useInterviewStore((s) => s.fetchHistory)
  const { user } = useAuth()

  useEffect(() => {
    void fetchHistory(user?.id)
  }, [fetchHistory, user?.id])

  const count = history.length

  return (
    <section className="card-dl anim-in-delay-4 mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[color:var(--fg-1)]">
          <Mic className="h-4 w-4 text-[color:var(--brand-pink)]" aria-hidden />
          <h2 className="m-0 font-[family-name:var(--font-display)] text-lg font-bold">
            Practica con IA
          </h2>
        </div>
        <p className="m-0 text-sm text-[color:var(--fg-2)]">
          Simula entrevistas técnicas por skill y recibe feedback inmediato.
        </p>
        <p className="mt-1.5 m-0 text-xs text-[color:var(--fg-3)]">
          {count === 0
            ? 'Aún no has realizado entrevistas de práctica.'
            : `${count} entrevista${count === 1 ? '' : 's'} en tu historial.`}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <Link to="/entrevistas">
          <Button variant="primary">Iniciar entrevista</Button>
        </Link>
        {count > 0 && (
          <Link
            to="/entrevistas"
            className="text-center text-xs font-medium text-[color:var(--brand-violet)] hover:underline sm:text-right"
          >
            Ver historial →
          </Link>
        )}
      </div>
    </section>
  )
}

function ProgressPageContent() {
  const savedProfile = useProfileStore((s) => s.savedProfile)
  const plan = useProfileStore((s) => s.plan)
  const progress = useProgressStore((s) => s.progress)
  const loading = useProgressStore((s) => s.loading)
  const error = useProgressStore((s) => s.error)
  const dataSource = useProgressStore((s) => s.dataSource)
  const dataSourceDetail = useProgressStore((s) => s.dataSourceDetail)
  const fetchProgress = useProgressStore((s) => s.fetchProgress)
  const initProgressAction = useProgressStore((s) => s.initProgress)

  useEffect(() => {
    void (async () => {
      const data = await fetchProgress()
      if (!data?.tasks?.length) {
        await initProgressAction()
      }
    })()
  }, [fetchProgress, initProgressAction])

  const firstName = savedProfile?.nombre?.split(' ')[0] ?? 'Explorador'

  return (
    <PageShell>
      <SiteHeader />

      <main className="relative z-[1] flex-1 pb-28 pt-14">
        <Container className="max-w-[1100px]">
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

          <ProgressDataSourceBanner dataSource={dataSource} detail={dataSourceDetail} />

          {progress && (
            <>
              <div className="anim-in-delay-1">
                <ProgressOverview progress={progress} />
              </div>

              <div className="progress-workspace anim-in-delay-3">
                <TaskList />
                <PlanTimeline />
              </div>

              <ProgressInterviewCTA />
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
