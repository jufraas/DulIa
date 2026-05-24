-- Progreso del plan 30/60/90 + simulador de entrevistas (migración 012)
-- Requiere: public.profiles, auth.users

-- ---------------------------------------------------------------------------
-- plan_progress: tareas completadas del plan por perfil coach
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plan_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id text NOT NULL,
    started_at timestamptz NOT NULL DEFAULT now(),
    current_phase integer NOT NULL DEFAULT 30 CHECK (current_phase IN (30, 60, 90)),
    current_week integer NOT NULL DEFAULT 1 CHECK (current_week >= 1),
    completed_tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (profile_id)
);

CREATE INDEX IF NOT EXISTS idx_plan_progress_user ON public.plan_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_progress_session ON public.plan_progress(session_id);

ALTER TABLE public.plan_progress DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- mock_interviews: sesiones del simulador de entrevistas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mock_interviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id text NOT NULL,
    target_skill text,
    target_role text,
    questions jsonb NOT NULL,
    answers jsonb NOT NULL DEFAULT '[]'::jsonb,
    global_score integer CHECK (global_score IS NULL OR (global_score >= 0 AND global_score <= 100)),
    weak_skills text[] DEFAULT '{}',
    status text NOT NULL DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_mock_interviews_user ON public.mock_interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_profile ON public.mock_interviews(profile_id);

ALTER TABLE public.mock_interviews DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- interview_questions_seed: banco curado de preguntas por sector
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interview_questions_seed (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sector text NOT NULL,
    skill text,
    nivel text NOT NULL CHECK (nivel IN ('junior', 'mid', 'senior')),
    tipo text NOT NULL CHECK (tipo IN ('tecnica', 'behavioral', 'situacional')),
    pregunta text NOT NULL,
    rubrica jsonb,
    fuente text DEFAULT 'curado_dulia',
    idioma text DEFAULT 'es'
);

CREATE INDEX IF NOT EXISTS idx_iqs_sector_nivel ON public.interview_questions_seed(sector, nivel);

ALTER TABLE public.interview_questions_seed DISABLE ROW LEVEL SECURITY;
