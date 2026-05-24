import { Navigate } from 'react-router-dom'
import useProfileCheck from '../../hooks/useProfileCheck'

export default function RedirectIfHasProfile({ children, fallbackPath = '/progreso' }) {
  const { hasProfile, loading } = useProfileCheck()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-sm text-gray-400">Verificando tu perfil…</p>
        </div>
      </div>
    )
  }

  if (hasProfile) return <Navigate to={fallbackPath} replace />

  return children
}
