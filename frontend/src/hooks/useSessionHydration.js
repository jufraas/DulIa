import { useEffect } from 'react'
import { hydrateSession } from '../services/sessionHydration'
import { useProfileStore } from '../store/useProfileStore'

/** Dispara rehidratación de sesión y expone estado de carga. */
export function useSessionHydration() {
  const sessionHydrated = useProfileStore((s) => s.sessionHydrated)

  useEffect(() => {
    if (!sessionHydrated) {
      hydrateSession()
    }
  }, [sessionHydrated])

  return { ready: sessionHydrated }
}
