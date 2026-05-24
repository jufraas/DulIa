import { useCallback, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../services/supabase'
import { linkSession } from '../services/api'
import { getOrCreateSessionId } from '../utils/session'
import { AuthContext } from './AuthContext'

async function tryLinkAnonymousSession(userId) {
  const sessionId = getOrCreateSessionId()
  if (!sessionId || !userId) return
  try {
    await linkSession(sessionId, userId)
  } catch (err) {
    if (import.meta.env.DEV) {
      console.info('[DulIA] link-session best-effort falló (puede no haber perfil coach aún)', err)
    }
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(/** @type {SupabaseUser | null} */(null))
  const [session, setSession] = useState(/** @type {SupabaseSession | null} */(null))
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN' && nextSession?.user?.id) {
        tryLinkAnonymousSession(nextSession.user.id)
      }
    })

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isConfigured: isSupabaseConfigured,
      signOut,
    }),
    [user, session, loading, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
