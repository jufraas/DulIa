import { useNavigate, Link } from 'react-router-dom'
import DuliaLogo from '../components/brand/DuliaLogo'

const css = `
  @keyframes stripes {
    from { background-position: 0 0; }
    to   { background-position: 48px 0; }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.55; transform: scale(1); }
    50%       { opacity: 0.80; transform: scale(1.08); }
  }
  @keyframes float-blob {
    0%, 100% { transform: translateY(0px) scale(1); }
    50%       { transform: translateY(-24px) scale(1.04); }
  }
  @keyframes bounce-sign {
    0%, 100% { transform: rotate(-2deg) scale(1); }
    50%       { transform: rotate(2deg) scale(1.03); }
  }
  @keyframes bar-fill {
    from { width: 0%; }
    to   { width: 42%; }
  }
`

export default function ConstruccionPage() {
  const navigate = useNavigate()

  return (
    <>
      <style>{css}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#0F0F17', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

        {/* Blobs de fondo */}
        <div style={{
          position: 'absolute', top: '-120px', left: '-120px',
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.28) 0%, transparent 70%)',
          animation: 'float-blob 7s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', right: '-80px',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 70%)',
          animation: 'float-blob 9s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '15%',
          width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
          animation: 'pulse-glow 5s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Header simple */}
        <header style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 32px',
          borderBottom: '1px solid rgba(168,85,247,0.15)',
        }}>
          <Link to="/">
            <DuliaLogo height={28} />
          </Link>
          <button
            type="button"
            onClick={() => navigate('/perfil')}
            style={{
              backgroundColor: 'transparent',
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              padding: '8px 18px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← Volver al perfil
          </button>
        </header>

        {/* Contenido principal */}
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>

            {/* Cartel animado EN OBRA */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                backgroundColor: '#FACC15',
                color: '#111',
                fontWeight: 900,
                fontSize: 18,
                letterSpacing: '0.08em',
                padding: '10px 24px',
                borderRadius: 10,
                marginBottom: 28,
                boxShadow: '0 0 0 3px #111, 0 0 0 6px #FACC15, 0 6px 24px rgba(250,204,21,0.35)',
                animation: 'bounce-sign 2.4s ease-in-out infinite',
                userSelect: 'none',
              }}
            >
              <span>🚧</span>
              <span>EN OBRA</span>
              <span>👷‍♂️</span>
              <span>🔧</span>
            </div>

            {/* Badge */}
            <div style={{ marginBottom: 24 }}>
              <span style={{
                display: 'inline-block',
                backgroundColor: 'rgba(168,85,247,0.18)',
                border: '1px solid rgba(168,85,247,0.45)',
                color: '#C4B5FD',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.12em',
                padding: '5px 14px',
                borderRadius: 999,
              }}>
                RUTA CERRADA · PAILA PARCERO
              </span>
            </div>

            {/* Título */}
            <h1 style={{
              color: '#F1F0FB',
              fontSize: 'clamp(26px, 5vw, 38px)',
              fontWeight: 800,
              lineHeight: 1.25,
              margin: '0 0 16px',
            }}>
              Bro, esta sección{' '}
              <span style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                está en construcción.
              </span>
            </h1>

            {/* Subtítulo */}
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, lineHeight: 1.6, margin: '0 0 36px' }}>
              Tranqui, no sos vos — somos nosotros. Vuelve pronto.
            </p>

            {/* Barra de progreso */}
            <div style={{
              backgroundColor: '#1A1A24',
              border: '1px solid rgba(168,85,247,0.25)',
              borderRadius: 16,
              padding: '20px 24px',
              marginBottom: 36,
              textAlign: 'left',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>
                  PROGRESO
                </span>
                <span style={{ color: '#EC4899', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em' }}>
                  42% · ECHÁNDOLE GANAS
                </span>
              </div>
              <div style={{ height: 10, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: '42%',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #EC4899, #8B5CF6)',
                  boxShadow: '0 0 12px rgba(236,72,153,0.6)',
                  animation: 'bar-fill 1.4s cubic-bezier(0.22,1,0.36,1) both',
                }} />
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate('/perfil')}
                style={{
                  backgroundColor: '#EC4899',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '13px 28px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(236,72,153,0.4)',
                }}
              >
                Devuélveme al perfil
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  backgroundColor: 'transparent',
                  color: 'rgba(255,255,255,0.65)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 12,
                  padding: '13px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Ir al inicio
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          position: 'relative', zIndex: 10,
          textAlign: 'center',
          padding: '20px',
          color: 'rgba(255,255,255,0.25)',
          fontSize: 13,
          borderTop: '1px solid rgba(168,85,247,0.1)',
        }}>
          Hecho con{' '}
          <span style={{ color: '#EC4899' }}>♥</span>
          {' '}desde Barranquilla — ¡hace un calor, mijo!
        </footer>
      </div>
    </>
  )
}
