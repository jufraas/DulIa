-- DulIA: migrar tabla jobs a schema en inglés (compatible pipeline + backend)
-- Ejecutar en proyecto Supabase DulIA (ikyrbkbhxpoycverkdqh)

-- Renombrar columnas existentes (español → inglés)
ALTER TABLE public.jobs RENAME COLUMN titulo TO title;
ALTER TABLE public.jobs RENAME COLUMN empresa TO company;
ALTER TABLE public.jobs RENAME COLUMN ciudad TO city;
ALTER TABLE public.jobs RENAME COLUMN departamento TO department;
ALTER TABLE public.jobs RENAME COLUMN salario_min TO salary_min;
ALTER TABLE public.jobs RENAME COLUMN salario_max TO salary_max;
ALTER TABLE public.jobs RENAME COLUMN habilidades_requeridas TO skills_required;
ALTER TABLE public.jobs RENAME COLUMN experiencia_requerida TO experience_required;
ALTER TABLE public.jobs RENAME COLUMN nivel_educativo_req TO education_level_req;
ALTER TABLE public.jobs RENAME COLUMN modalidad TO modality;
ALTER TABLE public.jobs RENAME COLUMN semaforo TO status;
ALTER TABLE public.jobs RENAME COLUMN fuente TO source;
ALTER TABLE public.jobs RENAME COLUMN hash_unico TO unique_hash;
ALTER TABLE public.jobs RENAME COLUMN descripcion TO description;
ALTER TABLE public.jobs RENAME COLUMN publicado_at TO posted_at;
ALTER TABLE public.jobs RENAME COLUMN scrapeado_at TO scraped_at;
ALTER TABLE public.jobs RENAME COLUMN activo TO active;

-- Campos del pipeline (Adzuna / detección fantasmas / Plan 2)
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS repost_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS hires_youth boolean DEFAULT false;

-- Índices útiles (idempotente)
CREATE INDEX IF NOT EXISTS idx_jobs_city ON public.jobs (city);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON public.jobs (active);
CREATE INDEX IF NOT EXISTS idx_jobs_sector ON public.jobs (sector);

COMMENT ON TABLE public.jobs IS 'Vacantes: schema EN unificado (pipeline + backend DulIA)';
