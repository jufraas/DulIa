import { ArrowRight } from 'lucide-react'
import heroImg from '../../assets/hero.png'
import Container from '../ui/Container'

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden pb-16 pt-10 sm:pb-20 sm:pt-14"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15),transparent_70%)]"
        aria-hidden
      />
      <Container className="relative">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <p className="mb-4 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300 sm:text-sm">
              Barranqui-IA 2026 · Oportunidades reales
            </p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Tu coach de carrera con IA,{' '}
              <span className="text-cyan-400">hecho para Colombia</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0">
              DulIA analiza tu perfil, te conecta con vacantes locales reales y
              te entrega un plan de acción claro — no solo consejos genéricos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#comenzar"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 text-base font-semibold text-slate-900 transition hover:bg-cyan-400"
              >
                Comenzar gratis
                <ArrowRight className="h-5 w-5" aria-hidden />
              </a>
              <a
                href="#como-funciona"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-6 text-base font-medium text-white transition hover:bg-white/5"
              >
                Ver cómo funciona
              </a>
            </div>
          </div>

          <div className="flex flex-1 justify-center lg:justify-end">
            <div className="relative">
              <div
                className="absolute -inset-4 rounded-3xl bg-cyan-500/20 blur-2xl"
                aria-hidden
              />
              <img
                src={heroImg}
                alt="Ilustración de orientación profesional con IA"
                className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md"
                width={400}
                height={420}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
