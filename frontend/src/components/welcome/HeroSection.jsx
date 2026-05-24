import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Star, User } from 'lucide-react'
import CoachAskLink from '../results/CoachAskLink'
import ScoreRing from '../brand/ScoreRing'
import RevealOnScroll from '../motion/RevealOnScroll'
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

function HeroPreview({ enter = true }) {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-md sm:h-[460px]">
      <RevealOnScroll
        trigger="mount"
        enter={enter}
        className="card-dl absolute inset-0 p-7"
        style={{
          boxShadow: 'var(--glow-violet-strong)',
          background:
            'linear-gradient(180deg, rgba(168,85,247,0.06), rgba(0,0,0,0)), var(--bg-2)',
        }}
        delay={0.16}
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
      </RevealOnScroll>

      <RevealOnScroll
        trigger="mount"
        enter={enter}
        className="absolute -right-2.5 -top-3.5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold text-white"
        style={{
          background: 'var(--grad-cta)',
          boxShadow: 'var(--glow-cta)',
        }}
        delay={0.32}
        y={12}
      >
        <Star className="h-3.5 w-3.5" aria-hidden />
        Score 78
      </RevealOnScroll>
    </div>
  )
}

/** @param {{ enter?: boolean }} props */
export default function HeroSection({ enter = true }) {
  return (
    <section id="inicio" className="relative z-[1] pb-16 pt-10 sm:pb-24 sm:pt-16">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="text-center lg:text-left">
            <RevealOnScroll trigger="mount" enter={enter} className="mb-6 inline-flex">
              <div className="eyebrow-dl">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Coach de carrera impulsado con IA
              </div>
            </RevealOnScroll>

            <RevealOnScroll trigger="mount" enter={enter} delay={0.08}>
              <h1
                className="m-0 font-[family-name:var(--font-display)] font-black leading-[1.04] tracking-[-0.035em] text-[color:var(--fg-1)]"
                style={{ fontSize: 'clamp(40px, 6vw, 78px)' }}
              >
                Tu carrera,
                <br />
                con <span className="gradient-text">IA de tu lado</span>.
              </h1>
            </RevealOnScroll>

            <RevealOnScroll trigger="mount" enter={enter} delay={0.16}>
              <p className="body-lg mx-auto mt-6 max-w-xl lg:mx-0">
                DulIA analiza tu perfil y te dice{' '}
                <strong className="text-[color:var(--fg-1)]">exactamente qué hacer</strong> en
                los próximos 30 días. Sin formularios eternos, sin promesas vacías.
              </p>
            </RevealOnScroll>

            <RevealOnScroll trigger="mount" enter={enter} delay={0.24}>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link to="/comenzar">
                  <Button
                    variant="primary"
                    size="lg"
                    iconRight={<ArrowRight className="h-5 w-5" aria-hidden />}
                  >
                    Descubre tu potencial
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="ghost">Ver cómo funciona</Button>
                </a>
              </div>
            </RevealOnScroll>

            <RevealOnScroll trigger="mount" enter={enter} delay={0.32}>
              <div className="mt-11 flex flex-wrap justify-center gap-6 text-[13px] text-[color:var(--fg-3)] lg:justify-start lg:gap-7">
                <span>
                  <strong className="text-[color:var(--violet-300)]">+2.400</strong> jóvenes ya
                  tienen su score
                </span>
                <span>
                  <strong className="text-[color:var(--violet-300)]">15k</strong> vacantes reales
                </span>
              </div>
              <p className="mt-4 text-center text-[13px] lg:text-left">
                <CoachAskLink
                  question="¿Cómo funciona DulIA y qué es el score?"
                  label="Pregúntale al coach antes de empezar"
                />
              </p>
            </RevealOnScroll>
          </div>

          <HeroPreview enter={enter} />
        </div>
      </Container>
    </section>
  )
}
