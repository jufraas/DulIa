-- Auth: cuenta de usuario (separada del perfil coach en profiles)
CREATE TABLE IF NOT EXISTS public.user_accounts (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre text,
    apellido text,
    telefono text,
    linkedin text,
    instagram text,
    whatsapp text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_accounts DISABLE ROW LEVEL SECURITY;
