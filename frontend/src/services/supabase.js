import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info(
    '[DulIA] Supabase Auth deshabilitado — agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en frontend/.env. El coach anónimo sigue funcionando.',
  )
}

/** Null si faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (la app anónima sigue funcionando). */
export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null
