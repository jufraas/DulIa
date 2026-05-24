-- scrape_queue: cola manual de scraping (CLI run_queue.py; cron futuro)
-- Hackathon: RLS desactivado (backend con anon key)

CREATE TABLE IF NOT EXISTS public.scrape_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    filters jsonb NOT NULL DEFAULT '{}',
    priority integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'done', 'failed')),
    source_hint text[] NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    started_at timestamptz,
    finished_at timestamptz,
    jobs_inserted integer NOT NULL DEFAULT 0,
    error_msg text,
    retry_count integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_scrape_queue_pending
    ON public.scrape_queue (status, priority DESC, created_at ASC);

ALTER TABLE public.scrape_queue DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.scrape_queue IS
    'Cola de scraping on-demand. Procesada por pipeline/run_queue.py (sin cron en hackathon).';
