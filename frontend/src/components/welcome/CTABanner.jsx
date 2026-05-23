import { ArrowRight } from 'lucide-react'
import Container from '../ui/Container'

export default function CTABanner() {
  return (
    <section id="comenzar" className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 via-slate-800 to-slate-900 px-6 py-12 text-center sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(34,211,238,0.15),_transparent_50%)]"
            aria-hidden
          />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              ¿Listo para descubrir tu ruta?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-300">
              En el siguiente paso completarás tu perfil y recibirás
              recomendaciones personalizadas con oportunidades reales.
            </p>
            <button
              type="button"
              disabled
              className="mt-8 inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-cyan-500/50 px-8 text-base font-semibold text-slate-900/80"
              title="Onboarding en construcción"
            >
              Empezar mi análisis
              <ArrowRight className="h-5 w-5" aria-hidden />
            </button>
            <p className="mt-3 text-xs text-slate-500">
              Siguiente paso del MVP: formulario de perfil
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
