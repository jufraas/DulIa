import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Check,
  Download,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import DuliaLogo from '../components/brand/DuliaLogo'
import ScoreRing from '../components/brand/ScoreRing'
import PageShell from '../components/layout/PageShell'
import SiteFooter from '../components/layout/SiteFooter'
import PdfDownloadCard from '../components/results/PdfDownloadCard'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import { useProfileStore } from '../store/useProfileStore'

export default function ResultsPage() {
  const result = useProfileStore((s) => s.result)
  const profile = useProfileStore((s) => s.profile)
  const [downloading, setDownloading] = useState(false)

  if (!result) {
    return <Navigate to="/comenzar" replace />
  }

  const score = typeof result.score === 'number' ? result.score : Number(result.score) || 0
  const skills = profile?.skills
    ? profile.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      const { generateAnalysisPdf } = await import('../utils/generateAnalysisPdf')
      generateAnalysisPdf({ profile, result })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <PageShell>
      <header className="dh">
        <Container className="dh-inner">
          <Link to="/">
            <DuliaLogo />
          </Link>
          <nav className="dh-nav hidden md:flex" aria-label="Resultados">
            <Link to="/comenzar">Editar perfil</Link>
          </nav>
          <Link to="/comenzar">
            <Button variant="ghost" size="sm">
              Editar perfil
            </Button>
          </Link>
        </Container>
      </header>

      <main className="relative z-[1] flex-1 pb-24 pt-10 sm:pt-14">
        <Container>
          <div className="anim-in mb-12 text-center">
            <div className="eyebrow-dl mb-3.5 inline-flex">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Análisis listo
            </div>
            <h1
              className="m-0 font-[family-name:var(--font-display)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[color:var(--fg-1)]"
              style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
            >
              {profile?.name ? (
                <>
                  Vas mejor de lo que crees,
                  <br />
                  <span className="gradient-text">{profile.name.split(' ')[0]}</span>.
                </>
              ) : (
                <>
                  Vas mejor de lo que crees,
                  <br />
                  <span className="gradient-text">parcero</span>.
                </>
              )}
            </h1>
          </div>

          <div className="anim-in-delay-1 mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div
              className="card-dl flex flex-col items-center gap-5 p-9"
              style={{ boxShadow: 'var(--glow-violet-strong)' }}
            >
              <div className="eyebrow-dl">
                <Target className="h-3.5 w-3.5" aria-hidden />
                Tu score de empleabilidad
              </div>
              <ScoreRing value={score} size={220} stroke={16} />
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-[#34D399]"
                style={{
                  background: 'rgba(52,211,153,0.14)',
                  border: '1px solid rgba(52,211,153,0.35)',
                }}
              >
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                Perfil: {result.profile}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="card-dl flex-1 p-7">
                <div className="eyebrow-dl mb-3.5">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Resumen de tu perfil — por DulIA
                </div>
                <p className="m-0 text-[17px] leading-relaxed text-[color:var(--fg-2)]">
                  {profile?.name && (
                    <>
                      Hola <strong className="text-[color:var(--fg-1)]">{profile.name}</strong>
                      {profile.city ? ` de ${profile.city}` : ''}.{' '}
                    </>
                  )}
                  Tu perfil encaja como{' '}
                  <strong className="text-[color:var(--fg-1)]">{result.profile}</strong> con un
                  score de <strong className="brand-text">{score}</strong> sobre 100. Sigue el
                  plan de 30 días para subir tu empleabilidad.
                </p>
                {skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="chip-dl selected">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <PdfDownloadCard onDownload={handleDownloadPdf} downloading={downloading} />
            </div>
          </div>

          <div className="anim-in-delay-2 grid gap-6 lg:grid-cols-2">
            <article className="card-dl p-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="eyebrow-dl">
                  <Briefcase className="h-3.5 w-3.5" aria-hidden />
                  Oportunidades para ti
                </div>
              </div>
              <h3 className="mb-5 text-[22px] font-bold tracking-[-0.015em] text-[color:var(--fg-1)]">
                Vacantes que cuadran contigo
              </h3>
              <ul className="flex flex-col gap-3">
                {result.opportunities.map((item, i) => (
                  <li
                    key={item}
                    className="flex items-center gap-3.5 rounded-2xl p-4"
                    style={{
                      background: 'var(--bg-1)',
                      border: '1px solid rgba(168,85,247,0.20)',
                    }}
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-[family-name:var(--font-display)] text-base font-extrabold text-white"
                      style={{ background: 'var(--grad-brand)' }}
                    >
                      {i + 1}
                    </div>
                    <p className="m-0 flex-1 text-[15px] font-semibold text-[color:var(--fg-1)]">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="card-dl p-7">
              <div className="eyebrow-dl mb-3.5">
                <Calendar className="h-3.5 w-3.5" aria-hidden />
                Tu plan de 30 días
              </div>
              <h3 className="mb-5 text-[22px] font-bold tracking-[-0.015em] text-[color:var(--fg-1)]">
                Una cosa a la vez. <span className="brand-text">Tú puedes.</span>
              </h3>
              <ol className="flex flex-col gap-3.5">
                {result.roadmap.map((step, i) => (
                  <li key={step} className="flex gap-3.5">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-[family-name:var(--font-display)] text-[15px] font-extrabold text-white"
                      style={{
                        background: i === 0 ? 'var(--grad-cta)' : 'var(--grad-brand)',
                        boxShadow:
                          i === 0
                            ? '0 8px 22px rgba(236,72,153,0.40)'
                            : '0 6px 16px rgba(124,58,237,0.30)',
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="m-0 text-[15px] font-semibold text-[color:var(--fg-1)]">
                        {step}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          </div>

          <div
            className="anim-in-delay-3 mt-12 flex flex-col items-start justify-between gap-6 rounded-[24px] p-8 sm:flex-row sm:items-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(236,72,153,0.14) 0%, rgba(124,58,237,0.10) 100%)',
              border: '1px solid rgba(236,72,153,0.35)',
            }}
          >
            <div>
              <h3 className="m-0 text-2xl font-extrabold tracking-[-0.015em] text-[color:var(--fg-1)]">
                Llévate tu plan completo
              </h3>
              <p className="body mt-2 mb-0">
                Tu score, perfil y plan de 30 días en un PDF que puedes compartir.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleDownloadPdf}
              disabled={downloading}
              iconLeft={<Download className="h-5 w-5" aria-hidden />}
            >
              {downloading ? 'Generando…' : 'Descargar mi plan'}
            </Button>
          </div>

          <div className="mt-10 text-center">
            <Link to="/">
              <Button
                variant="ghost"
                iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
              >
                Volver al inicio
              </Button>
            </Link>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </PageShell>
  )
}
