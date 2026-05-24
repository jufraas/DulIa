-- B7.1: columnas de trazabilidad para pool de entrevistas con fuentes reales
-- No modifica datos existentes; el repoblamiento viene en migración 015 (ETL).

ALTER TABLE public.interview_questions_seed
    ADD COLUMN IF NOT EXISTS fuente_url text,
    ADD COLUMN IF NOT EXISTS idioma_origen text DEFAULT 'es';

CREATE INDEX IF NOT EXISTS idx_iqs_fuente ON public.interview_questions_seed(fuente);

COMMENT ON COLUMN public.interview_questions_seed.fuente_url IS
    'URL al repo/dataset origen (ej. GitHub sudheerj/*) para trazabilidad del pitch';
COMMENT ON COLUMN public.interview_questions_seed.idioma_origen IS
    'Idioma del texto original antes de traducción (en, es, etc.)';
