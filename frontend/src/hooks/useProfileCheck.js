import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export async function checkProfile(userId) {
  if (!userId) return false
  try {
    const apiUrl = import.meta.env.VITE_API_URL || ''
    const res = await fetch(`${apiUrl}/api/user/has-profile?user_id=${userId}`)
    if (!res.ok) return false
    const data = await res.json()
    return Boolean(data?.has_profile)
  } catch {
    return false
  }
}

export default function useProfileCheck() {
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

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
