import PageShell from '../components/layout/PageShell'
import SiteFooter from '../components/layout/SiteFooter'
import SiteHeader from '../components/layout/SiteHeader'
import AudienceSection from '../components/welcome/AudienceSection'
import BusinessModelSection from '../components/welcome/BusinessModelSection'
import CTABanner from '../components/welcome/CTABanner'
import HeroSection from '../components/welcome/HeroSection'
import HowItWorksSection from '../components/welcome/HowItWorksSection'
import ProblemSection from '../components/welcome/ProblemSection'

export default function WelcomePage() {
  return (
    <PageShell>
      <SiteHeader />
      <main className="relative z-[1] flex-1">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <AudienceSection />
        <BusinessModelSection />
        <CTABanner />
      </main>
      <SiteFooter />
    </PageShell>
  )
}
