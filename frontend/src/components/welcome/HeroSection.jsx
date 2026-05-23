import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Star, User } from 'lucide-react'
import ScoreRing from '../brand/ScoreRing'
import Button from '../ui/Button'
import Container from '../ui/Container'

function MiniStat({ label, value, tone }) {
  const isMagenta = tone === 'magenta'
  return (
    <div
      className="rounded-[14px] px-3.5 py-3"
      style={{
        background: isMagenta ? 'rgba(236,72,153,0.10)' : 'rgba(168,85,247,0.10)',
        border: `1px solid ${isMagenta ? 'rgba(236,72,153,0.30)' : 'rgba(168,85,247,0.30)'}`,
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--fg-3)]">
        {label}
      </div>
      <div className="mt-0.5 font-[family-name:var(--font-display)] text-[22px] font-extrabold text-[color:var(--fg-1)]">
        {value}
      </div>
    </div>
  )
}

function HeroPreview() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-md sm:h-[460px]">
      <div
        className="card-dl anim-in-delay-2 absolute inset-0 p-7"
        style={{
          boxShadow: 'var(--glow-violet-strong)',
          background:
            'linear-gradient(180deg, rgba(168,85,247,0.06), rgba(0,0,0,0)), var(--bg-2)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="eyebrow-dl">
            <User className="h-3.5 w-3.5" aria-hidden />
            Tu perfil · análisis IA
          </div>
          <div
            className="rounded-full px-2.5 py-1 text-[11px] font-bold text-[#34D399]"
            style={{
              background: 'rgba(52,211,153,0.14)',
              border: '1px solid rgba(52,211,153,0.35)',
            }}
          >
            EN VIVO
          </div>
        </div>

        <div className="mt-3 flex flex-col items-center">
          <ScoreRing value={78} size={200} stroke={14} />
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          <MiniStat label="Match real" value="92%" tone="violet" />
          <MiniStat label="Plan 30d" value="Listo" tone="magenta" />
        </div>

        <div
          className="mt-3.5 flex items-center gap-3 rounded-[14px] p-3.5 text-[13px] leading-snug text-[color:var(--fg-2)]"
          style={{
            background: 'rgba(168,85,247,0.10)',
            border: '1px solid rgba(168,85,247,0.25)',
          }}
        >
          <Sparkles className="h-[18px] w-[18px] shrink-0 text-[color:var(--violet-300)]" aria-hidden />
          <span>
            Tienes base sólida en datos. Apunta a{' '}
            <strong className="text-[color:var(--fg-1)]">practicante de BI</strong> esta
            semana.
          </span>
        </div>
      </div>

      <div
        className="anim-in-delay-4 absolute -right-2.5 -top-3.5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold text-white"
        style={{
          background: 'var(--grad-cta)',
          boxShadow: 'var(--glow-cta)',
        }}
      >
        <Star className="h-3.5 w-3.5" aria-hidden />
        Score 78
      </div>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section id="inicio" className="relative z-[1] pb-16 pt-10 sm:pb-24 sm:pt-16">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="text-center lg:text-left">
            <div className="eyebrow-dl anim-in mb-6 inline-flex">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Barranqui-IA 2026 · Coach de carrera con IA
            </div>

            <h1
              className="anim-in-delay-1 m-0 font-[family-name:var(--font-display)] font-black leading-[1.04] tracking-[-0.035em] text-[color:var(--fg-1)]"
              style={{ fontSize: 'clamp(40px, 6vw, 78px)' }}
            >
              Tu carrera,
              <br />
              con <span className="gradient-text">IA de tu lado</span>.
            </h1>

            <p className="anim-in-delay-2 body-lg mx-auto mt-6 max-w-xl lg:mx-0">
              DulIA analiza tu perfil y te dice{' '}
              <strong className="text-[color:var(--fg-1)]">exactamente qué hacer</strong> en
              los próximos 30 días. Sin formularios eternos, sin promesas vacías.
            </p>

            <div className="anim-in-delay-3 mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link to="/comenzar">
                <Button
                  variant="primary"
                  size="lg"
                  iconRight={<ArrowRight className="h-5 w-5" aria-hidden />}
                >
                  Descubre tu potencial
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button variant="ghost">Ver cómo funciona</Button>
              </a>
            </div>

            <div className="anim-in-delay-4 mt-11 flex flex-wrap justify-center gap-6 text-[13px] text-[color:var(--fg-3)] lg:justify-start lg:gap-7">
              <span>
                <strong className="text-[color:var(--violet-300)]">+2.400</strong> jóvenes ya
                tienen su score
              </span>
              <span>
                <strong className="text-[color:var(--violet-300)]">15k</strong> vacantes reales
              </span>
            </div>
          </div>

          <HeroPreview />
        </div>
      </Container>
    </section>
  )
}
