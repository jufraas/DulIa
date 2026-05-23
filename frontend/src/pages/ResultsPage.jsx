import { Link, Navigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SiteFooter from '../components/layout/SiteFooter'
import MarketThermometer from '../components/results/MarketThermometer'
import OpportunitiesList from '../components/results/OpportunitiesList'
import PdfDownloadCard from '../components/results/PdfDownloadCard'
import ProfileSummary from '../components/results/ProfileSummary'
import ResultsBottomCta from '../components/results/ResultsBottomCta'
import ResultsHeader from '../components/results/ResultsHeader'
import ResultsHeroTitle from '../components/results/ResultsHeroTitle'
import ScoreCard from '../components/results/ScoreCard'
import UserProfileCard from '../components/results/UserProfileCard'
import PrivacyNotice from '../components/shared/PrivacyNotice'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import { usePdfDownload } from '../hooks/usePdfDownload'
import { useResultsData } from '../hooks/useResultsData'
import { useProfileStore } from '../store/useProfileStore'

export default function ResultsPage() {
  const apiUsesMock = useProfileStore((s) => s.apiUsesMock)
  const { savedProfile, jobs, market, loading, topScore, topJob } = useResultsData()
  const { downloading, downloadPdf } = usePdfDownload()

  if (!savedProfile) {
    return <Navigate to="/comenzar" replace />
  }

  const profileLabel = topJob?.titulo ?? savedProfile.carrera ?? 'Tu perfil'

  return (
    <PageShell>
      <ResultsHeader />

      <main className="relative z-[1] flex-1 pb-24 pt-10 sm:pt-14">
        <Container>
          {apiUsesMock && (
            <p
              className="anim-in mb-6 rounded-[14px] px-4 py-2 text-center text-xs text-[color:var(--violet-200)]"
              style={{
                border: '1px dashed rgba(168,85,247,0.35)',
                background: 'rgba(168,85,247,0.08)',
              }}
            >
              Backend en modo mock — vacantes y mercado pueden ser datos de ejemplo
            </p>
          )}

          <ResultsHeroTitle name={savedProfile.nombre} />

          <div className="anim-in-delay-1 mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <ScoreCard score={topScore} profileLabel={profileLabel} />

            <div className="flex flex-col gap-4">
              <ProfileSummary
                profile={savedProfile}
                topScore={topScore}
                topJobTitle={topJob?.titulo}
              />
              <PdfDownloadCard onDownload={downloadPdf} downloading={downloading} />
            </div>
          </div>

          <div className="anim-in-delay-2 grid gap-6 lg:grid-cols-2">
            <OpportunitiesList jobs={jobs} />
            <MarketThermometer market={market} />
          </div>

          {loading && (
            <p className="anim-in-delay-2 mt-4 text-center text-sm text-[color:var(--fg-3)]">
              Actualizando vacantes y mercado…
            </p>
          )}

          <div className="anim-in-delay-3 mt-8">
            <UserProfileCard profile={savedProfile} />
          </div>

          <PrivacyNotice className="anim-in-delay-3 mt-6" />

          <ResultsBottomCta onDownload={downloadPdf} downloading={downloading} />

          <div className="mt-10 text-center">
            <Link to="/">
              <Button
                variant="ghost"
                iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
              >
                Volver al inicio
              </Button>
            </Link>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </PageShell>
  )
}
