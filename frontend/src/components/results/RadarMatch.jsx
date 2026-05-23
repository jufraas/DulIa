import { useState, useEffect, useRef } from 'react'

const AXES = [
  { key: 'skills', name: 'Habilidades técnicas', sub: 'Stack + herramientas' },
  { key: 'exp',    name: 'Experiencia',           sub: 'Años · proyectos'    },
  { key: 'edu',    name: 'Educación',             sub: 'Estudios + certs'    },
  { key: 'loc',    name: 'Ubicación / Modalidad', sub: 'Ciudad · modalidad'  },
]

const R_MAX = 200
const N = AXES.length

function angleFor(i) { return -Math.PI / 2 + (i * 2 * Math.PI) / N }
function point(value, i, scale = 1) {
  const r = (value / 100) * R_MAX * scale
  const a = angleFor(i)
  return [Math.cos(a) * r, Math.sin(a) * r]
}
function polyPoints(scores, scale = 1) {
  return AXES.map((_, i) => point(scores[AXES[i].key], i, scale).join(',')).join(' ')
}
function matchPct(profile, req) {
  const ratios = AXES.map(a => Math.min(profile[a.key], req[a.key]) / req[a.key])
  return Math.round((ratios.reduce((s, r) => s + r, 0) / ratios.length) * 100)
}

// ─── DATOS MOCK — reemplazar con datos reales del backend ───
const DEFAULT_PROFILE = { skills: 78, exp: 52, edu: 86, loc: 92 }

const DEFAULT_VACANCIES = [
  {
    id: 'rappi', company: 'Rappi', role: 'Practicante UX', meta: 'Bogotá · Híbrido',
    req: { skills: 70, exp: 40, edu: 70, loc: 85 },
    notes: {
      skills: 'Piden Figma + investigación. Lo tienes.',
      exp:    'Buscan al menos un proyecto real. Tu portafolio cuenta.',
      edu:    'Tu carrera aplica perfectamente.',
      loc:    'Híbrido en Bogotá. Modalidad flexible.',
    }
  },
  {
    id: 'bancolombia', company: 'Bancolombia', role: 'Diseñador Jr.', meta: 'Medellín · Híbrido',
    req: { skills: 82, exp: 70, edu: 75, loc: 80 },
    notes: {
      skills: 'Piden design system. Te falta documentar uno propio.',
      exp:    'Buscan 1-2 años. Tienes 6 meses en proyectos. Brecha real.',
      edu:    'Carrera afín, cumples.',
      loc:    'Híbrido en Medellín. Toca negociar remoto.',
    }
  },
  {
    id: 'mercadolibre', company: 'Mercado Libre', role: 'UX Researcher Jr.', meta: 'Remoto Colombia',
    req: { skills: 75, exp: 60, edu: 80, loc: 60 },
    notes: {
      skills: 'Piden research + inglés B2. Sube tu nivel de inglés.',
      exp:    'Quieren 1 año mínimo. Vas justo.',
      edu:    'Cumples con carrera afín.',
      loc:    '100% remoto. Cualquier ciudad funciona.',
    }
  },
]
// ─────────────────────────────────────────────────────────────

export default function RadarMatch({ profile = DEFAULT_PROFILE, vacancies = DEFAULT_VACANCIES }) {
  const [activeId, setActiveId] = useState(vacancies[0].id)
  const svgRef = useRef(null)

  const active = vacancies.find(v => v.id === activeId)
  const pct = matchPct(profile, active.req)
  const gaps = AXES.filter(a => active.req[a.key] - profile[a.key] >= 15).length

  useEffect(() => {
    if (!svgRef.current) return
    const svg = svgRef.current

    // Grid
    const grid = svg.querySelector('#grid')
    grid.innerHTML = ''
    ;[20, 40, 60, 80, 100].forEach(v => {
      const pts = AXES.map((_, i) => point(v, i).join(',')).join(' ')
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
      p.setAttribute('points', pts)
      p.style.cssText = 'stroke:rgba(255,255,255,0.06);stroke-width:1;fill:none'
      grid.appendChild(p)
    })

    // Axes
    const axes = svg.querySelector('#axes')
    axes.innerHTML = ''
    AXES.forEach((_, i) => {
      const [x, y] = point(100, i)
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', 0); line.setAttribute('y1', 0)
      line.setAttribute('x2', x); line.setAttribute('y2', y)
      line.style.cssText = 'stroke:rgba(255,255,255,0.08);stroke-width:1'
      axes.appendChild(line)
    })

    // Labels
    const labels = svg.querySelector('#labels')
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
      t1.setAttribute('y', i === 0 ? -6 : i === 2 ? 12 : 0)
      t1.style.cssText = 'font-size:13px;font-weight:600;fill:#FAFAFC;font-family:Inter,sans-serif'
      t1.textContent = a.name
      const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      t2.setAttribute('text-anchor', anchor)
      t2.setAttribute('y', i === 0 ? 8 : i === 2 ? 28 : 16)
      t2.style.cssText = 'font-size:11px;fill:#8A8A9B;font-family:Inter,sans-serif'
      t2.textContent = a.sub
      g.appendChild(t1); g.appendChild(t2)
      labels.appendChild(g)
    })

    // Polygons
    svg.querySelector('#polyReq').setAttribute('points', polyPoints(active.req))
    svg.querySelector('#polyYou').setAttribute('points', polyPoints(profile))

    // Gap links
    const gapLinks = svg.querySelector('#gapLinks')
    gapLinks.innerHTML = ''
    AXES.forEach((a, i) => {
      if (profile[a.key] < active.req[a.key]) {
        const [ux, uy] = point(profile[a.key], i)
        const [rx, ry] = point(active.req[a.key], i)
        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        l.setAttribute('x1', ux); l.setAttribute('y1', uy)
        l.setAttribute('x2', rx); l.setAttribute('y2', ry)
        l.style.cssText = 'stroke:#EC4899;stroke-width:1.5;stroke-dasharray:2 3;opacity:0.55'
        gapLinks.appendChild(l)
      }
    })

    // Dots
    const reqDots = svg.querySelector('#reqDots')
    const youDots = svg.querySelector('#youDots')
    reqDots.innerHTML = ''; youDots.innerHTML = ''
    AXES.forEach((a, i) => {
      const [rx, ry] = point(active.req[a.key], i)
      const [yx, yy] = point(profile[a.key], i)
      const rd = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      rd.setAttribute('cx', rx); rd.setAttribute('cy', ry); rd.setAttribute('r', 4)
      rd.style.cssText = 'fill:#F472B6;stroke:#0D0D0D;stroke-width:2'
      reqDots.appendChild(rd)
      const yd = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      yd.setAttribute('cx', yx); yd.setAttribute('cy', yy); yd.setAttribute('r', 6)
      yd.style.cssText = 'fill:#fff;stroke:#C084FC;stroke-width:3'
      youDots.appendChild(yd)
    })
  }, [activeId, profile])

  return (
    <div style={{ background: 'var(--bg-1, #131319)', borderRadius: 24, padding: '32px', marginTop: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C084FC', marginBottom: 8 }}>
          ◆ Match Radar
        </p>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(22px,3vw,32px)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          ¿Qué tan cerca estás de la vacante que quieres?
        </h2>
        <p style={{ color: '#C9C9D6', fontSize: 15, margin: 0 }}>
          Comparamos tu perfil contra los requisitos reales en 4 ejes.
        </p>
      </div>

      {/* Vacancy tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        {vacancies.map(v => {
          const p = matchPct(profile, v.req)
          const isActive = v.id === activeId
          const color = p >= 85 ? '#34D399' : p >= 70 ? '#FBBF24' : '#F87171'
          return (
            <button key={v.id} onClick={() => setActiveId(v.id)}
              style={{
                textAlign: 'left', background: isActive ? 'rgba(124,58,237,0.18)' : 'var(--bg-2,#1A1A24)',
                border: `1px solid ${isActive ? 'rgba(168,85,247,0.55)' : 'rgba(168,85,247,0.20)'}`,
                borderRadius: 16, padding: '14px 16px', cursor: 'pointer', color: 'var(--fg-1,#FAFAFC)',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: isActive ? '0 0 0 1px rgba(168,85,247,0.20),0 8px 32px rgba(124,58,237,0.18)' : 'none',
                transition: 'all 220ms ease'
              }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#7C3AED,#C084FC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff', flexShrink: 0 }}>
                {v.company[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{v.role}</div>
                <div style={{ fontSize: 11, color: '#8A8A9B', marginTop: 2 }}>{v.company} · {v.meta}</div>
              </div>
              <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 18, color, flexShrink: 0 }}>{p}%</div>
            </button>
          )
        })}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 24, alignItems: 'start' }}>
        {/* Radar SVG */}
        <div style={{ background: 'var(--bg-2,#1A1A24)', border: '1px solid rgba(168,85,247,0.35)', borderRadius: 20, padding: '24px', boxShadow: '0 0 0 1px rgba(168,85,247,0.20),0 8px 32px rgba(124,58,237,0.18)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#8A8A9B' }}>Tu perfil vs requisitos</span>
            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#C9C9D6' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(135deg,#7C3AED,#C084FC)', display: 'inline-block' }} />
                Tu perfil
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, border: '2px dashed #F472B6', display: 'inline-block' }} />
                Vacante
              </span>
            </div>
          </div>

          <svg ref={svgRef} viewBox="-320 -270 640 540" style={{ width: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="youFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#7C3AED" stopOpacity="0.55"/>
                <stop offset="55%"  stopColor="#A855F7" stopOpacity="0.40"/>
                <stop offset="100%" stopColor="#C084FC" stopOpacity="0.28"/>
              </linearGradient>
              <linearGradient id="youStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#C084FC"/>
                <stop offset="50%"  stopColor="#A855F7"/>
                <stop offset="100%" stopColor="#EC4899"/>
              </linearGradient>
            </defs>
            <g id="grid"/>
            <g id="axes"/>
            <polygon id="polyReq" style={{ fill: 'none', stroke: '#F472B6', strokeWidth: 2, strokeDasharray: '6 5', filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.4))', transition: 'all 800ms ease' }} points=""/>
            <g id="gapLinks"/>
            <polygon id="polyYou" style={{ fill: 'url(#youFill)', stroke: 'url(#youStroke)', strokeWidth: 2.5, strokeLinejoin: 'round', filter: 'drop-shadow(0 0 16px rgba(168,85,247,0.55))', transition: 'all 800ms ease' }} points=""/>
            <g id="reqDots"/>
            <g id="youDots"/>
            <g id="labels"/>
          </svg>

          {/* Footer */}
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(13,13,13,0.5)', border: '1px solid rgba(168,85,247,0.20)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#C9C9D6' }}>
              Match global <strong style={{ color: '#FAFAFC' }}>{pct}%</strong> · <span style={{ color: '#F472B6' }}>{gaps === 0 ? 'Sin brechas críticas' : gaps === 1 ? '1 brecha activa' : `${gaps} brechas activas`}</span>
            </span>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {AXES.map(a => {
            const you = profile[a.key]
            const want = active.req[a.key]
            const gap = want - you
            let tag, tagColor, tagBg, isGap = false
            if (gap <= -10)    { tag = 'Lo superas'; tagColor = '#34D399'; tagBg = 'rgba(52,211,153,0.14)' }
            else if (gap <= 0) { tag = 'Cumples';    tagColor = '#34D399'; tagBg = 'rgba(52,211,153,0.14)' }
            else if (gap < 15) { tag = 'Cerca';      tagColor = '#FBBF24'; tagBg = 'rgba(251,191,36,0.14)'; }
            else               { tag = 'Brecha';     tagColor = '#F472B6'; tagBg = 'rgba(236,72,153,0.16)'; isGap = true }

            return (
              <div key={a.key} style={{
                background: 'var(--bg-2,#1A1A24)',
                border: `1px solid ${isGap ? 'rgba(236,72,153,0.35)' : 'rgba(168,85,247,0.25)'}`,
                borderLeft: isGap ? '3px solid #EC4899' : undefined,
                borderRadius: 16, padding: '16px 18px',
                boxShadow: '0 0 0 1px rgba(168,85,247,0.10)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: '#FAFAFC' }}>{a.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 999, marginLeft: 8, background: tagBg, color: tagColor }}>{tag}</span>
                  </div>
                  <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 16, color: '#FAFAFC' }}>
                    {you}<span style={{ color: '#5A5A6B', fontWeight: 500, fontSize: 13, margin: '0 4px' }}>de</span><span style={{ color: '#F472B6', fontSize: 14 }}>{want}</span>
                  </div>
                </div>
                {/* Bar */}
                <div style={{ position: 'relative', height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.05)', marginBottom: 10 }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${you}%`, borderRadius: 999, background: 'linear-gradient(90deg,#7C3AED,#A855F7)', boxShadow: '0 0 10px rgba(168,85,247,0.4)', transition: 'width 800ms ease' }}/>
                  <div style={{ position: 'absolute', top: -4, bottom: -4, left: `${want}%`, width: 3, background: '#F472B6', borderRadius: 2, boxShadow: '0 0 8px rgba(236,72,153,0.6)', transition: 'left 800ms ease' }}/>
                </div>
                <p style={{ fontSize: 12, color: '#8A8A9B', margin: 0, lineHeight: 1.5 }}
                   dangerouslySetInnerHTML={{ __html: active.notes[a.key] }}/>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
