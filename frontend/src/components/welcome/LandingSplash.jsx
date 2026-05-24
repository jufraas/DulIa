import DuliaLogo from '../brand/DuliaLogo'

/**
 * Splash inicial de la landing — logo + halo del kit ReBrand
 * @param {{ exiting?: boolean, onSkip?: () => void }} props
 */
export default function LandingSplash({ exiting = false, onSkip }) {
  return (
    <div
      className={`landing-splash ${exiting ? 'landing-splash--out' : ''}`}
      role="presentation"
      aria-hidden={exiting}
      onClick={onSkip}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') onSkip?.()
      }}
    >
      <div className="landing-splash__atmosphere" aria-hidden />
      <div className="landing-splash__stage">
        <div className="landing-splash__brand">
          <div className="landing-splash__logo-wrap">
            <div className="landing-splash__halo" aria-hidden />
            <DuliaLogo height={56} className="landing-splash__logo" />
          </div>
          <p className="landing-splash__tagline">Coach de carrera con IA</p>
        </div>
      </div>
    </div>
  )
}
