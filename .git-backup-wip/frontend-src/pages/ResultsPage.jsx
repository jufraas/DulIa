import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Briefcase, Map, Sparkles, Target } from 'lucide-react'
import Container from '../components/ui/Container'
import { useProfileStore } from '../store/useProfileStore'

export default function ResultsPage() {
  const result = useProfileStore((s) => s.result)
  const profile = useProfileStore((s) => s.profile)

  if (!result) {
    return <Navigate to="/comenzar" replace />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
        <Container className="flex h-14 items-center gap-3 sm:h-16">
          <Link
            to="/comenzar"
            className="inline-flex min-h-10 items-center gap-2 text-sm text-slate-300 transition hover:text-cyan-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Editar perfil
          </Link>
          <span className="flex items-center gap-2 font-semibold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            DulIA
          </span>
        </Container>
      </header>

      <main className="py-10 sm:py-14">
        <Container className="max-w-2xl">
          <p className="text-sm font-medium text-cyan-400">Paso 2 de 2</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Tu análisis está listo
          </h1>
          {profile?.name && (
            <p className="mt-3 text-slate-400">
              Hola {profile.name}, este es el camino que mejor encaja contigo
              {profile.city ? ` en ${profile.city}` : ''}.
            </p>
          )}

          <div className="mt-8 grid gap-4">
            <article className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-slate-900 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Perfil sugerido</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    {result.profile}
                  </h2>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">Encaje</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {result.score}
                    <span className="text-lg">%</span>
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
              <h3 className="flex items-center gap-2 font-semibold text-white">
                <Briefcase className="h-5 w-5 text-emerald-400" aria-hidden />
                Oportunidades para ti
              </h3>
              <ul className="mt-4 space-y-3">
                {result.opportunities.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-white/5 bg-slate-800/50 px-4 py-3 text-sm text-slate-200"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
              <h3 className="flex items-center gap-2 font-semibold text-white">
                <Map className="h-5 w-5 text-cyan-400" aria-hidden />
                Tu roadmap
              </h3>
              <ol className="mt-4 space-y-3">
                {result.roadmap.map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm text-slate-200">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </article>

            <div className="rounded-2xl border border-dashed border-white/15 p-5 text-center">
              <Target className="mx-auto h-6 w-6 text-slate-500" aria-hidden />
              <p className="mt-2 text-sm text-slate-400">
                Descarga en PDF — próximo paso del MVP
              </p>
              <Link
                to="/"
                className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-white/15 px-5 text-sm font-medium text-white transition hover:bg-white/5"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </Container>
      </main>
    </div>
  )
}
