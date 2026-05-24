import ScoreRing from '../brand/ScoreRing'
import PdfSection from './PdfSection'
import { parseAnalysisResponse, resolveEmployabilityScore } from '../../utils/analysisDisplay'
import { savedProfileToDisplayFields } from '../../utils/formatProfileLabels'
import { formatSalary } from '../../utils/formatters'
import {
  formatMarketSourceSummary,
  getModalityEntries,
} from '../../utils/marketDisplay'
import { planPhaseToDisplay, planToDisplayWeeks } from '../../utils/planDisplay'
import { RADAR_DIMENSION_KEYS, RADAR_DIMENSION_LABELS } from '../../utils/radarApi'
import '../../styles/pdf-document.css'

/**
 * @param {{
 *   profile: import('../../store/useProfileStore').SavedProfile,
 *   jobs?: import('../../store/useProfileStore').Job[],
 *   market?: import('../../store/useProfileStore').MarketDashboard | null,
 *   analysis?: unknown,
 *   plan?: import('../../store/useProfileStore').ActionPlan | null,
 *   radar?: import('../../utils/radarApi').RadarChartData | null,
 * }} props
 */
export default function AnalysisPdfDocument({
  profile,
  jobs = [],
  market = null,
  analysis = null,
  plan = null,
  radar = null,
}) {
  const insights = parseAnalysisResponse(analysis)
  const score = resolveEmployabilityScore({ insights, jobs, radar })
  const name = profile.nombre ?? 'Usuario'
  const city = profile.ciudad ?? ''
  const weeks = planToDisplayWeeks(plan)
  const phase60 = planPhaseToDisplay(plan?.fase_60)
  const phase90 = planPhaseToDisplay(plan?.fase_90)

  const sortedJobs = [...jobs].sort(
    (a, b) => (b.score_compatibilidad ?? 0) - (a.score_compatibilidad ?? 0),
  )

  const dateStr = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const scoreLabel =
    score >= 70 ? 'Buen nivel' : score >= 50 ? 'En camino' : 'Hay margen de mejora'

  return (
    <div className="pdf-capture-root">
      <header className="pdf-header">
        <h1 className="pdf-header__brand">DulIA</h1>
        <p className="pdf-header__tagline">Tu plan de carrera personalizado</p>
        <div className="pdf-header__meta">
          <span>Coach de carrera con IA · Barranqui-IA 2026</span>
          <span>{dateStr}</span>
        </div>
      </header>

      <p className="pdf-intro">
        <strong>{city ? `${name} · ${city}` : name}</strong>
        {insights?.descripcion ? (
          <>
            {' '}
            — {insights.descripcion}
          </>
        ) : null}
      </p>

      <div className="card-dl pdf-score-row">
        <ScoreRing value={score} size={108} stroke={10} animate={false} />
        <div className="pdf-score-row__info">
          <h3>Score de empleabilidad</h3>
          <p>
            {score}/100 · {scoreLabel}
          </p>
          {insights?.comparativa ? (
            <p className="pdf-score-row__badge">{insights.comparativa}</p>
          ) : null}
        </div>
      </div>

      {insights &&
        (insights.fortalezas.length ||
          insights.debilidades.length ||
          insights.recomendaciones.length ||
          insights.oportunidades[0]) && (
          <PdfSection eyebrow="Análisis" title="Lo que DulIA detectó en tu perfil">
            {insights.fortalezas.length > 0 && (
              <>
                <p className="pdf-subtitle pdf-subtitle--success">Fortalezas</p>
                <ul className="pdf-list pdf-list--plus">
                  {insights.fortalezas.map((f) => (
                    <li key={`${f.label}-${f.text}`}>
                      <strong>{f.label}:</strong> {f.text}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {insights.debilidades.length > 0 && (
              <>
                <p className="pdf-subtitle pdf-subtitle--warning">A mejorar</p>
                <ul className="pdf-list pdf-list--arrow">
                  {insights.debilidades.map((d) => (
                    <li key={`${d.label}-${d.text}`}>
                      <strong>{d.label}:</strong> {d.text}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {insights.oportunidades[0] && (
              <div className="pdf-opportunity">
                <strong>Oportunidad · {insights.oportunidades[0].sector}</strong>
                {insights.oportunidades[0].razon}
                {insights.oportunidades[0].accion ? (
                  <p style={{ margin: '8px 0 0', fontWeight: 600, color: 'var(--fg-1)' }}>
                    → {insights.oportunidades[0].accion}
                  </p>
                ) : null}
              </div>
            )}

            {insights.recomendaciones.length > 0 && (
              <>
                <p className="pdf-subtitle pdf-subtitle--violet">Recomendaciones</p>
                <ul className="pdf-list pdf-list--dot">
                  {insights.recomendaciones.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </>
            )}
          </PdfSection>
        )}

      {(weeks.length > 0 || plan?.resumen_ejecutivo) && (
        <PdfSection eyebrow="Plan de acción" title="Primeros 30 días">
          {plan?.resumen_ejecutivo ? (
            <p style={{ margin: '0 0 14px', fontSize: 13, lineHeight: 1.55, color: 'var(--fg-2)' }}>
              {plan.resumen_ejecutivo}
            </p>
          ) : null}

          {weeks.map((week) => (
            <div key={`${week.w}-${week.title}`} className="pdf-week">
              <p className="pdf-week__title">
                {week.w} — {week.title}
              </p>
              <ul className="pdf-list pdf-list--circle">
                {week.tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </div>
          ))}

          {phase60?.tasks.length ? (
            <div className="pdf-week">
              <p className="pdf-week__title">Fase 60 días — {phase60.title}</p>
              <ul className="pdf-list pdf-list--circle">
                {phase60.tasks.slice(0, 5).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {phase90?.tasks.length ? (
            <div className="pdf-week">
              <p className="pdf-week__title">Fase 90 días — {phase90.title}</p>
              <ul className="pdf-list pdf-list--circle">
                {phase90.tasks.slice(0, 5).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </PdfSection>
      )}

      {radar?.usuario && radar?.mercado && (
        <PdfSection eyebrow="Match radar" title="Tu perfil vs el mercado">
          <table className="pdf-table">
            <thead>
              <tr>
                <th>Dimensión</th>
                <th>Tú</th>
                <th>Mercado</th>
                <th>Brecha</th>
              </tr>
            </thead>
            <tbody>
              {RADAR_DIMENSION_KEYS.map((key) => {
                const you = radar.usuario[key]
                const mkt = radar.mercado[key]
                if (you == null && mkt == null) return null
                const gap = you != null && mkt != null ? you - mkt : null
                const gapClass =
                  gap == null ? '' : gap >= 0 ? 'num-gap-pos' : 'num-gap-neg'
                const gapStr =
                  gap == null ? '—' : gap >= 0 ? `+${Math.round(gap)}` : String(Math.round(gap))

                return (
                  <tr key={key}>
                    <td>{RADAR_DIMENSION_LABELS[key]?.name ?? key}</td>
                    <td className="num-you">{you ?? '—'}</td>
                    <td>{mkt ?? '—'}</td>
                    <td className={gapClass}>{gapStr}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </PdfSection>
      )}

      {sortedJobs.length > 0 && (
        <PdfSection eyebrow="Vacantes" title="Recomendadas para ti">
          {sortedJobs.slice(0, 8).map((job) => {
            const semClass =
              job.semaforo === 'green'
                ? 'pdf-job--green'
                : job.semaforo === 'yellow'
                  ? 'pdf-job--yellow'
                  : job.semaforo === 'red'
                    ? 'pdf-job--red'
                    : ''

            return (
              <article key={String(job.id)} className={`pdf-job ${semClass}`}>
                <h4 className="pdf-job__title">{job.titulo ?? 'Vacante'}</h4>
                <p className="pdf-job__meta">
                  {job.empresa ?? '—'} · {job.score_compatibilidad ?? 0}% match ·{' '}
                  {formatSalary(job.salario_min, job.salario_max)}
                  {job.modalidad ? ` · ${job.modalidad}` : ''}
                </p>
                {job.url && job.semaforo !== 'red' ? (
                  <p className="pdf-job__url">{job.url}</p>
                ) : null}
              </article>
            )
          })}
          {sortedJobs.length > 8 ? (
            <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--fg-3)' }}>
              + {sortedJobs.length - 8} vacantes más en la app DulIA
            </p>
          ) : null}
        </PdfSection>
      )}

      {market && (
        <PdfSection eyebrow="Mercado" title="Termómetro laboral">
          <dl className="pdf-stat-grid">
            <div className="pdf-stat-row">
              <dt>Vacantes activas</dt>
              <dd>{market.total_vacantes_activas ?? '—'}</dd>
            </div>
            {formatMarketSourceSummary(market.por_fuente) ? (
              <div className="pdf-stat-row">
                <dt>Fuentes</dt>
                <dd>{formatMarketSourceSummary(market.por_fuente)}</dd>
              </div>
            ) : null}
            {getModalityEntries(market.por_modalidad).length > 0 ? (
              <div className="pdf-stat-row">
                <dt>Modalidad</dt>
                <dd>
                  {getModalityEntries(market.por_modalidad)
                    .map(({ label, count }) => `${label}: ${count}`)
                    .join(' · ')}
                </dd>
              </div>
            ) : null}
            {market.salario_promedio ? (
              <div className="pdf-stat-row">
                <dt>Salario promedio</dt>
                <dd>{formatSalary(market.salario_promedio, undefined)}</dd>
              </div>
            ) : null}
            {market.crecimiento_semanal_pct != null ? (
              <div className="pdf-stat-row">
                <dt>Crecimiento semanal</dt>
                <dd>{market.crecimiento_semanal_pct}%</dd>
              </div>
            ) : null}
            {market.ciudad_filtro ? (
              <div className="pdf-stat-row">
                <dt>Ciudad</dt>
                <dd>{market.ciudad_filtro}</dd>
              </div>
            ) : null}
          </dl>
        </PdfSection>
      )}

      <PdfSection eyebrow="Perfil" title="Datos registrados">
        <dl className="pdf-stat-grid">
          {savedProfileToDisplayFields(profile).map(({ label, value }) => (
            <div key={label} className="pdf-stat-row">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </PdfSection>

      <footer className="pdf-footer">
        Generado por DulIA · Continúa tu plan y habla con el coach en la app
      </footer>
    </div>
  )
}
