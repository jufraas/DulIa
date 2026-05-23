import { useCallback, useEffect, useState } from 'react'
import PageShell from '../components/layout/PageShell'
import LandingFooter from '../components/layout/LandingFooter'
import SiteHeader from '../components/layout/SiteHeader'
import LandingSplash from '../components/welcome/LandingSplash'
import FeaturesSection from '../components/welcome/FeaturesSection'
import HeroSection from '../components/welcome/HeroSection'

const SPLASH_MS = 1600
const FADE_MS = 500

/** Pantalla 01 — Landing (kit ReBrand): splash + Hero + Features */
export default function WelcomePage() {
  const [phase, setPhase] = useState('splash')

  const dismissSplash = useCallback(() => {
    setPhase((current) => (current === 'done' ? current : 'exit'))
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

  return (
    <>
      {showSplash && (
        <LandingSplash exiting={phase === 'exit'} onSkip={dismissSplash} />
      )}
      <PageShell className={showSplash ? 'landing-splash-hidden' : ''}>
        <SiteHeader />
        <main className="relative z-[1] flex-1">
          <HeroSection />
          <FeaturesSection />
        </main>
        <LandingFooter />
      </PageShell>
    </>
  )
}
