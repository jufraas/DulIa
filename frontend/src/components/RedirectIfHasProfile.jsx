import { Navigate } from 'react-router-dom'
import useProfileCheck from '../hooks/useProfileCheck'

export default function RedirectIfHasProfile({ children, fallbackPath = '/progreso' }) {
  const { hasProfile, loading } = useProfileCheck()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          backgroundColor: '#0F0F17',
        }}
      >
        <span
          className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-purple-500"
          aria-hidden
        />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          Verificando tu perfil...
        </p>
      </div>
    )
  }

  if (hasProfile) {
    return <Navigate to={fallbackPath} replace />
  }

  return children
}
