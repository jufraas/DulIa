import { useState, useEffect } from 'react'
import ScoreRing from '../brand/ScoreRing'

function scoreBadgeStyle(score) {
  if (score >= 80) return { bg: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ADE80' }
  if (score >= 60) return { bg: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)', color: '#FCD34D' }
  return { bg: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#F87171' }
}

function levelBadgeStyle(nivel) {
  const map = {
    'Avanzado': { bg: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ADE80' },
    'Intermedio': { bg: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)', color: '#FCD34D' },
    'Básico': { bg: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#F87171' },
  }
  return map[nivel] ?? map['Básico']
}

const card = {
  backgroundColor: '#1A1A24',
  border: '1px solid rgba(168,85,247,0.25)',
  borderRadius: 18,
  padding: '24px',
  marginBottom: 16,
}

export default function InterviewResults({ resultado, onAddToPlan, onNewInterview }) {
  const [displayScore, setDisplayScore] = useState(0)
  const [openIndexes, setOpenIndexes] = useState(new Set([0]))

  useEffect(() => {
    const steps = 60
    const duration = 1200
    const increment = resultado.score / steps
    let current = 0
    const id = setInterval(() => {
      current += increment
      if (current >= resultado.score) {
        setDisplayScore(resultado.score)
        clearInterval(id)
      } else {
        setDisplayScore(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(id)
  }, [resultado.score])

  function toggleIndex(i) {
    setOpenIndexes(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const lvlStyle = levelBadgeStyle(resultado.nivel)

  return (
    <div style={{ maxWidth: 680, width: '100%' }}>

      {/* Score + ring */}
      <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', padding: '36px 24px' }}>
        <ScoreRing value={displayScore} size={180} stroke={14} animate={false} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              backgroundColor: lvlStyle.bg,
              border: lvlStyle.border,
              color: lvlStyle.color,
              fontSize: 13,
              fontWeight: 700,
              padding: '5px 16px',
              borderRadius: 999,
            }}
          >
            {resultado.nivel}
          </span>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, margin: 0 }}>
          Completaste la entrevista de <strong style={{ color: '#F1F0FB' }}>{resultado.skill}</strong>
        </p>
      </div>

      {/* Skills débiles */}
      {resultado.weakSkills?.length > 0 && (
        <div style={card}>
          <p style={{ color: '#F1F0FB', fontWeight: 700, fontSize: 15, margin: '0 0 14px' }}>
            Skills a reforzar
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {resultado.weakSkills.map(s => (
              <span
                key={s}
                style={{
                  backgroundColor: 'rgba(234,179,8,0.12)',
                  border: '1px solid rgba(234,179,8,0.35)',
                  color: '#FCD34D',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '5px 12px',
                  borderRadius: 999,
                }}
              >
                ⚠ {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA agregar al plan */}
      <button
        type="button"
        onClick={onAddToPlan}
        style={{
          width: '100%',
          backgroundColor: '#EC4899',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '14px',
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: 16,
          boxShadow: '0 4px 20px rgba(236,72,153,0.35)',
        }}
      >
        Agregar skills débiles a mi plan 30 días
      </button>

      {/* Acordeón de preguntas */}
      <div style={card}>
        <p style={{ color: '#F1F0FB', fontWeight: 700, fontSize: 15, margin: '0 0 14px' }}>
          Feedback por pregunta
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {resultado.feedback.map((item, i) => {
            const isOpen = openIndexes.has(i)
            const bs = scoreBadgeStyle(item.score)
            return (
              <div
                key={i}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: isOpen ? 'rgba(168,85,247,0.08)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    gap: 12,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600 }}>
                    Pregunta {i + 1}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span
                      style={{
                        backgroundColor: bs.bg,
                        border: bs.border,
                        color: bs.color,
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '2px 10px',
                        borderRadius: 999,
                      }}
                    >
                      {item.score}/100
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, margin: '14px 0 8px', fontStyle: 'italic' }}>
                      {item.pregunta}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', margin: '12px 0 4px' }}>
                      FEEDBACK DULIA
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                      {item.texto}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Botón secundario */}
      <button
        type="button"
        onClick={onNewInterview}
        style={{
          width: '100%',
          backgroundColor: 'transparent',
          color: 'rgba(255,255,255,0.65)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 12,
          padding: '13px',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Practicar otra entrevista
      </button>
    </div>
  )
}
