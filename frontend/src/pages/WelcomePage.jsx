import PageShell from '../components/layout/PageShell'
import SiteFooter from '../components/layout/SiteFooter'
import SiteHeader from '../components/layout/SiteHeader'
import AudienceSection from '../components/welcome/AudienceSection'
import BusinessModelSection from '../components/welcome/BusinessModelSection'
import FeaturesSection from '../components/welcome/FeaturesSection'
import HeroSection from '../components/welcome/HeroSection'
import ProblemSection from '../components/welcome/ProblemSection'

/**
 * Landing ampliada: kit ReBrand (Hero + Features + CTA) + secciones de pitch
 * (problema, audiencia, modelo de negocio) con tokens y componentes del design system.
 */
export default function WelcomePage() {
  return (
    <PageShell>
      <SiteHeader />
      <main className="relative z-[1] flex-1">
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <AudienceSection />
        <BusinessModelSection />
      </main>
      <SiteFooter />
    </PageShell>
  )
}
