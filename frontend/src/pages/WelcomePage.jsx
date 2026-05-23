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
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <AudienceSection />
        <BusinessModelSection />
        <CTABanner />
      </main>
      <SiteFooter />
    </div>
  )
}
