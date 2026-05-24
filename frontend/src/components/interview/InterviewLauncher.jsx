import { useState } from 'react'

const SKILLS = ['React', 'Python', 'SQL', 'Excel', 'Power BI']

const ROLES = [
  'Desarrollador Jr',
  'Analista de Datos',
  'QA',
  'Product Manager',
  'Ninguno',
]

const SKILL_COLORS = {
  React: '#38BDF8',
  Python: '#EAB308',
  SQL: '#22C55E',
  Excel: '#10B981',
  'Power BI': '#F97316',
}

export default function InterviewLauncher({ onStart }) {
  const [skill, setSkill] = useState(null)
  const [rol, setRol] = useState('Ninguno')

  return (
    <div
      style={{
        backgroundColor: '#1A1A24',
        border: '1px solid rgba(168,85,247,0.30)',
        borderRadius: 22,
        padding: '36px 32px',
        maxWidth: 600,
        width: '100%',
      }}
    >
      <h2
        style={{
          color: '#F1F0FB',
          fontSize: 22,
          fontWeight: 800,
          margin: '0 0 8px',
        }}
      >
        Practica una entrevista técnica
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, margin: '0 0 28px', lineHeight: 1.5 }}>
        Elegí el skill, el rol, y DulIA te arma 5 preguntas a tu nivel.
      </p>

      {/* Skills */}
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>
        SKILL A PRACTICAR
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {SKILLS.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setSkill(s)}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              border: skill === s
                ? `2px solid ${SKILL_COLORS[s]}`
                : '2px solid rgba(255,255,255,0.12)',
              backgroundColor: skill === s
                ? `${SKILL_COLORS[s]}22`
                : 'rgba(255,255,255,0.04)',
              color: skill === s ? SKILL_COLORS[s] : 'rgba(255,255,255,0.6)',
              transition: 'all 0.15s',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Rol */}
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>
        ROL (OPCIONAL)
      </p>
      <select
        value={rol}
        onChange={e => setRol(e.target.value)}
        style={{
          width: '100%',
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          padding: '11px 14px',
          color: '#F1F0FB',
          fontSize: 15,
          outline: 'none',
          marginBottom: 24,
          cursor: 'pointer',
        }}
      >
        {ROLES.map(r => (
          <option key={r} value={r} style={{ backgroundColor: '#1A1A24' }}>
            {r}
          </option>
        ))}
      </select>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
        {[
          { label: '~10 min', sub: 'Duración estimada' },
          { label: '5', sub: 'Preguntas técnicas' },
          { label: 'IA', sub: 'Feedback personalizado' },
        ].map(card => (
          <div
            key={card.label}
            style={{
              backgroundColor: 'rgba(168,85,247,0.08)',
              border: '1px solid rgba(168,85,247,0.2)',
              borderRadius: 12,
              padding: '12px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#C4B5FD', fontSize: 20, fontWeight: 800, margin: 0 }}>{card.label}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '4px 0 0' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        type="button"
        disabled={!skill}
        onClick={() => skill && onStart(skill, rol)}
        style={{
          width: '100%',
          backgroundColor: skill ? '#EC4899' : 'rgba(236,72,153,0.3)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '14px',
          fontSize: 16,
          fontWeight: 700,
          cursor: skill ? 'pointer' : 'not-allowed',
          opacity: skill ? 1 : 0.5,
          transition: 'all 0.15s',
          boxShadow: skill ? '0 4px 20px rgba(236,72,153,0.35)' : 'none',
        }}
      >
        Iniciar entrevista
      </button>
    </div>
  )
}
