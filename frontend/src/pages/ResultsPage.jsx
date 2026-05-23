import { Link, Navigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import UserProfileCard from '../components/results/UserProfileCard'
import PageShell from '../components/layout/PageShell'
import SiteFooter from '../components/layout/SiteFooter'
import PrivacyNotice from '../components/shared/PrivacyNotice'
import OpportunitiesList from '../components/results/OpportunitiesList'
import PdfDownloadCard from '../components/results/PdfDownloadCard'
import ProfileSummary from '../components/results/ProfileSummary'
import ResultsBottomCta from '../components/results/ResultsBottomCta'
import ResultsHeader from '../components/results/ResultsHeader'
import ResultsHeroTitle from '../components/results/ResultsHeroTitle'
import RoadmapPlan from '../components/results/RoadmapPlan'
import ScoreCard from '../components/results/ScoreCard'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import { usePdfDownload } from '../hooks/usePdfDownload'
import { useProfileStore } from '../store/useProfileStore'
import { parseSkillsList } from '../utils/parseSkillsList'

export default function ResultsPage() {
  const result = useProfileStore((s) => s.result)
  const profile = useProfileStore((s) => s.profile)
  const cvFileName = useProfileStore((s) => s.cvFileName)
  const { downloading, downloadPdf } = usePdfDownload()

  if (!result) {
    return <Navigate to="/comenzar" replace />
  }

  const score = typeof result.score === 'number' ? result.score : Number(result.score) || 0
  const skills = parseSkillsList(profile?.skills)

  return (
    <PageShell>
      <ResultsHeader />

      <main className="relative z-[1] flex-1 pb-24 pt-10 sm:pt-14">
        <Container>
          <ResultsHeroTitle name={profile?.name} />

          <div className="anim-in-delay-1 mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <ScoreCard score={score} profileLabel={result.profile} />

            <div className="flex flex-col gap-4">
              <ProfileSummary
                profile={profile}
                result={result}
                score={score}
                skills={skills}
              />
              <PdfDownloadCard onDownload={downloadPdf} downloading={downloading} />
            </div>
          </div>

          <div className="anim-in-delay-2 grid gap-6 lg:grid-cols-2">
            <OpportunitiesList opportunities={result.opportunities} />
            <RoadmapPlan roadmap={result.roadmap} />
          </div>

          <div className="anim-in-delay-3 mt-8">
            <UserProfileCard
              profile={profile}
              cvFileName={cvFileName}
              cvParsed={result.cv_parsed}
            />
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
