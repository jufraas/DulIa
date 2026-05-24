import { createContext } from 'react'

/**
 * @typedef {import('@supabase/supabase-js').User} SupabaseUser
 * @typedef {import('@supabase/supabase-js').Session} SupabaseSession
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {SupabaseUser | null} user
 * @property {SupabaseSession | null} session
 * @property {boolean} loading
 * @property {boolean} isConfigured
 * @property {() => Promise<void>} signOut
 */

export const AuthContext = createContext(
  /** @type {AuthContextValue} */ ({
    user: null,
    session: null,
    loading: false,
    isConfigured: false,
    signOut: async () => {},
  }),
)
