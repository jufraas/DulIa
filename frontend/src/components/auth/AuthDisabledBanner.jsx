import { useState } from 'react'
import { isSupabaseConfigured } from '../../services/supabase'

/** Banner informativo cuando Supabase Auth no está configurado (dev sin .env). */
export default function AuthDisabledBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (isSupabaseConfigured || dismissed) return null

  return (
    <div
      role="status"
      style={{
        marginBottom: 20,
        padding: '12px 14px',
        borderRadius: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}
    >
      <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.5 }}>
        Auth en modo demo — el análisis del coach funciona sin login. Para activar registro,
        agrega <code style={{ color: '#93C5FD' }}>VITE_SUPABASE_URL</code> y{' '}
        <code style={{ color: '#93C5FD' }}>VITE_SUPABASE_ANON_KEY</code> en{' '}
        <code style={{ color: '#93C5FD' }}>frontend/.env</code>.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Cerrar aviso"
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.45)',
          cursor: 'pointer',
          fontSize: 18,
          lineHeight: 1,
          padding: 0,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}
