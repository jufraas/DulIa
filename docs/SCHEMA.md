# SCHEMA — Base de datos DulIA

> **Estado:** Propuesta lista para revisión del equipo — pendiente de aprobación antes de ejecutar en Supabase.
> **BD:** PostgreSQL 17 vía Supabase (proyecto GravityClaw)
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

Vacantes laborales scrapeadas por el pipeline. El pipeline escribe aquí; el backend solo lee.

| Columna | Tipo | Nulable | Default | Descripción |
|---------|------|---------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `titulo` | `text` | NO | — | Título de la vacante |
| `empresa` | `text` | NO | — | Nombre de la empresa |
| `ciudad` | `text` | SÍ | — | Ciudad (ej: "Barranquilla") |
| `departamento` | `text` | SÍ | — | Departamento |
| `salario_min` | `integer` | SÍ | — | Salario mínimo en COP (null si no publicado) |
| `salario_max` | `integer` | SÍ | — | Salario máximo en COP |
| `habilidades_requeridas` | `text[]` | SÍ | `'{}'` | Skills requeridos |
| `sector` | `text` | SÍ | — | Sector económico (ej: "tecnología", "logística") |
| `experiencia_requerida` | `numeric` | SÍ | `0` | Años de experiencia requeridos |
| `nivel_educativo_req` | `text` | SÍ | — | Nivel educativo mínimo requerido |
| `modalidad` | `text` | SÍ | — | `presencial`, `remoto`, `hibrido` |
| `status` | `text` | NO | `'green'` | `green` 🟢 / `yellow` 🟡 / `red` 🔴 (calidad de la vacante) |
| `fuente` | `text` | NO | — | Portal de origen (ej: "computrabajo", "elempleo") |
| `url` | `text` | SÍ | — | URL original de la vacante |
| `hash_unico` | `text` | NO | — | SHA256 de `titulo+empresa+url` para deduplicación |
| `publicado_at` | `timestamptz` | SÍ | — | Fecha de publicación original |
| `scrapeado_at` | `timestamptz` | NO | `now()` | Fecha en que el pipeline la capturó |
| `activo` | `boolean` | NO | `true` | Si la vacante sigue vigente |

**Índices:** `hash_unico` (único), `ciudad`, `sector`, `status`, `activo`, `empresa`

> **Nota para el pipeline (Jose/Compa 2):** el campo `status` lo calcula el pipeline según heurísticas (empresa reconocida, salario publicado, descripción detallada, etc.). El backend solo filtra `status != 'red'` y `activo = true`.

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
| `vacantes_verdes` | `integer` | NO | `0` | Vacantes con `status = 'green'` |
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

> Score final = suma ponderada × 100, redondeado a entero.

---

## Notas de diseño

- **Sin auth en el hackathon**: `profiles` usa `session_id` (UUID generado en el frontend) en lugar de usuarios autenticados. Simple y funciona.
- **`jobs.habilidades_requeridas` como `text[]`**: más simple que JSONB para el matching. El pipeline normaliza los skills a minúsculas sin acentos.
- **`companies` es opcional para el MVP**: si el tiempo no alcanza, el termómetro del mercado puede calcular todo con queries sobre `jobs` directamente.
- **Salarios en COP entero**: muchos portales colombianos no publican salario. Dejamos `null`, no inventamos.
- **RLS**: en el hackathon desactivamos RLS para simplificar. En producción real habilitaría por `session_id`.

---

## Preguntas abiertas para el equipo

1. **Jose (pipeline):** ¿Los portales que vas a scrapear (Computrabajo, El Empleo) publican salario? ¿Qué campos sí vas a poder extraer siempre?
2. **Jose (pipeline):** ¿Cómo vas a calcular el `status` green/yellow/red? ¿Qué heurísticas usas?
3. **Migue (frontend):** ¿El `session_id` lo genera el frontend o se lo pasamos nosotros? ¿`localStorage`?
4. **Todos:** ¿Creamos la tabla `companies` o la saltamos para ganar tiempo y calculamos todo con queries sobre `jobs`?
