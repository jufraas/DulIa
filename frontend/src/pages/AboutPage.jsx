import PageShell from '../components/layout/PageShell'
import SiteFooter from '../components/layout/SiteFooter'
import SiteHeader from '../components/layout/SiteHeader'
import AboutAudienceSection from '../components/about/AboutAudienceSection'
import AboutBusinessSection from '../components/about/AboutBusinessSection'
import AboutCta from '../components/about/AboutCta'
import AboutHero from '../components/about/AboutHero'
import AboutProblemSection from '../components/about/AboutProblemSection'
import AboutTeamSection from '../components/about/AboutTeamSection'

/**
 * Pantalla "Sobre DulIA" — zona de Migue.
 * El header enlaza aquí desde "Sobre DulIA".
 */
export default function AboutPage() {
  return (
    <PageShell>
      <SiteHeader />
      <main className="relative z-[1] flex-1">
        <AboutHero />
        <AboutProblemSection />
        <AboutAudienceSection />
        <AboutBusinessSection />
        <AboutTeamSection />
        <AboutCta />
      </main>
      <SiteFooter />
    </PageShell>
  )
}
