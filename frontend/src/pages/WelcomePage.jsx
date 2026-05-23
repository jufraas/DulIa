import { useCallback, useEffect, useState } from 'react'
import PageShell from '../components/layout/PageShell'
import LandingFooter from '../components/layout/LandingFooter'
import SiteHeader from '../components/layout/SiteHeader'
import LandingSplash from '../components/welcome/LandingSplash'
import FeaturesSection from '../components/welcome/FeaturesSection'
import HeroSection from '../components/welcome/HeroSection'

/** Tiempo visible del splash antes del fade (ms) */
const SPLASH_MS = 1100
/** Duración del fade de salida — debe coincidir con CSS `.landing-splash--out` */
const FADE_MS = 400

/** Solo vive en memoria: al recargar la página vuelve a false y el splash se muestra otra vez */
let splashDismissedInSpa = false

/** Pantalla 01 — Landing (kit ReBrand): splash + Hero + Features */
export default function WelcomePage() {
  const [phase, setPhase] = useState(() => (splashDismissedInSpa ? 'done' : 'splash'))

  const dismissSplash = useCallback(() => {
    setPhase((current) => {
      if (current === 'done') return current
      splashDismissedInSpa = true
      return 'exit'
    })
  }, [])

  useEffect(() => {
    if (phase !== 'splash') return undefined
    const timer = window.setTimeout(dismissSplash, SPLASH_MS)
    return () => window.clearTimeout(timer)
  }, [phase, dismissSplash])

  useEffect(() => {
    if (phase !== 'exit') return undefined
    const timer = window.setTimeout(() => setPhase('done'), FADE_MS)
    return () => window.clearTimeout(timer)
  }, [phase])

  const showSplash = phase === 'splash' || phase === 'exit'
  /** Montar landing solo al fade: evita anim-in + ScoreRing mientras el splash cubre la pantalla */
  const showContent = phase === 'exit' || phase === 'done'
  /** Hero entra en cascada cuando el splash ya desapareció */
  const heroEnter = phase === 'done'

  return (
    <>
      {showSplash && (
        <LandingSplash exiting={phase === 'exit'} onSkip={dismissSplash} />
      )}
      {showContent && (
        <PageShell>
          <SiteHeader />
          <main className="relative z-[1] flex-1">
            <HeroSection enter={heroEnter} />
            <FeaturesSection />
          </main>
          <LandingFooter />
        </PageShell>
      )}
    </>
  )
}
