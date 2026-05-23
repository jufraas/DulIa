# SCHEMA — Base de datos DulIA

> **Estado:** ✅ Tablas creadas en Supabase — proyecto DulIA (`ikyrbkbhxpoycverkdqh`). Mock data pendiente, a cargo del pipeline.
> **BD:** PostgreSQL 17 vía Supabase (proyecto DulIA)
> **Última actualización:** 2026-05-23

---

## Diagrama de relaciones

```
profiles ──< scoring_history >── jobs
                                  │
                               companies
```

---

## Tabla: `profiles`

Perfil estructurado del usuario, extraído por Gemini a partir del onboarding conversacional.

| Columna | Tipo | Nulable | Default | Descripción |
|---------|------|---------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `session_id` | `text` | NO | — | ID de sesión del browser (sin auth en el hackathon) |
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

**Índices:** `session_id` (único), `ciudad`, `nivel_educativo`

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
| `source` | `text` | NO | — | Origen (adzuna, mock, etc.) |
| `url` | `text` | SÍ | — | URL de la vacante |
| `unique_hash` | `text` | NO | — | SHA256(title+company+url), UNIQUE |
| `description` | `text` | SÍ | — | Descripción |
| `posted_at` | `timestamptz` | SÍ | — | Fecha publicación |
| `scraped_at` | `timestamptz` | NO | `now()` | Fecha de captura |
| `active` | `boolean` | NO | `true` | Vacante vigente |
| `repost_count` | `integer` | NO | `0` | Reposts (fantasmas) |
| `hires_youth` | `boolean` | SÍ | `false` | Contrata jóvenes |

**Índices:** `unique_hash` (único), `city`, `sector`, `status`, `active`, `company`

> El backend filtra `status != 'red'` y `active = true`. Si solo hay `location`, infiere `city`/`department` del texto.

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
- **RLS**: en el hackathon desactivamos RLS para simplificar. En producción real habilitaría por `session_id`.

---


