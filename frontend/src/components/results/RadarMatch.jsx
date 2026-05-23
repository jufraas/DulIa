import { useEffect, useMemo, useRef, useState } from 'react'
import { jobsToRadarVacancies, profileToRadarScores } from '../../utils/radarMatchData'

const AXES = [
  { key: 'skills', name: 'Habilidades técnicas', sub: 'Stack + herramientas' },
  { key: 'exp', name: 'Experiencia', sub: 'Años · proyectos' },
  { key: 'edu', name: 'Educación', sub: 'Estudios + certs' },
  { key: 'loc', name: 'Ubicación / Modalidad', sub: 'Ciudad · modalidad' },
]

const R_MAX = 200
const N = AXES.length

function angleFor(i) {
  return -Math.PI / 2 + (i * 2 * Math.PI) / N
}

function point(value, i, scale = 1) {
  const r = (value / 100) * R_MAX * scale
  const a = angleFor(i)
  return [Math.cos(a) * r, Math.sin(a) * r]
}

function polyPoints(scores, scale = 1) {
  return AXES.map((_, i) => point(scores[AXES[i].key], i, scale).join(',')).join(' ')
}

function matchPct(profile, req) {
  const ratios = AXES.map((a) => Math.min(profile[a.key], req[a.key]) / req[a.key])
  return Math.round((ratios.reduce((s, r) => s + r, 0) / ratios.length) * 100)
}

const FALLBACK_VACANCIES = [
  {
    id: 'demo-1',
    company: 'Rappi',
    role: 'Practicante UX',
    meta: 'Bogotá · Híbrido',
    req: { skills: 70, exp: 40, edu: 70, loc: 85 },
    notes: {
      skills: 'Piden Figma + investigación. Lo tienes.',
      exp: 'Buscan al menos un proyecto real. Tu portafolio cuenta.',
      edu: 'Tu carrera aplica perfectamente.',
      loc: 'Híbrido en Bogotá. Modalidad flexible.',
    },
  },
  {
    id: 'demo-2',
    company: 'Bancolombia',
    role: 'Diseñador Jr.',
    meta: 'Medellín · Híbrido',
    req: { skills: 82, exp: 70, edu: 75, loc: 80 },
    notes: {
      skills: 'Piden design system. Te falta documentar uno propio.',
      exp: 'Buscan 1-2 años. Tienes 6 meses en proyectos. Brecha real.',
      edu: 'Carrera afín, cumples.',
      loc: 'Híbrido en Medellín. Toca negociar remoto.',
    },
  },
]

/**
 * @param {{
 *   profile?: import('../../store/useProfileStore').SavedProfile | null,
 *   jobs?: import('../../store/useProfileStore').Job[],
 *   topScore?: number,
 * }} props
 */
export default function RadarMatch({ profile = null, jobs = [], topScore = 78 }) {
  const radarProfile = useMemo(
    () => profileToRadarScores(profile, topScore),
    [profile, topScore],
  )

  const vacancies = useMemo(() => {
    const fromJobs = jobsToRadarVacancies(jobs, profile)
    return fromJobs.length > 0 ? fromJobs : FALLBACK_VACANCIES
  }, [jobs, profile])

  const [activeId, setActiveId] = useState('')

  const effectiveActiveId = useMemo(() => {
    if (vacancies.some((v) => v.id === activeId)) return activeId
    return vacancies[0]?.id ?? ''
  }, [vacancies, activeId])

  const active = vacancies.find((v) => v.id === effectiveActiveId) ?? vacancies[0]
  const svgRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current || !active) return
    const svg = svgRef.current

    const grid = svg.querySelector('#grid')
    if (!grid) return
    grid.innerHTML = ''
    ;[20, 40, 60, 80, 100].forEach((v) => {
      const pts = AXES.map((_, i) => point(v, i).join(',')).join(' ')
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
      p.setAttribute('points', pts)
      p.style.cssText = 'stroke:rgba(255,255,255,0.06);stroke-width:1;fill:none'
      grid.appendChild(p)
    })

    const axes = svg.querySelector('#axes')
    if (axes) {
      axes.innerHTML = ''
      AXES.forEach((_, i) => {
        const [x, y] = point(100, i)
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', '0')
        line.setAttribute('y1', '0')
        line.setAttribute('x2', String(x))
        line.setAttribute('y2', String(y))
        line.style.cssText = 'stroke:rgba(255,255,255,0.08);stroke-width:1'
        axes.appendChild(line)
      })
    }

    const labels = svg.querySelector('#labels')
    if (labels) {
      labels.innerHTML = ''
      AXES.forEach((a, i) => {
        const [lx, ly] = point(100, i, 1.22)
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        g.setAttribute('transform', `translate(${lx},${ly})`)
        let anchor = 'middle'
        if (i === 1) anchor = 'start'
        if (i === 3) anchor = 'end'
        const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        t1.setAttribute('text-anchor', anchor)
        t1.setAttribute('y', String(i === 0 ? -6 : i === 2 ? 12 : 0))
        t1.style.cssText =
          'font-size:13px;font-weight:600;fill:#FAFAFC;font-family:Inter,sans-serif'
        t1.textContent = a.name
        const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        t2.setAttribute('text-anchor', anchor)
        t2.setAttribute('y', String(i === 0 ? 8 : i === 2 ? 28 : 16))
        t2.style.cssText = 'font-size:11px;fill:#8A8A9B;font-family:Inter,sans-serif'
        t2.textContent = a.sub
        g.appendChild(t1)
        g.appendChild(t2)
        labels.appendChild(g)
      })
    }

    svg.querySelector('#polyReq')?.setAttribute('points', polyPoints(active.req))
    svg.querySelector('#polyYou')?.setAttribute('points', polyPoints(radarProfile))

    const gapLinks = svg.querySelector('#gapLinks')
    if (gapLinks) {
      gapLinks.innerHTML = ''
      AXES.forEach((a, i) => {
        if (radarProfile[a.key] < active.req[a.key]) {
          const [ux, uy] = point(radarProfile[a.key], i)
          const [rx, ry] = point(active.req[a.key], i)
          const l = document.createElementNS('http://www.w3.org/2000/svg', 'line')
          l.setAttribute('x1', String(ux))
          l.setAttribute('y1', String(uy))
          l.setAttribute('x2', String(rx))
          l.setAttribute('y2', String(ry))
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
    AXES.forEach((a, i) => {
      const [rx, ry] = point(active.req[a.key], i)
      const [yx, yy] = point(radarProfile[a.key], i)
      if (reqDots) {
        const rd = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        rd.setAttribute('cx', String(rx))
        rd.setAttribute('cy', String(ry))
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
  }, [active, radarProfile])

  if (!active) return null

  const pct = matchPct(radarProfile, active.req)
  const gaps = AXES.filter((a) => active.req[a.key] - radarProfile[a.key] >= 15).length

  return (
    <section className="card-dl anim-in-delay-3 mt-12 p-6 sm:p-8" aria-labelledby="radar-match-title">
      <header className="mb-6">
        <p className="eyebrow-dl mb-2">Match Radar</p>
        <h2
          id="radar-match-title"
          className="m-0 font-[family-name:var(--font-display)] text-[clamp(22px,3vw,32px)] font-extrabold tracking-[-0.02em] text-[color:var(--fg-1)]"
        >
          ¿Qué tan cerca estás de la vacante que quieres?
        </h2>
        <p className="mt-2 mb-0 text-[15px] text-[color:var(--fg-2)]">
          Comparamos tu perfil contra los requisitos reales en 4 ejes.
        </p>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vacancies.map((v) => {
          const p = matchPct(radarProfile, v.req)
          const isActive = v.id === effectiveActiveId
          const color = p >= 85 ? '#34D399' : p >= 70 ? '#FBBF24' : '#F87171'
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setActiveId(v.id)}
              className="flex items-center gap-3 rounded-2xl p-4 text-left transition-all duration-200"
              style={{
                background: isActive ? 'rgba(124,58,237,0.18)' : 'var(--bg-1)',
                border: `1px solid ${isActive ? 'rgba(168,85,247,0.55)' : 'rgba(168,85,247,0.20)'}`,
                color: 'var(--fg-1)',
                boxShadow: isActive
                  ? '0 0 0 1px rgba(168,85,247,0.20),0 8px 32px rgba(124,58,237,0.18)'
                  : 'none',
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-base font-extrabold text-white"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#C084FC)' }}
              >
                {v.company[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold">{v.role}</div>
                <div className="mt-0.5 text-[11px] text-[color:var(--fg-3)]">
                  {v.company} · {v.meta}
                </div>
              </div>
              <div
                className="shrink-0 font-[family-name:var(--font-display)] text-lg font-extrabold"
                style={{ color }}
              >
                {p}%
              </div>
            </button>
          )
        })}
      </div>

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
            <span className="text-xs text-[color:var(--fg-3)]">Tu perfil vs requisitos</span>
            <div className="flex gap-3 text-xs text-[color:var(--fg-2)]">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#C084FC)' }}
                />
                Tu perfil
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded-sm border-2 border-dashed border-[#F472B6]"
                />
                Vacante
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
              Match global <strong className="text-[color:var(--fg-1)]">{pct}%</strong>
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
          {AXES.map((a) => {
            const you = radarProfile[a.key]
            const want = active.req[a.key]
            const gap = want - you
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
                key={a.key}
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
                      {a.name}
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
                      de
                    </span>
                    <span className="text-sm text-[#F472B6]">{want}</span>
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
                      left: `${want}%`,
                      background: '#F472B6',
                      boxShadow: '0 0 8px rgba(236,72,153,0.6)',
                    }}
                  />
                </div>
                <p className="m-0 text-xs leading-relaxed text-[color:var(--fg-3)]">
                  {active.notes[a.key]}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
