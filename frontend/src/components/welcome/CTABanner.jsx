import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '../ui/Button'

/** CTA final — card embebida dentro de FeaturesSection (kit ReBrand) */
export default function CTABanner() {
  return (
    <div
      className="card-dl mt-16 px-6 py-12 text-center sm:px-14 sm:py-14"
      style={{
        background:
          'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(236,72,153,0.10) 100%)',
        borderColor: 'rgba(168,85,247,0.45)',
      }}
    >
      <h2
        className="m-0 font-[family-name:var(--font-display)] font-extrabold leading-[1.15] tracking-[-0.02em] text-[color:var(--fg-1)]"
        style={{ fontSize: 'clamp(28px, 4vw, 36px)' }}
      >
        ¿Listo? Tres pasos. Dos minutos.
        <br />
        <span className="gradient-text">Tu plan está esperando.</span>
      </h2>
      <div className="mt-8">
        <Link to="/comenzar">
          <Button
            variant="primary"
            size="lg"
            iconRight={<ArrowRight className="h-5 w-5" aria-hidden />}
          >
            Descubre tu potencial
          </Button>
        </Link>
      </div>
    </div>
  )
}
