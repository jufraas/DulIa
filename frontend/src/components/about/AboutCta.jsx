import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '../ui/Button'
import Container from '../ui/Container'

export default function AboutCta() {
  return (
    <section className="relative z-[1] py-16 sm:py-20">
      <Container>
        <div
          className="card-dl px-6 py-12 text-center sm:px-14 sm:py-14"
          style={{
            background:
              'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(236,72,153,0.10) 100%)',
            borderColor: 'rgba(168,85,247,0.45)',
          }}
        >
          <h2
            className="m-0 font-[family-name:var(--font-display)] font-extrabold leading-[1.15] tracking-[-0.02em] text-[color:var(--fg-1)]"
            style={{ fontSize: 'clamp(24px, 3.5vw, 32px)' }}
          >
            ¿Listo para probarlo?
            <br />
            <span className="gradient-text">Tu plan está a dos minutos.</span>
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
      </Container>
    </section>
  )
}
