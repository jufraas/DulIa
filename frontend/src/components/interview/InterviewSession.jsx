import { useState, useEffect } from 'react'

const TIMER_TOTAL = 300
const TIMER_SIZE = 68
const TIMER_STROKE = 5
const TIMER_R = (TIMER_SIZE - TIMER_STROKE) / 2
const TIMER_CIRC = 2 * Math.PI * TIMER_R

const SKILL_COLORS = {
  React: '#38BDF8',
  Python: '#EAB308',
  SQL: '#22C55E',
  Excel: '#10B981',
  'Power BI': '#F97316',
}

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function InterviewSession({ skill, rol, questions, onFinish }) {
  const [pregunta, setPregunta] = useState(0)
  const [respuestas, setRespuestas] = useState(Array(questions.length).fill(''))
  const [timer, setTimer] = useState(TIMER_TOTAL)
  const [finalizado, setFinalizado] = useState(false)

  const texto = respuestas[pregunta] ?? ''
  const esUltima = pregunta === questions.length - 1
  const habil = texto.length >= 20

  useEffect(() => {
    if (finalizado) return undefined
    const id = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(id); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [finalizado])

  function setTexto(val) {
    setRespuestas(prev => {
      const next = [...prev]
      next[pregunta] = val
      return next
    })
  }

  function avanzar() {
    if (!habil) return
    if (esUltima) {
      setFinalizado(true)
      onFinish(respuestas)
      return
    }
    setPregunta(p => p + 1)
  }

  const timerOffset = TIMER_CIRC * (timer / TIMER_TOTAL)
  const timerColor = timer < 60 ? '#EF4444' : '#8B5CF6'
  const skillColor = SKILL_COLORS[skill] || '#8B5CF6'

  return (
    <div
      style={{
        backgroundColor: '#1A1A24',
        border: '1px solid rgba(168,85,247,0.30)',
        borderRadius: 22,
        padding: '32px',
        maxWidth: 680,
        width: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ color: '#F1F0FB', fontSize: 18, fontWeight: 800, margin: 0 }}>
            Entrevista: {skill}
          </h2>
          <span
            style={{
              backgroundColor: `${skillColor}22`,
              border: `1px solid ${skillColor}66`,
              color: skillColor,
              fontSize: 12,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 999,
            }}
          >
            {skill}
          </span>
          {rol && rol !== 'Ninguno' && (
            <span
              style={{
                backgroundColor: 'rgba(168,85,247,0.12)',
                border: '1px solid rgba(168,85,247,0.3)',
                color: '#C4B5FD',
                fontSize: 12,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 999,
              }}
            >
              {rol}
            </span>
          )}
        </div>

        {/* Timer circular */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg
            width={TIMER_SIZE}
            height={TIMER_SIZE}
            className={timer < 60 ? 'animate-pulse' : ''}
          >
            <circle
              cx={TIMER_SIZE / 2}
              cy={TIMER_SIZE / 2}
              r={TIMER_R}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={TIMER_STROKE}
            />
            <circle
              cx={TIMER_SIZE / 2}
              cy={TIMER_SIZE / 2}
              r={TIMER_R}
              fill="none"
              stroke={timerColor}
              strokeWidth={TIMER_STROKE}
              strokeLinecap="round"
              strokeDasharray={TIMER_CIRC}
              strokeDashoffset={TIMER_CIRC - timerOffset}
              transform={`rotate(-90 ${TIMER_SIZE / 2} ${TIMER_SIZE / 2})`}
              style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: timerColor,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatTime(timer)}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
        {questions.map((_, i) => {
          const done = i < pregunta
          const active = i === pregunta
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  backgroundColor: done
                    ? 'rgba(34,197,94,0.15)'
                    : active
                    ? 'rgba(168,85,247,0.2)'
                    : 'rgba(255,255,255,0.05)',
                  border: done
                    ? '2px solid #22C55E'
                    : active
                    ? '2px solid #A855F7'
                    : '2px solid rgba(255,255,255,0.12)',
                  color: done ? '#22C55E' : active ? '#C4B5FD' : 'rgba(255,255,255,0.3)',
                  boxShadow: active ? '0 0 12px rgba(168,85,247,0.4)' : 'none',
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              {i < questions.length - 1 && (
                <div
                  style={{
                    width: 40,
                    height: 2,
                    backgroundColor: done ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)',
                    transition: 'background-color 0.2s',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Pregunta */}
      <p
        style={{
          color: '#F1F0FB',
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1.5,
          margin: '0 0 20px',
          minHeight: 60,
        }}
      >
        {questions[pregunta]}
      </p>

      {/* Textarea */}
      <textarea
        rows={6}
        value={texto}
        onChange={e => setTexto(e.target.value)}
        placeholder="Escribe tu respuesta... (mínimo 20 caracteres)"
        style={{
          width: '100%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: `1px solid ${habil ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 12,
          padding: '14px',
          color: '#F1F0FB',
          fontSize: 15,
          lineHeight: 1.6,
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
          fontFamily: 'inherit',
        }}
      />

      {/* Contador */}
      <p style={{ color: habil ? '#22C55E' : 'rgba(255,255,255,0.35)', fontSize: 13, margin: '8px 0 20px', textAlign: 'right' }}>
        {texto.length} / 20 mínimo {habil ? '✓' : ''}
      </p>

      {/* Botón siguiente */}
      <button
        type="button"
        onClick={avanzar}
        disabled={!habil}
        style={{
          width: '100%',
          backgroundColor: habil ? '#EC4899' : 'rgba(255,255,255,0.06)',
          color: habil ? '#fff' : 'rgba(255,255,255,0.3)',
          border: 'none',
          borderRadius: 12,
          padding: '14px',
          fontSize: 16,
          fontWeight: 700,
          cursor: habil ? 'pointer' : 'not-allowed',
          opacity: habil ? 1 : 0.5,
          transition: 'all 0.15s',
          boxShadow: habil ? '0 4px 20px rgba(236,72,153,0.35)' : 'none',
        }}
      >
        {esUltima ? 'Ver mis resultados' : 'Siguiente pregunta →'}
      </button>
    </div>
  )
}
