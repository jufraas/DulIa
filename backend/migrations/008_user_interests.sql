-- user_interests: señales de demanda por perfil (best-effort tras POST /profile)
-- Hackathon: RLS desactivado (backend con anon key)

CREATE TABLE IF NOT EXISTS public.user_interests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    city text,
    department text,
    sector text,
    skills text[] DEFAULT '{}',
    modality text,
    experience_years numeric DEFAULT 0,
    education_level text,
    created_at timestamptz NOT NULL DEFAULT now(),
    source text NOT NULL DEFAULT 'profile_post'
);

CREATE INDEX IF NOT EXISTS idx_user_interests_city_sector
    ON public.user_interests (city, sector);

CREATE INDEX IF NOT EXISTS idx_user_interests_created_at
    ON public.user_interests (created_at DESC);

ALTER TABLE public.user_interests DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.user_interests IS
    'Intereses capturados al guardar perfil. Best-effort; no bloquea POST /profile.';
