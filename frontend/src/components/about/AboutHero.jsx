import { Sparkles } from 'lucide-react'
import Container from '../ui/Container'

export default function AboutHero() {
  return (
    <section className="relative z-[1] pb-12 pt-10 sm:pb-16 sm:pt-16">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow-dl anim-in mb-6 inline-flex">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Barranqui-IA 2026 · Sobre nosotros
          </div>
          <h1
            className="anim-in-delay-1 m-0 font-[family-name:var(--font-display)] font-black leading-[1.08] tracking-[-0.035em] text-[color:var(--fg-1)]"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
          >
            DulIA existe para que los jóvenes colombianos{' '}
            <span className="gradient-text">dejen de adivinar</span> su próximo paso laboral.
          </h1>
          <p className="anim-in-delay-2 body-lg mx-auto mt-6 max-w-2xl">
            Somos un coach de carrera con IA: analizamos tu perfil, cruzamos vacantes reales del
            mercado colombiano y te damos un plan concreto — no promesas vacías ni formularios
            eternos.
          </p>
        </div>
      </Container>
    </section>
  )
}
