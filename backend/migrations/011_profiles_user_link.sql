-- Vincular perfil coach anónimo (session_id) con usuario autenticado
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
