import { TrendingUp } from 'lucide-react'
import { formatPercent, formatSalary } from '../../utils/formatters'

/**
 * @param {{ market: import('../../store/useProfileStore').MarketDashboard | null }} props
 */
export default function MarketThermometer({ market }) {
  if (!market) return null

  return (
    <article className="card-dl p-7">
      <div className="eyebrow-dl mb-3.5">
        <TrendingUp className="h-3.5 w-3.5" aria-hidden />
        Termómetro del mercado
        {market.ciudad_filtro ? ` · ${market.ciudad_filtro}` : ''}
      </div>
      <h3 className="mb-5 text-[22px] font-bold tracking-[-0.015em] text-[color:var(--fg-1)]">
        Qué pasa hoy en el mercado laboral
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Vacantes activas" value={String(market.total_vacantes_activas ?? '—')} />
        <Stat
          label="Salario promedio"
          value={
            market.salario_promedio
              ? formatSalary(market.salario_promedio, undefined)
              : '—'
          }
        />
        <Stat
          label="Crecimiento semanal"
          value={formatPercent(market.crecimiento_semanal_pct)}
        />
        <Stat
          label="Empresas confiables"
          value={(market.top_empresas_verdes ?? []).slice(0, 2).join(', ') || '—'}
        />
      </div>

      {(market.top_sectores ?? []).length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--fg-3)]">
            Sectores con más demanda
          </p>
          <ul className="flex flex-col gap-2">
            {market.top_sectores.slice(0, 4).map(({ sector, count }) => (
              <li
                key={sector}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm"
                style={{
                  background: 'var(--bg-1)',
                  border: '1px solid rgba(168,85,247,0.18)',
                }}
              >
                <span className="capitalize text-[color:var(--fg-1)]">{sector}</span>
                <span className="font-bold text-[color:var(--violet-300)]">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

/** @param {{ label: string, value: string }} props */
function Stat({ label, value }) {
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: 'var(--bg-1)',
        border: '1px solid rgba(168,85,247,0.18)',
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--fg-3)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-[color:var(--fg-1)]">{value}</p>
    </div>
  )
}
