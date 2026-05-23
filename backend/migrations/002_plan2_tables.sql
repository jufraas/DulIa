-- Tablas para Plan 2: Análisis de Perfil y Plan de Acción
-- Ejecutar en Supabase SQL Editor

-- Tabla: Análisis enriquecido del perfil
CREATE TABLE IF NOT EXISTS profile_analysis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL REFERENCES profiles(session_id) ON DELETE CASCADE,
    fortalezas jsonb DEFAULT '[]'::jsonb,
    debilidades jsonb DEFAULT '[]'::jsonb,
    gaps_mercado jsonb DEFAULT '[]'::jsonb,
    oportunidades jsonb DEFAULT '[]'::jsonb,
    nivel_preparacion jsonb DEFAULT '{}'::jsonb,
    recomendaciones jsonb DEFAULT '[]'::jsonb,
    raw_gemini_response text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(session_id)
);

-- Tabla: Plan de acción personalizado
CREATE TABLE IF NOT EXISTS action_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL REFERENCES profiles(session_id) ON DELETE CASCADE,
    resumen_ejecutivo text,
    fase_30 jsonb DEFAULT '{}'::jsonb,
    fase_60 jsonb DEFAULT '{}'::jsonb,
    fase_90 jsonb DEFAULT '{}'::jsonb,
    recursos_recomendados jsonb DEFAULT '[]'::jsonb,
    milestones jsonb DEFAULT '[]'::jsonb,
    raw_gemini_response text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(session_id)
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_profile_analysis_session ON profile_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_session ON action_plans(session_id);

-- Comentarios para documentación
COMMENT ON TABLE profile_analysis IS 'Análisis enriquecido de perfil generado por IA';
COMMENT ON TABLE action_plans IS 'Plan de acción 30-60-90 días personalizado';
