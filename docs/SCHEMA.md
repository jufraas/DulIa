# SCHEMA — Base de datos DulIA

> **Estado:** ✅ Tablas creadas en Supabase — proyecto DulIA (`ikyrbkbhxpoycverkdqh`). Pipeline activo: **getonbrd** + **remotive**. Cola híbrida: `user_interests` + `scrape_queue` (migraciones 008–009). Auth opcional: `user_accounts` + `profiles.user_id` (migraciones 010–011). Progreso plan + mock interviews: migraciones **012–016**.
> **BD:** PostgreSQL 17 vía Supabase (proyecto DulIA)
> **Última actualización:** 2026-05-24 (B8 — entrevista conversacional V2)

---

## Diagrama de relaciones

```
profiles ──< scoring_history >── jobs
    │                              │
    │ user_id (nullable)           companies
    └── user_interests             │
profiles ── (demanda) ──> scrape_queue ──> jobs (pipeline CLI)
    │
    ├── plan_progress (1:1 por profile_id)
    ├── mock_interviews (1:N — quiz V1)
    └── mock_interviews_v2 (1:N — conversacional V2, B8)

user_accounts ── FK auth.users (cuenta opcional, separada del coach)

interview_questions_seed (pool entrevistas — lectura por sector/skill/nivel; fuentes reales B7)
```

---

## Tabla: `profiles`

Perfil estructurado del usuario, extraído por Gemini a partir del onboarding conversacional.

| Columna | Tipo | Nulable | Default | Descripción |
|---------|------|---------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `session_id` | `text` | NO | — | ID de sesión del browser (flujo anónimo del coach) |
| `user_id` | `uuid` | SÍ | — | FK opcional a `auth.users` — vinculación tras login (migración 011) |
| `nombre` | `text` | SÍ | — | Nombre del usuario |
| `edad` | `integer` | SÍ | — | Edad |
| `ciudad` | `text` | SÍ | — | Ciudad actual (ej: "Barranquilla") |
| `departamento` | `text` | SÍ | — | Departamento (ej: "Atlántico") |
| `nivel_educativo` | `text` | SÍ | — | `bachiller`, `tecnico`, `tecnologo`, `universitario`, `posgrado` |
| `carrera` | `text` | SÍ | — | Carrera o área de estudio |
| `experiencia_anios` | `numeric` | SÍ | `0` | Años de experiencia laboral |
| `habilidades` | `text[]` | SÍ | `'{}'` | Array de habilidades (ej: `{"Python","Excel","Ventas"}`) |
| `sectores_interes` | `text[]` | SÍ | `'{}'` | Sectores de interés del usuario |
| `salario_esperado_min` | `integer` | SÍ | — | Expectativa salarial mínima en COP |
| `salario_esperado_max` | `integer` | SÍ | — | Expectativa salarial máxima en COP |
| `modalidad` | `text` | SÍ | — | `presencial`, `remoto`, `hibrido`, `indiferente` |
| `raw_onboarding` | `jsonb` | SÍ | `'{}'` | Respuestas originales del onboarding (para re-procesar si cambia el prompt) |
| `created_at` | `timestamptz` | NO | `now()` | Fecha de creación |
| `updated_at` | `timestamptz` | NO | `now()` | Fecha de última actualización |

**Índices:** `session_id` (único), `ciudad`, `nivel_educativo`, `user_id`

---

## Tabla: `user_accounts`

Datos de cuenta del usuario autenticado (separados del perfil coach en `profiles`). Migración `010_user_accounts.sql`.

| Columna | Tipo | Nulable | Default | Descripción |
|---------|------|---------|---------|-------------|
| `user_id` | `uuid` | NO | — | PK, FK → `auth.users(id)` ON DELETE CASCADE |
| `nombre` | `text` | SÍ | — | Nombre |
| `apellido` | `text` | SÍ | — | Apellido |
| `telefono` | `text` | SÍ | — | Teléfono |
| `linkedin` | `text` | SÍ | — | Perfil LinkedIn |
| `instagram` | `text` | SÍ | — | Usuario Instagram |
| `whatsapp` | `text` | SÍ | — | WhatsApp |
| `created_at` | `timestamptz` | NO | `now()` | Fecha de creación |
| `updated_at` | `timestamptz` | NO | `now()` | Última actualización |

**RLS:** desactivado (MVP hackathon).

---

## Tabla: `jobs`

Vacantes laborales (schema **inglés**, compatible Adzuna/pipeline). El pipeline escribe aquí; el backend lee y expone JSON en español al frontend.

> Contrato detallado para el equipo de pipeline: **`docs/PIPELINE_JOBS.md`**

| Columna | Tipo | Nulable | Default | Descripción |
|---------|------|---------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `title` | `text` | NO | — | Título de la vacante |
| `company` | `text` | NO | — | Empresa |
| `city` | `text` | SÍ | — | Ciudad (score + filtros) |
| `department` | `text` | SÍ | — | Departamento |
| `location` | `text` | SÍ | — | Texto libre "Ciudad, Depto" (pipeline Adzuna) |
| `salary_min` | `integer` | SÍ | — | Salario mínimo COP |
| `salary_max` | `integer` | SÍ | — | Salario máximo COP |
| `skills_required` | `text[]` | SÍ | `'{}'` | Skills requeridos |
| `sector` | `text` | SÍ | — | Sector (mercado + score) |
| `experience_required` | `numeric` | SÍ | `0` | Años de experiencia |
| `education_level_req` | `text` | SÍ | — | Nivel educativo mínimo |
| `modality` | `text` | SÍ | — | `presencial`, `remoto`, `hibrido` |
| `status` | `text` | NO | `'green'` | `green` 🟢 / `yellow` 🟡 / `red` 🔴 |
| `source` | `text` | NO | — | Origen: `getonbrd`, `remotive`, `mock` (legacy: `adzuna`, `jooble`) |
| `url` | `text` | SÍ | — | URL de la vacante |
| `unique_hash` | `text` | NO | — | SHA256(title+company+url), UNIQUE |
| `description` | `text` | SÍ | — | Descripción |
| `posted_at` | `timestamptz` | SÍ | — | Fecha publicación |
| `scraped_at` | `timestamptz` | NO | `now()` | Fecha de captura |
| `active` | `boolean` | NO | `true` | Vacante vigente |
| `repost_count` | `integer` | NO | `0` | Reposts (fantasmas) |
| `hires_youth` | `boolean` | SÍ | `false` | Contrata jóvenes |

**Índices:** `unique_hash` (único), `city`, `sector`, `status`, `active`, `company`

> El backend filtra `status != 'red'` y `active = true`. Si `city` es null, el dashboard usa todas las vacantes activas como fallback (ver migración 004).

---

## Tabla: `profile_analysis`

Análisis enriquecido generado por Gemini (`POST /profile/{id}/analyze`).

| Columna | Tipo | Nulable | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | NO | PK |
| `session_id` | `text` | NO | FK → `profiles.session_id` (UNIQUE) |
| `fortalezas` | `jsonb` | SÍ | Array de objetos `{ area, descripcion, nivel }` |
| `debilidades` | `jsonb` | SÍ | Array de objetos `{ area, descripcion, impacto }` |
| `gaps_mercado` | `jsonb` | SÍ | Habilidades con brecha vs mercado |
| `oportunidades` | `jsonb` | SÍ | Sectores y acciones inmediatas |
| `nivel_preparacion` | `jsonb` | SÍ | `{ overall, descripcion, comparativa }` |
| `recomendaciones` | `jsonb` | SÍ | Lista de strings |
| `raw_gemini_response` | `text` | SÍ | JSON crudo para debug |
| `created_at` / `updated_at` | `timestamptz` | — | Auditoría |

**RLS:** desactivado en hackathon (migración `004_plan2_backend_fixes.sql`).

---

## Tabla: `action_plans`

Plan 30-60-90 días (`POST /profile/{id}/action-plan`).

| Columna | Tipo | Nulable | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | NO | PK |
| `session_id` | `text` | NO | FK → `profiles.session_id` (UNIQUE) |
| `resumen_ejecutivo` | `text` | SÍ | Resumen IA para UI |
| `fase_30` / `fase_60` / `fase_90` | `jsonb` | SÍ | Objetivos, acciones por semana, métricas |
| `recursos_recomendados` | `jsonb` | SÍ | Cursos, prácticas, comunidades |
| `milestones` | `jsonb` | SÍ | Hitos día 30/60/90 |
| `raw_gemini_response` | `text` | SÍ | JSON crudo |
| `created_at` | `timestamptz` | — | |

**RLS:** desactivado en hackathon (migración `004_plan2_backend_fixes.sql`).

---

## Tabla: `user_interests`

Señales de demanda capturadas al guardar perfil (`POST /profile`). **Best-effort** — un fallo aquí no afecta la respuesta del endpoint.

| Columna | Tipo | Nulable | Default | Descripción |
|---------|------|---------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `session_id` | `text` | NO | — | UUID del wizard |
| `city` | `text` | SÍ | — | Ciudad del perfil |
| `department` | `text` | SÍ | — | Departamento |
| `sector` | `text` | SÍ | — | Primer sector de interés |
| `skills` | `text[]` | SÍ | `'{}'` | Habilidades del perfil |
| `modality` | `text` | SÍ | — | Modalidad preferida |
| `experience_years` | `numeric` | SÍ | `0` | Años de experiencia |
| `education_level` | `text` | SÍ | — | Nivel educativo |
| `created_at` | `timestamptz` | NO | `now()` | Cuándo se registró |
| `source` | `text` | NO | `'profile_post'` | Origen del registro |

**Índices:** `(city, sector)`, `created_at DESC`

**RLS:** desactivado (migración `008_user_interests.sql`).

---

## Tabla: `scrape_queue`

Cola manual de scraping on-demand. Procesada por `pipeline/run_queue.py` (sin cron en hackathon).

| Columna | Tipo | Nulable | Default | Descripción |
|---------|------|---------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `filters` | `jsonb` | NO | `'{}'` | `{ city, sector, skills[] }` para fetchers |
| `priority` | `integer` | NO | `0` | Mayor = antes |
| `status` | `text` | NO | `'pending'` | `pending` \| `processing` \| `done` \| `failed` |
| `source_hint` | `text[]` | NO | `'{}'` | Fuentes a usar: `getonbrd`, `remotive` |
| `created_at` | `timestamptz` | NO | `now()` | Encolado |
| `started_at` | `timestamptz` | SÍ | — | Inicio de procesamiento |
| `finished_at` | `timestamptz` | SÍ | — | Fin |
| `jobs_inserted` | `integer` | NO | `0` | Vacantes insertadas en `jobs` |
| `error_msg` | `text` | SÍ | — | Detalle si `failed` |
| `retry_count` | `integer` | NO | `0` | Reintentos |

**Índice:** `(status, priority DESC, created_at ASC)`

**RLS:** desactivado (migración `009_scrape_queue.sql`).

---

## Tabla: `companies`

Estadísticas agregadas por empresa. Se puede recalcular con una query sobre `jobs`.

| Columna | Tipo | Nulable | Default | Descripción |
|---------|------|---------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `nombre` | `text` | NO | — | Nombre de la empresa (UNIQUE) |
| `sector` | `text` | SÍ | — | Sector principal |
| `ciudad_principal` | `text` | SÍ | — | Ciudad donde más publica |
| `total_vacantes` | `integer` | NO | `0` | Total de vacantes activas |
| `vacantes_verdes` | `integer` | NO | `0` | Vacantes con `status = 'green'` en `jobs` |
| `ratio_calidad` | `numeric` | SÍ | — | `vacantes_verdes / total_vacantes` |
| `contrata_jovenes` | `boolean` | SÍ | — | Si tiene vacantes sin experiencia requerida |
| `ultima_publicacion` | `timestamptz` | SÍ | — | Fecha de la vacante más reciente |
| `updated_at` | `timestamptz` | NO | `now()` | Última vez que se recalculó |

**Índices:** `nombre` (único), `ciudad_principal`, `sector`

> **Nota:** Esta tabla es un cache de agregaciones. Se puede recalcular con `SELECT empresa, COUNT(*) FROM jobs GROUP BY empresa`. El pipeline o un cron la mantiene actualizada.

---

## Tabla: `scoring_history`

Historial de scores calculados para pares perfil-vacante. Evita recalcular en cada request.

| Columna | Tipo | Nulable | Default | Descripción |
|---------|------|---------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `profile_id` | `uuid` | NO | — | FK → `profiles.id` |
| `job_id` | `uuid` | NO | — | FK → `jobs.id` |
| `score` | `integer` | NO | — | Score 0-100 |
| `breakdown` | `jsonb` | SÍ | `'{}'` | Desglose del score por componente |
| `recomendaciones` | `text[]` | SÍ | `'{}'` | Qué aprender para subir el score |
| `calculado_at` | `timestamptz` | NO | `now()` | Cuándo se calculó |

**Índices:** `(profile_id, job_id)` (único), `profile_id`, `score DESC`

---

## Tabla: `plan_progress`

Progreso del plan 30/60/90 por perfil coach. Una fila por `profile_id`. Migración `012_progress_and_interviews.sql`.

| Columna | Tipo | Nulable | Default | Descripción |
|---------|------|---------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `profile_id` | `uuid` | NO | — | FK → `profiles.id` ON DELETE CASCADE (UNIQUE) |
| `user_id` | `uuid` | SÍ | — | FK → `auth.users(id)` ON DELETE SET NULL |
| `session_id` | `text` | NO | — | Copia del `session_id` del perfil (consultas rápidas) |
| `started_at` | `timestamptz` | NO | `now()` | Inicio del seguimiento |
| `current_phase` | `integer` | NO | `30` | Fase activa: `30`, `60` o `90` |
| `current_week` | `integer` | NO | `1` | Semana dentro de la fase |
| `completed_tasks` | `jsonb` | NO | `'[]'` | Array de `task_id` completados (ej. `"fase_30:semana_1:idx_0"`) |
| `updated_at` | `timestamptz` | NO | `now()` | Última actualización |

**Índices:** `profile_id` (único), `user_id`, `session_id`

---

## Tabla: `mock_interviews`

Sesiones del simulador de entrevistas con IA. Migración `012_progress_and_interviews.sql`.

| Columna | Tipo | Nulable | Default | Descripción |
|---------|------|---------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `profile_id` | `uuid` | NO | — | FK → `profiles.id` ON DELETE CASCADE |
| `user_id` | `uuid` | SÍ | — | FK → `auth.users(id)` ON DELETE SET NULL |
| `session_id` | `text` | NO | — | Sesión del browser |
| `target_skill` | `text` | SÍ | — | Skill objetivo (ej. Excel, Python) |
| `target_role` | `text` | SÍ | — | Rol objetivo (ej. auxiliar contable) |
| `questions` | `jsonb` | NO | — | Preguntas generadas (pool + Gemini) |
| `answers` | `jsonb` | NO | `'[]'` | Respuestas evaluadas con score y feedback |
| `global_score` | `integer` | SÍ | — | Promedio 0–100 al finalizar |
| `weak_skills` | `text[]` | SÍ | `'{}'` | Skills débiles detectadas |
| `status` | `text` | NO | `'in_progress'` | `in_progress`, `completed`, `abandoned` |
| `created_at` | `timestamptz` | NO | `now()` | Inicio de la entrevista |
| `completed_at` | `timestamptz` | SÍ | — | Cierre de la entrevista |

**Índices:** `user_id`, `profile_id`

---

## Tabla: `mock_interviews_v2`

Entrevistas conversacionales con IA entrevistadora por etapas. Migración `016_interview_v2_state.sql` (B8).

| Columna | Tipo | Nulable | Default | Descripción |
|---------|------|---------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `profile_id` | `uuid` | NO | — | FK → `profiles.id` ON DELETE CASCADE |
| `user_id` | `uuid` | SÍ | — | FK → `auth.users(id)` ON DELETE SET NULL |
| `session_id` | `text` | NO | — | Sesión del browser |
| `target_skill` | `text` | SÍ | — | Skill objetivo |
| `target_role` | `text` | SÍ | — | Rol objetivo |
| `target_sector` | `text` | NO | — | Sector normalizado (tecnologia, ventas, …) |
| `persona` | `jsonb` | NO | — | Entrevistador IA: nombre, rol, estilo, saludo |
| `stage` | `text` | NO | `'rapport'` | `rapport`, `tecnica`, `behavioral`, `cierre`, `finalizada` |
| `stage_state` | `jsonb` | NO | `'{}'` | Estado interno de la etapa actual |
| `turns` | `jsonb` | NO | `'[]'` | Historial conversacional `{role, text, stage, t}` |
| `pool_snapshot` | `jsonb` | NO | `'[]'` | Preguntas+rúbricas tomadas al iniciar |
| `stage_scores` | `jsonb` | NO | `'{}'` | Scores parciales por etapa |
| `global_score` | `integer` | SÍ | — | Score global 0–100 al finalizar |
| `weak_skills` | `text[]` | SÍ | `'{}'` | Skills débiles detectadas |
| `summary` | `jsonb` | SÍ | — | Resumen final estructurado (etapas + próximos pasos) |
| `status` | `text` | NO | `'in_progress'` | `in_progress`, `completed`, `aborted` |
| `version` | `smallint` | NO | `2` | Versión del simulador |
| `created_at` | `timestamptz` | NO | `now()` | Inicio |
| `updated_at` | `timestamptz` | NO | `now()` | Última actividad |
| `completed_at` | `timestamptz` | SÍ | — | Cierre |

**Índices:** `session_id`, `status`, `profile_id`

---

## Tabla: `interview_questions_seed`

Pool de preguntas de entrevista por sector. Repoblado en B7 (2026-05-24): **629 filas** — 521 tech de fuentes reales + 108 no-tech `ai_generated`. Migraciones: `012`, `013` (seed original), `014` (trazabilidad), `015` (reemplazo).

| Columna | Tipo | Nulable | Default | Descripción |
|---------|------|---------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `sector` | `text` | NO | — | `tecnologia`, `marketing`, `ventas`, `contabilidad`, `servicio_cliente`, `operaciones`, `administracion`, `salud`, `educacion`, `general` |
| `skill` | `text` | SÍ | — | Skill asociada (ej. `React`, `JavaScript`; NULL en sector `general`) |
| `nivel` | `text` | NO | — | `junior`, `mid`, `senior` |
| `tipo` | `text` | NO | — | `tecnica`, `behavioral`, `situacional` |
| `pregunta` | `text` | NO | — | Texto de la pregunta (español en prod) |
| `rubrica` | `jsonb` | SÍ | — | `{keywords_clave, puntos_fuertes_esperados, red_flags}` — específica por pregunta en tech |
| `fuente` | `text` | SÍ | `'curado_dulia'` | Ver valores válidos abajo |
| `idioma` | `text` | SÍ | `'es'` | Idioma de la pregunta mostrada al candidato |
| `fuente_url` | `text` | SÍ | — | URL al repo/dataset origen (migración 014) |
| `idioma_origen` | `text` | SÍ | `'es'` | Idioma del texto original antes de traducción (`en` para tech B7) |

**Valores válidos de `fuente`:**

| Valor | Descripción |
|-------|-------------|
| `github_sudheerj_react` | [sudheerj/reactjs-interview-questions](https://github.com/sudheerj/reactjs-interview-questions) |
| `github_sudheerj_javascript` | [sudheerj/javascript-interview-questions](https://github.com/sudheerj/javascript-interview-questions) |
| `github_arialdomartini_backend` | [arialdomartini/Back-End-Developer-Interview-Questions](https://github.com/arialdomartini/Back-End-Developer-Interview-Questions) |
| `huggingface_ali_alkhars` | [ali-alkhars/interviews](https://huggingface.co/datasets/ali-alkhars/interviews) |
| `ai_generated` | Preguntas no-tech del seed 013 (honestamente marcadas) |
| `curado_dulia` | Legacy B1 — ya no en prod tras B7 |

**Índices:** `(sector, nivel)`, `(fuente)`

**Backup:** `interview_questions_seed_backup_2026_05_24` (120 filas del pool B1, por si hay que revertir).

---

## Lógica del score (referencia para el backend)

El score 0-100 se calcula así:

| Componente | Peso | Cómo se calcula |
|-----------|------|-----------------|
| Match de habilidades | 40% | `len(perfil.habilidades ∩ job.habilidades_req) / len(job.habilidades_req)` |
| Match de ciudad | 20% | `1.0` si misma ciudad, `0.5` si mismo depto, `0.0` si diferente |
| Brecha de experiencia | 25% | `1.0` si cumple, decrece linealmente si le falta hasta 3 años |
| Match de nivel educativo | 15% | `1.0` si cumple o supera, `0.5` si está un nivel abajo |

> Score final = suma nponderada × 100, redondeado a entero.

---

## Notas de diseño

- **Sin auth en el hackathon**: `profiles` usa `session_id` (UUID generado en el frontend) en lugar de usuarios autenticados. Simple y funciona.
- **`jobs.habilidades_requeridas` como `text[]`**: más simple que JSONB para el matching. El pipeline normaliza los skills a minúsculas sin acentos.
- **`companies` es opcional para el MVP**: si el tiempo no alcanza, el termómetro del mercado puede calcular todo con queries sobre `jobs` directamente.
- **Salarios en COP entero**: muchos portales colombianos no publican salario. Dejamos `null`, no inventamos.
- **RLS**: desactivado en `profiles`, `jobs`, `profile_analysis` y `action_plans` (hackathon, backend con anon key). Migración: `backend/migrations/004_plan2_backend_fixes.sql`.

---


