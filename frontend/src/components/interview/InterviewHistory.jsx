const SKILL_COLORS = {
  React: '#38BDF8',
  Python: '#EAB308',
  SQL: '#22C55E',
  Excel: '#10B981',
  'Power BI': '#F97316',
}

function relativeDate(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'hoy'
  if (days === 1) return 'hace 1 día'
  if (days < 7) return `hace ${days} días`
  if (days < 30) return `hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`
  return `hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? 'es' : ''}`
}

function scoreColor(score) {
  if (score >= 80) return '#4ADE80'
  if (score >= 60) return '#FCD34D'
  return '#F87171'
}

function EmptyState({ onNuevaEntrevista }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ margin: '0 auto 20px' }}
      >
        <rect x="10" y="16" width="60" height="44" rx="6" stroke="rgba(168,85,247,0.4)" strokeWidth="2" fill="none" />
        <rect x="10" y="16" width="60" height="10" rx="6" fill="rgba(168,85,247,0.15)" />
        <circle cx="40" cy="48" r="12" stroke="rgba(168,85,247,0.4)" strokeWidth="2" fill="none" />
        <text x="40" y="53" textAnchor="middle" fill="rgba(168,85,247,0.6)" fontSize="14" fontWeight="700">?</text>
        <rect x="22" y="64" width="36" height="4" rx="2" fill="rgba(168,85,247,0.15)" />
      </svg>
      <h3 style={{ color: '#F1F0FB', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
        Aún no has practicado ninguna entrevista
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, margin: '0 0 24px' }}>
        La práctica hace al experto
      </p>
      <button
        type="button"
        onClick={onNuevaEntrevista}
        style={{
          backgroundColor: '#EC4899',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '12px 28px',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(236,72,153,0.35)',
        }}
      >
        Hacer mi primera entrevista
      </button>
    </div>
  )
}

export default function InterviewHistory({ historial, onVerFeedback, onNuevaEntrevista }) {
  if (!historial?.length) {
    return <EmptyState onNuevaEntrevista={onNuevaEntrevista} />
  }

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {historial.map(item => {
          const color = SKILL_COLORS[item.skill] || '#8B5CF6'
          const sc = scoreColor(item.score)
          return (
            <div
              key={item.id}
              style={{
                backgroundColor: '#1A1A24',
                border: '1px solid rgba(168,85,247,0.22)',
                borderRadius: 16,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* Skill badge */}
              <span
                style={{
                  display: 'inline-block',
                  alignSelf: 'flex-start',
                  backgroundColor: `${color}22`,
                  border: `1px solid ${color}55`,
                  color,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 999,
                }}
              >
                {item.skill}
              </span>

              {/* Score */}
              <div>
                <span
                  style={{
                    fontSize: 40,
                    fontWeight: 900,
                    color: sc,
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {item.score}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginLeft: 4 }}>/100</span>
              </div>

              {/* Mini barra */}
              <div style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${item.score}%`,
                    borderRadius: 999,
                    backgroundColor: sc,
                    boxShadow: `0 0 8px ${sc}80`,
                  }}
                />
              </div>

              {/* Fecha */}
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>
                {relativeDate(item.fecha)}
              </p>

              {/* Botón */}
              <button
                type="button"
                onClick={() => onVerFeedback(item.id)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#A855F7',
                  border: '1px solid rgba(168,85,247,0.45)',
                  borderRadius: 10,
                  padding: '8px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: 'auto',
                }}
              >
                Ver feedback
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
