import { Navigate } from 'react-router-dom'
import { Download, Sparkles } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SiteHeader from '../components/layout/SiteHeader'
import MarketThermometer from '../components/results/MarketThermometer'
import OpportunitiesPreview from '../components/results/OpportunitiesPreview'
import PdfDownloadCard from '../components/results/PdfDownloadCard'
import ProfileSummary from '../components/results/ProfileSummary'
import RadarMatch from '../components/results/RadarMatch'
import ScoreCard from '../components/results/ScoreCard'
import ThirtyDayPlan from '../components/results/ThirtyDayPlan'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import SessionLoading from '../components/shared/SessionLoading'
import { usePdfDownload } from '../hooks/usePdfDownload'
import { useResultsData } from '../hooks/useResultsData'
import { useSessionHydration } from '../hooks/useSessionHydration'

/** Pantalla 03 — Resultados (kit ReBrand) */
export default function ResultsPage() {
  const { ready } = useSessionHydration()
  const { savedProfile, jobs, market, loading, topScore, topJob, radar, insights } =
    useResultsData()
  const { downloading, downloadPdf } = usePdfDownload()

  if (!ready) {
    return <SessionLoading />
  }

  if (!savedProfile) {
    return <Navigate to="/comenzar" replace />
  }

  return (
    <PageShell>
      <SiteHeader />

      <main className="relative z-[1] flex-1 pb-28 pt-14">
        <Container>
          <div className="anim-in mb-12 text-center">
            <div className="eyebrow-dl mb-3.5 inline-flex">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Análisis listo
            </div>
            <h1
              className="m-0 font-[family-name:var(--font-display)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[color:var(--fg-1)]"
              style={{ fontSize: 'clamp(36px, 4.5vw, 60px)' }}
            >
              Vas mejor de lo que crees,
              <br />
              <span className="gradient-text">{savedProfile.nombre?.split(' ')[0] ?? 'parcero'}</span>.
            </h1>
          </div>

          <div className="anim-in-delay-1 mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <ScoreCard score={topScore} comparativa={insights?.comparativa} />
            <div className="flex flex-col gap-4">
              <ProfileSummary
                profile={savedProfile}
                topScore={topScore}
                topJobTitle={topJob?.titulo}
                insights={insights}
              />
              <PdfDownloadCard onDownload={downloadPdf} downloading={downloading} />
            </div>
          </div>

          <div className="anim-in-delay-2 grid gap-6">
            <MarketThermometer market={market} />
            <div className="grid gap-6 lg:grid-cols-2">
              <OpportunitiesPreview jobs={jobs} />
              <ThirtyDayPlan />
            </div>
          </div>

          {loading && (
            <p className="anim-in-delay-2 mt-4 text-center text-sm text-[color:var(--fg-3)]">
              Actualizando vacantes…
            </p>
          )}

          <RadarMatch profile={savedProfile} jobs={jobs} radar={radar} />

          <div
            className="anim-in-delay-3 mt-12 flex flex-col items-center justify-between gap-6 rounded-[24px] p-9 sm:flex-row"
            style={{
              background:
                'linear-gradient(135deg, rgba(236,72,153,0.14) 0%, rgba(124,58,237,0.10) 100%)',
              border: '1px solid rgba(236,72,153,0.35)',
            }}
          >
            <div>
              <h3 className="m-0 text-2xl font-extrabold tracking-[-0.015em] text-[color:var(--fg-1)]">
                Llévate tu plan completo
              </h3>
              <p className="mt-2 text-[15px] text-[color:var(--fg-2)]">
                Tu score, perfil y plan de 30 días en un PDF que puedes compartir.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              iconLeft={<Download className="h-5 w-5" aria-hidden />}
              onClick={downloadPdf}
              disabled={downloading}
            >
              Descargar mi plan
            </Button>
          </div>
        </Container>
      </main>
    </PageShell>
  )
}
