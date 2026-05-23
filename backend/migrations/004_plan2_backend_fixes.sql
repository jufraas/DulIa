-- Plan 2 backend fixes (Fase 1 integración real)
-- Proyecto: DulIA (ikyrbkbhxpoycverkdqh)
--
-- 1) RLS en profile_analysis / action_plans bloqueaba INSERT con anon key
-- 2) Columna jobs.location opcional (pipeline Adzuna) — idempotente

-- jobs.location (ver 002_jobs_english_schema.sql)
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS location text;

-- Hackathon: sin auth por session_id — alinear con profiles/jobs (RLS off)
ALTER TABLE public.profile_analysis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.profile_analysis IS 'Análisis IA del perfil. RLS desactivado en hackathon (backend anon key).';
COMMENT ON TABLE public.action_plans IS 'Plan 30-60-90. RLS desactivado en hackathon (backend anon key).';
