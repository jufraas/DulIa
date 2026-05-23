import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Briefcase, Shield } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SiteHeader from '../components/layout/SiteHeader'
import {
  FilterChip,
  TrafficStat,
  VacancyRow,
} from '../components/vacancies/VacancyPanel'
import { mapJobToVacancyRow } from '../components/vacancies/vacancyStatus'
import IconBox from '../components/brand/IconBox'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import { getRecommendedJobs } from '../services/api'
import { useProfileStore } from '../store/useProfileStore'
import { getOrCreateSessionId } from '../utils/session'

/** Pantalla 04 — Panel de vacantes con semáforo (kit ReBrand) */
export default function VacanciesPage() {
  const jobs = useProfileStore((s) => s.jobs)
  const setJobs = useProfileStore((s) => s.setJobs)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(!jobs.length)

  useEffect(() => {
    if (jobs.length) return
    let cancelled = false
    setLoading(true)
    getRecommendedJobs(getOrCreateSessionId())
      .then((data) => {
        if (!cancelled) setJobs(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [jobs.length, setJobs])

  const rows = useMemo(() => jobs.map(mapJobToVacancyRow), [jobs])

  const counts = useMemo(
    () => ({
      all: rows.length,
      green: rows.filter((j) => j.status === 'green').length,
      yellow: rows.filter((j) => j.status === 'yellow').length,
      red: rows.filter((j) => j.status === 'red').length,
    }),
    [rows],
  )

  const filtered =
    filter === 'all' ? rows : rows.filter((j) => j.status === filter)

  return (
    <PageShell>
      <SiteHeader />

      <main className="relative z-[1] flex-1 pb-28 pt-14">
        <Container>
          <div className="anim-in mb-9 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="eyebrow-dl mb-3.5">
                <Briefcase className="h-3.5 w-3.5" aria-hidden />
                Panel de vacantes · DulIA filtró por ti
              </div>
              <h1
                className="m-0 font-[family-name:var(--font-display)] font-extrabold leading-[1.1] tracking-[-0.025em] text-[color:var(--fg-1)]"
                style={{ fontSize: 'clamp(36px, 4.5vw, 54px)' }}
              >
                {rows.length || '—'} oportunidades,
                <br />
                <span className="gradient-text">solo aplicas a las buenas</span>.
              </h1>
            </div>
            <Link to="/">
              <Button variant="secondary" iconLeft={<ArrowLeft className="h-4 w-4" />}>
                Volver
              </Button>
            </Link>
          </div>

          <div className="anim-in-delay-1 mb-6 grid gap-4 md:grid-cols-3">
            <TrafficStat
              status="green"
              count={counts.green}
              title="Verificadas y seguras"
              body="Empresas reales, pagos acordes, reclutadores confirmados."
            />
            <TrafficStat
              status="yellow"
              count={counts.yellow}
              title="Revisa antes de aplicar"
              body="Algo no cuadra: salario, descripción o requisitos."
            />
            <TrafficStat
              status="red"
              count={counts.red}
              title="Vacantes sospechosas"
              body="Las marcamos: piden dinero, esquema piramidal o datos raros."
            />
          </div>

          <div className="anim-in-delay-2 mb-5 flex flex-wrap items-center gap-2.5">
            <span className="mr-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--fg-3)]">
              Mostrar
            </span>
            <FilterChip
              label="Todas"
              count={counts.all}
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            />
            <FilterChip
              label="Verificadas"
              count={counts.green}
              active={filter === 'green'}
              onClick={() => setFilter('green')}
              dot="#34D399"
            />
            <FilterChip
              label="Revísala"
              count={counts.yellow}
              active={filter === 'yellow'}
              onClick={() => setFilter('yellow')}
              dot="#FBBF24"
            />
            <FilterChip
              label="Sospechosas"
              count={counts.red}
              active={filter === 'red'}
              onClick={() => setFilter('red')}
              dot="#F87171"
            />
          </div>

          {loading && (
            <p className="text-center text-sm text-[color:var(--fg-3)]">Cargando vacantes…</p>
          )}

          <div className="anim-in-delay-3 flex flex-col gap-3">
            {filtered.map((job) => (
              <VacancyRow key={job.id} job={job} />
            ))}
            {!loading && filtered.length === 0 && (
              <p className="rounded-[14px] px-4 py-6 text-center text-sm text-[color:var(--fg-3)]"
                style={{
                  border: '1px dashed rgba(168,85,247,0.35)',
                  background: 'rgba(168,85,247,0.08)',
                }}
              >
                No hay vacantes en este filtro.{' '}
                <Link to="/comenzar" className="text-[color:var(--violet-200)] underline">
                  Completa tu perfil
                </Link>{' '}
                para ver recomendaciones.
              </p>
            )}
          </div>

          <div
            className="anim-in-delay-4 mt-8 flex flex-col items-start gap-4 rounded-[20px] p-6 sm:flex-row sm:items-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(124,58,237,0.14), rgba(236,72,153,0.10))',
              border: '1px solid rgba(168,85,247,0.35)',
            }}
          >
            <IconBox variant="violet" size={56}>
              <Shield className="h-[26px] w-[26px] text-white" strokeWidth={2} aria-hidden />
            </IconBox>
            <div className="flex-1">
              <div className="font-[family-name:var(--font-display)] text-lg font-bold text-[color:var(--fg-1)]">
                ¿Cómo sabe DulIA cuáles son falsas?
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--fg-2)]">
                Cruzamos cada vacante con históricos de reclutadores y patrones de fraude. Si
                algo no cuadra, lo marcamos antes de que apliques.
              </p>
            </div>
          </div>
        </Container>
      </main>
    </PageShell>
  )
}
