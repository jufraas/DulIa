import { Navigate } from 'react-router-dom'
import { Download, Sparkles } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SiteHeader from '../components/layout/SiteHeader'
import CareerTimeline from '../components/results/CareerTimeline'
import CoachChatBubble from '../components/results/CoachChatBubble'
import CoachPromptBanner from '../components/results/CoachPromptBanner'
import MarketThermometer from '../components/results/MarketThermometer'
import OpportunitiesAndPlan from '../components/results/OpportunitiesAndPlan'
import PdfDownloadCard from '../components/results/PdfDownloadCard'
import ProfileSummary from '../components/results/ProfileSummary'
import RadarMatch from '../components/results/RadarMatch'
import ResultsSection from '../components/results/ResultsSection'
import ResultsSectionNav from '../components/results/ResultsSectionNav'
import ScoreCard from '../components/results/ScoreCard'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import SessionLoading from '../components/shared/SessionLoading'
import ProcessStatusBar from '../components/shared/ProcessStatusBar'
import { RESULTS_SECTION_IDS } from '../constants/resultsSections'
import { CoachProvider } from '../context/CoachProvider'
import { usePdfDownload } from '../hooks/usePdfDownload'
import { useResultsData } from '../hooks/useResultsData'
import { useResultsSectionNav } from '../hooks/useResultsSectionNav'
import { useSessionHydration } from '../hooks/useSessionHydration'

/** Pantalla 03 — Resultados (kit ReBrand) */
export default function ResultsPage() {
  const { ready } = useSessionHydration()
  const { savedProfile, jobs, market, loading, topScore, topJob, radar, insights } =
    useResultsData()
  const { downloading, downloadPdf } = usePdfDownload()
  const { activeId, scrollToSection } = useResultsSectionNav(RESULTS_SECTION_IDS)

  if (!ready) {
    return <SessionLoading />
  }

  if (!savedProfile) {
    return <Navigate to="/comenzar" replace />
  }

  return (
    <CoachProvider
      profile={savedProfile}
      topScore={topScore}
      topJob={topJob}
      insights={insights}
    >
      <PageShell>
        <SiteHeader />

        <main className="relative z-[1] flex-1 pb-28 pt-14">
          <Container>
            <div className="anim-in mb-10 text-center">
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
                <span className="gradient-text">
                  {savedProfile.nombre?.split(' ')[0] ?? 'parcero'}
                </span>
                .
              </h1>
            </div>

            <CoachPromptBanner />

            <div className="results-page-layout">
              <ResultsSectionNav activeId={activeId} onNavigate={scrollToSection} />

              <div className="results-page-sections min-w-0 flex-1">
                <ResultsSection id="resultados-analisis" className="anim-in-delay-1 mb-12">
                  <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
                    <div className="flex h-full min-h-0 flex-col gap-4 lg:min-h-[580px]">
                      <ScoreCard score={topScore} comparativa={insights?.comparativa} />
                      <PdfDownloadCard onDownload={downloadPdf} downloading={downloading} />
                    </div>
                    <div className="flex h-full min-h-0 flex-col lg:min-h-[580px]">
                      <ProfileSummary
                        profile={savedProfile}
                        topScore={topScore}
                        topJobTitle={topJob?.titulo}
                        insights={insights}
                        className="h-full flex-1"
                      />
                    </div>
                  </div>
                </ResultsSection>

                <ResultsSection id="resultados-mercado" className="anim-in-delay-2 mb-6">
                  <MarketThermometer market={market} />
                </ResultsSection>

                <ResultsSection id="resultados-oportunidades-plan" className="anim-in-delay-2 mb-6">
                  <OpportunitiesAndPlan jobs={jobs} />
                </ResultsSection>

                {loading && (
                  <p className="anim-in-delay-2 mb-4 text-center text-sm text-[color:var(--fg-3)]">
                    Actualizando vacantes…
                  </p>
                )}

                <RadarMatch profile={savedProfile} jobs={jobs} radar={radar} />

                <ResultsSection id="resultados-timeline" className="anim-in-delay-3 mt-6">
                  <CareerTimeline />
                </ResultsSection>

                <CoachChatBubble />

                <ResultsSection id="resultados-pdf" className="anim-in-delay-3 mt-12">
                  <div
                    className="flex flex-col items-center justify-between gap-6 rounded-[24px] p-9 sm:flex-row"
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
                        Score, análisis IA, plan, radar y vacantes en un PDF listo para compartir.
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
                </ResultsSection>
              </div>
            </div>
          </Container>
        </main>

        {downloading && (
          <ProcessStatusBar
            title="Generando tu PDF"
            message="Armando score, plan y vacantes en un solo archivo…"
          />
        )}
      </PageShell>
    </CoachProvider>
  )
}
