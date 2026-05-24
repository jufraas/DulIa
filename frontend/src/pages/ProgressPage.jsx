import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Target } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SiteHeader from '../components/layout/SiteHeader'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import PlanTimeline from '../components/progress/PlanTimeline'
import ProgressOverview from '../components/progress/ProgressOverview'
import { useProfileStore } from '../store/useProfileStore'
import { useProgressStore } from '../store/useProgressStore'
import ProtectedRoute from '../components/auth/ProtectedRoute'

function ProgressPageContent() {
  const savedProfile = useProfileStore((s) => s.savedProfile)
  const plan = useProfileStore((s) => s.plan)
  const progress = useProgressStore((s) => s.progress)
  const loading = useProgressStore((s) => s.loading)
  const error = useProgressStore((s) => s.error)
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
              <div className="anim-in-delay-1">
                <ProgressOverview progress={progress} />
              </div>

              <div className="anim-in-delay-3">
                <PlanTimeline />
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
