import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { hasProfile as fetchHasProfile } from '../services/api'

export async function checkProfile(userId) {
  if (!userId) return false
  try {
    const result = await fetchHasProfile(userId)
    return Boolean(result?.has_profile)
  } catch {
    return false
  }
}

export default function useProfileCheck() {
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    if (!supabase) return undefined

    let cancelled = false

    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user?.id ?? null
      if (cancelled) return
      setUserId(uid)
      if (uid) {
        const result = await checkProfile(uid)
        if (!cancelled) setHasProfile(result)
      }
      if (!cancelled) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return
      if (event === 'SIGNED_IN' && session?.user?.id) {
        const uid = session.user.id
        setUserId(uid)
        setLoading(true)
        const result = await checkProfile(uid)
        if (!cancelled) {
          setHasProfile(result)
          setLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        setHasProfile(false)
        setUserId(null)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return { hasProfile, loading, userId }
}
