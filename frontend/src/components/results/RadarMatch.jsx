import { useEffect, useMemo, useRef } from 'react'
import { buildMockRadarFromProfile } from '../../services/mockResultsBundle'
import { radarAxesFromApi } from '../../utils/radarApi'

const R_MAX = 200

function angleFor(i, total) {
  return -Math.PI / 2 + (i * 2 * Math.PI) / total
}

function point(value, i, total, scale = 1) {
  const r = (value / 100) * R_MAX * scale
  const a = angleFor(i, total)
  return [Math.cos(a) * r, Math.sin(a) * r]
}

function polyPoints(scores, axes, scale = 1) {
  return axes
    .map((axis, i) => point(scores[axis.key] ?? 0, i, axes.length, scale).join(','))
    .join(' ')
}

function matchPct(userScores, refScores, axes) {
  const ratios = axes.map((axis) => {
    const req = refScores[axis.key] ?? 1
    const val = userScores[axis.key] ?? 0
    return Math.min(val, req) / Math.max(req, 1)
  })
  return Math.round((ratios.reduce((s, r) => s + r, 0) / ratios.length) * 100)
}

/**
 * @param {{
 *   profile?: import('../../store/useProfileStore').SavedProfile | null,
 *   jobs?: import('../../store/useProfileStore').Job[],
 *   radar?: import('../../utils/radarApi').RadarChartData | null,
 * }} props
 */
export default function RadarMatch({ profile = null, jobs = [], radar = null }) {
  const chartData = useMemo(
    () => radar ?? buildMockRadarFromProfile(profile, jobs),
    [radar, profile, jobs],
  )

  const axes = useMemo(() => radarAxesFromApi(chartData), [chartData])

  const jobCards = useMemo(
    () =>
      [...jobs]
        .sort((a, b) => (b.score_compatibilidad ?? 0) - (a.score_compatibilidad ?? 0))
        .slice(0, 3)
        .map((job) => ({
          id: String(job.id),
          company: job.empresa || 'Empresa',
          role: job.titulo || 'Vacante',
          meta: [job.ciudad, job.modalidad].filter(Boolean).join(' · ') || 'Colombia',
          score: job.score_compatibilidad ?? 0,
        })),
    [jobs],
  )

  const svgRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current || !chartData || !axes.length) return
    const svg = svgRef.current
    const userScores = chartData.usuario
    const marketScores = chartData.mercado
    const n = axes.length

    const grid = svg.querySelector('#grid')
    if (!grid) return
    grid.innerHTML = ''
    ;[20, 40, 60, 80, 100].forEach((v) => {
      const pts = axes.map((_, i) => point(v, i, n).join(',')).join(' ')
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
      p.setAttribute('points', pts)
      p.style.cssText = 'stroke:rgba(255,255,255,0.06);stroke-width:1;fill:none'
      grid.appendChild(p)
    })

    const axesGroup = svg.querySelector('#axes')
    if (axesGroup) {
      axesGroup.innerHTML = ''
      axes.forEach((_, i) => {
        const [x, y] = point(100, i, n)
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', '0')
        line.setAttribute('y1', '0')
        line.setAttribute('x2', String(x))
        line.setAttribute('y2', String(y))
        line.style.cssText = 'stroke:rgba(255,255,255,0.08);stroke-width:1'
        axesGroup.appendChild(line)
      })
    }

    const labels = svg.querySelector('#labels')
    if (labels) {
      labels.innerHTML = ''
      axes.forEach((axis, i) => {
        const [lx, ly] = point(100, i, n, 1.22)
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        g.setAttribute('transform', `translate(${lx},${ly})`)
        const anchor = i === 0 ? 'middle' : i < n / 2 ? 'start' : 'end'
        const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        t1.setAttribute('text-anchor', anchor)
        t1.setAttribute('y', i === 0 ? -6 : 0)
        t1.style.cssText =
          'font-size:12px;font-weight:600;fill:#FAFAFC;font-family:Inter,sans-serif'
        t1.textContent = axis.name
        const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        t2.setAttribute('text-anchor', anchor)
        t2.setAttribute('y', i === 0 ? 10 : 14)
        t2.style.cssText = 'font-size:10px;fill:#8A8A9B;font-family:Inter,sans-serif'
        t2.textContent = axis.sub
        g.appendChild(t1)
        g.appendChild(t2)
        labels.appendChild(g)
      })
    }

    svg.querySelector('#polyReq')?.setAttribute('points', polyPoints(marketScores, axes))
    svg.querySelector('#polyYou')?.setAttribute('points', polyPoints(userScores, axes))

    const gapLinks = svg.querySelector('#gapLinks')
    if (gapLinks) {
      gapLinks.innerHTML = ''
      axes.forEach((axis, i) => {
        const you = userScores[axis.key] ?? 0
        const market = marketScores[axis.key] ?? 0
        if (you < market) {
          const [ux, uy] = point(you, i, n)
          const [mx, my] = point(market, i, n)
          const l = document.createElementNS('http://www.w3.org/2000/svg', 'line')
          l.setAttribute('x1', String(ux))
          l.setAttribute('y1', String(uy))
          l.setAttribute('x2', String(mx))
          l.setAttribute('y2', String(my))
          l.style.cssText =
            'stroke:#EC4899;stroke-width:1.5;stroke-dasharray:2 3;opacity:0.55'
          gapLinks.appendChild(l)
        }
      })
    }

    const reqDots = svg.querySelector('#reqDots')
    const youDots = svg.querySelector('#youDots')
    if (reqDots) reqDots.innerHTML = ''
    if (youDots) youDots.innerHTML = ''
    axes.forEach((axis, i) => {
      const market = marketScores[axis.key] ?? 0
      const you = userScores[axis.key] ?? 0
      const [mx, my] = point(market, i, n)
      const [yx, yy] = point(you, i, n)
      if (reqDots) {
        const rd = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        rd.setAttribute('cx', String(mx))
        rd.setAttribute('cy', String(my))
        rd.setAttribute('r', '4')
        rd.style.cssText = 'fill:#F472B6;stroke:#0D0D0D;stroke-width:2'
        reqDots.appendChild(rd)
      }
      if (youDots) {
        const yd = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        yd.setAttribute('cx', String(yx))
        yd.setAttribute('cy', String(yy))
        yd.setAttribute('r', '6')
        yd.style.cssText = 'fill:#fff;stroke:#C084FC;stroke-width:3'
        youDots.appendChild(yd)
      }
    })
  }, [chartData, axes])

  if (!chartData || !axes.length) {
    return (
      <section className="card-dl anim-in-delay-3 mt-12 p-6 sm:p-8">
        <p className="eyebrow-dl mb-2">Match Radar</p>
        <p className="m-0 text-[15px] text-[color:var(--fg-2)]">
          Completa el wizard para ver tu radar de compatibilidad con el mercado.
        </p>
      </section>
    )
  }

  const userScores = chartData.usuario
  const marketScores = chartData.mercado
  const pct = matchPct(userScores, marketScores, axes)
  const gaps = axes.filter(
    (axis) => (marketScores[axis.key] ?? 0) - (userScores[axis.key] ?? 0) >= 15,
  ).length

  return (
    <section className="card-dl anim-in-delay-3 mt-12 p-6 sm:p-8" aria-labelledby="radar-match-title">
      <header className="mb-6">
        <p className="eyebrow-dl mb-2">Match Radar</p>
        <h2
          id="radar-match-title"
          className="m-0 font-[family-name:var(--font-display)] text-[clamp(22px,3vw,32px)] font-extrabold tracking-[-0.02em] text-[color:var(--fg-1)]"
        >
          ¿Qué tan cerca estás del mercado laboral?
        </h2>
        <p className="mt-2 mb-0 text-[15px] text-[color:var(--fg-2)]">
          Tu perfil vs el promedio del mercado en {axes.length} dimensiones (datos del backend).
        </p>
      </header>

      {jobCards.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {jobCards.map((job) => {
            const color =
              job.score >= 85 ? '#34D399' : job.score >= 70 ? '#FBBF24' : '#F87171'
            return (
              <div
                key={job.id}
                className="flex items-center gap-3 rounded-2xl p-4"
                style={{
                  background: 'var(--bg-1)',
                  border: '1px solid rgba(168,85,247,0.20)',
                }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-base font-extrabold text-white"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#C084FC)' }}
                >
                  {job.company[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold">{job.role}</div>
                  <div className="mt-0.5 text-[11px] text-[color:var(--fg-3)]">
                    {job.company} · {job.meta}
                  </div>
                </div>
                <div
                  className="shrink-0 font-[family-name:var(--font-display)] text-lg font-extrabold"
                  style={{ color }}
                >
                  {job.score}%
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div
          className="rounded-[20px] p-5 sm:p-6"
          style={{
            background: 'var(--bg-1)',
            border: '1px solid rgba(168,85,247,0.35)',
            boxShadow: 'var(--glow-violet-strong)',
          }}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-[color:var(--fg-3)]">Tu perfil vs mercado</span>
            <div className="flex gap-3 text-xs text-[color:var(--fg-2)]">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#C084FC)' }}
                />
                Tu perfil
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm border-2 border-dashed border-[#F472B6]" />
                Mercado
              </span>
            </div>
          </div>

          <svg ref={svgRef} viewBox="-320 -270 640 540" className="w-full overflow-visible">
            <defs>
              <linearGradient id="radarYouFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.55" />
                <stop offset="55%" stopColor="#A855F7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#C084FC" stopOpacity="0.28" />
              </linearGradient>
              <linearGradient id="radarYouStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#C084FC" />
                <stop offset="50%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <g id="grid" />
            <g id="axes" />
            <polygon
              id="polyReq"
              points=""
              style={{
                fill: 'none',
                stroke: '#F472B6',
                strokeWidth: 2,
                strokeDasharray: '6 5',
                filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.4))',
                transition: 'all 800ms ease',
              }}
            />
            <g id="gapLinks" />
            <polygon
              id="polyYou"
              points=""
              style={{
                fill: 'url(#radarYouFill)',
                stroke: 'url(#radarYouStroke)',
                strokeWidth: 2.5,
                strokeLinejoin: 'round',
                filter: 'drop-shadow(0 0 16px rgba(168,85,247,0.55))',
                transition: 'all 800ms ease',
              }}
            />
            <g id="reqDots" />
            <g id="youDots" />
            <g id="labels" />
          </svg>

          <div
            className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3 text-[13px] text-[color:var(--fg-2)]"
            style={{
              background: 'rgba(13,13,13,0.5)',
              border: '1px solid rgba(168,85,247,0.20)',
            }}
          >
            <span>
              Alineación con mercado{' '}
              <strong className="text-[color:var(--fg-1)]">{pct}%</strong>
            </span>
            <span style={{ color: '#F472B6' }}>
              {gaps === 0
                ? 'Sin brechas críticas'
                : gaps === 1
                  ? '1 brecha activa'
                  : `${gaps} brechas activas`}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {axes.map((axis) => {
            const you = userScores[axis.key] ?? 0
            const market = marketScores[axis.key] ?? 0
            const gap = market - you
            let tag
            let tagColor
            let tagBg
            let isGap = false
            if (gap <= -10) {
              tag = 'Lo superas'
              tagColor = '#34D399'
              tagBg = 'rgba(52,211,153,0.14)'
            } else if (gap <= 0) {
              tag = 'Cumples'
              tagColor = '#34D399'
              tagBg = 'rgba(52,211,153,0.14)'
            } else if (gap < 15) {
              tag = 'Cerca'
              tagColor = '#FBBF24'
              tagBg = 'rgba(251,191,36,0.14)'
            } else {
              tag = 'Brecha'
              tagColor = '#F472B6'
              tagBg = 'rgba(236,72,153,0.16)'
              isGap = true
            }

            return (
              <div
                key={axis.key}
                className="rounded-2xl px-4 py-4 sm:px-[18px]"
                style={{
                  background: 'var(--bg-1)',
                  border: `1px solid ${isGap ? 'rgba(236,72,153,0.35)' : 'rgba(168,85,247,0.25)'}`,
                  borderLeft: isGap ? '3px solid #EC4899' : undefined,
                }}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-[family-name:var(--font-display)] text-[15px] font-bold text-[color:var(--fg-1)]">
                      {axis.name}
                    </span>
                    <span
                      className="ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                      style={{ background: tagBg, color: tagColor }}
                    >
                      {tag}
                    </span>
                  </div>
                  <div className="font-[family-name:var(--font-display)] text-base font-extrabold text-[color:var(--fg-1)]">
                    {you}
                    <span className="mx-1 text-[13px] font-medium text-[color:var(--fg-3)]">
                      vs
                    </span>
                    <span className="text-sm text-[#F472B6]">{market}</span>
                  </div>
                </div>
                <div
                  className="relative mb-2.5 h-2 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
                    style={{
                      width: `${you}%`,
                      background: 'linear-gradient(90deg,#7C3AED,#A855F7)',
                      boxShadow: '0 0 10px rgba(168,85,247,0.4)',
                    }}
                  />
                  <div
                    className="absolute -top-1 -bottom-1 w-0.5 rounded-sm transition-[left] duration-700 ease-out"
                    style={{
                      left: `${market}%`,
                      background: '#F472B6',
                      boxShadow: '0 0 8px rgba(236,72,153,0.6)',
                    }}
                  />
                </div>
                <p className="m-0 text-xs leading-relaxed text-[color:var(--fg-3)]">
                  {chartData.descriptions?.[axis.key] ?? axis.sub}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
