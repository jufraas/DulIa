import PageShell from '../components/layout/PageShell'
import LandingFooter from '../components/layout/LandingFooter'
import SiteHeader from '../components/layout/SiteHeader'
import FeaturesSection from '../components/welcome/FeaturesSection'
import HeroSection from '../components/welcome/HeroSection'

/** Pantalla 01 — Landing (kit ReBrand): Hero + Features + CTA */
export default function WelcomePage() {
  return (
    <PageShell>
      <SiteHeader />
      <main className="relative z-[1] flex-1">
        <HeroSection />
        <FeaturesSection />
      </main>
      <LandingFooter />
    </PageShell>
  )
}
