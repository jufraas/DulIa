-- B8.1: entrevistas conversacionales V2 (mock_interviews_v2)
-- Requiere: public.profiles, auth.users
-- No modifica mock_interviews (V1 quiz lineal).

CREATE TABLE IF NOT EXISTS public.mock_interviews_v2 (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id text NOT NULL,
    target_skill text,
    target_role text,
    target_sector text NOT NULL,
    persona jsonb NOT NULL,
    stage text NOT NULL DEFAULT 'rapport'
        CHECK (stage IN ('rapport', 'tecnica', 'behavioral', 'cierre', 'finalizada')),
    stage_state jsonb NOT NULL DEFAULT '{}'::jsonb,
    turns jsonb NOT NULL DEFAULT '[]'::jsonb,
    pool_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
    stage_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
    global_score integer CHECK (global_score IS NULL OR (global_score >= 0 AND global_score <= 100)),
    weak_skills text[] DEFAULT '{}',
    summary jsonb,
    status text NOT NULL DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'completed', 'aborted')),
    version smallint NOT NULL DEFAULT 2,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_mi_v2_session ON public.mock_interviews_v2(session_id);
CREATE INDEX IF NOT EXISTS idx_mi_v2_status ON public.mock_interviews_v2(status);
CREATE INDEX IF NOT EXISTS idx_mi_v2_profile ON public.mock_interviews_v2(profile_id);

ALTER TABLE public.mock_interviews_v2 DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.mock_interviews_v2 IS
    'Entrevistas conversacionales V2 — IA como entrevistador por etapas (B8)';
