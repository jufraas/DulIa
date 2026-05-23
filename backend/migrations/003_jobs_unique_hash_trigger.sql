-- Auto-rellena unique_hash y active si el pipeline no los manda (Jose / upsert)

CREATE OR REPLACE FUNCTION public.jobs_set_unique_hash()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unique_hash IS NULL OR NEW.unique_hash = '' THEN
    NEW.unique_hash := encode(
      sha256(
        convert_to(
          lower(
            coalesce(NEW.title, '') || '|' ||
            coalesce(NEW.company, '') || '|' ||
            coalesce(NEW.url, '')
          ),
          'UTF8'
        )
      ),
      'hex'
    );
  END IF;
  IF NEW.active IS NULL THEN
    NEW.active := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jobs_unique_hash ON public.jobs;
CREATE TRIGGER trg_jobs_unique_hash
  BEFORE INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.jobs_set_unique_hash();
