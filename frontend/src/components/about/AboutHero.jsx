import { Sparkles } from 'lucide-react'
import Container from '../ui/Container'

export default function AboutHero() {
  return (
    <section className="relative z-[1] pb-12 pt-10 sm:pb-16 sm:pt-16">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow-dl anim-in mb-6 inline-flex">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Barranqui-IA 2026 · Sobre DulIA
          </div>
          <h1
            className="anim-in-delay-1 m-0 font-[family-name:var(--font-display)] font-black leading-[1.08] tracking-[-0.035em] text-[color:var(--fg-1)]"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
          >
            Orientación laboral con IA,{' '}
            <span className="gradient-text">hecha para jóvenes colombianos</span>
          </h1>
          <p className="anim-in-delay-2 body-lg mx-auto mt-6 max-w-2xl">
            DulIA cruza tu perfil con vacantes reales del mercado, te muestra qué tan compatible
            eres con cada oportunidad y te entrega un plan de acción — sin registro, en minutos y
            desde el Caribe para todo el país.
          </p>
          <p className="anim-in-delay-3 mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[color:var(--fg-3)]">
            Nacimos en el hackathon Barranqui-IA 2026 con una meta clara: que dejes de aplicar a
            ciegas y empieces a moverte con datos.
          </p>
        </div>
      </Container>
    </section>
  )
}
