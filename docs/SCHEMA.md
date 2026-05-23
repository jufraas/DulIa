# SCHEMA — Esquema de la base de datos

> Estado: **Borrador** — alineado al contrato API (session_id, perfiles, vacantes).

## Modelo conceptual

Sin login de usuario. El `session_id` (UUID) es la clave anónima que une perfil, recomendaciones y (futuro) historial de chat.

```
session_id ──► profiles (1:1 o última versión)
            ──► coach_messages (Fase 8, 1:N)

job_offers ◄── pipeline (scrapers)
           ◄── usado por matching + market dashboard
```

## Tablas previstas

### `profiles`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID / serial | PK |
| `session_id` | UUID | UNIQUE, índice |
| `nombre` | varchar | |
| `edad` | int | nullable |
| `ciudad` | varchar | |
| `departamento` | varchar | nullable |
| `nivel_educativo` | varchar | bachiller, tecnico, universitario, … |
| `carrera` | varchar | nullable |
| `experiencia_anios` | int | default 0 |
| `habilidades` | jsonb / text[] | array de strings |
| `sectores_interes` | jsonb / text[] | |
| `salario_esperado_min` | int | nullable, COP |
| `salario_esperado_max` | int | nullable, COP |
| `modalidad` | varchar | presencial, remoto, hibrido |
| `texto_libre` | text | campos extra del wizard |
| `created_at` | timestamp | |

### `job_offers`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID / serial | PK |
| `titulo` | varchar | |
| `empresa` | varchar | |
| `ciudad` | varchar | |
| `departamento` | varchar | nullable |
| `salario_min` | int | nullable |
| `salario_max` | int | nullable |
| `habilidades_requeridas` | jsonb / text[] | |
| `sector` | varchar | |
| `experiencia_requerida` | int | años |
| `nivel_educativo_req` | varchar | |
| `modalidad` | varchar | |
| `descripcion` | text | |
| `publicado_at` | timestamp | |
| `source` | varchar | portal de origen |
| `scraped_at` | timestamp | |

### `coach_messages` (Fase 8)

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID / serial | PK |
| `session_id` | UUID | FK lógica a profiles |
| `role` | varchar | user \| assistant |
| `content` | text | |
| `created_at` | timestamp | |

## Notas de diseño

- Acordar: ¿PostgreSQL (recomendado) o SQLite para demo?
- `GET /profile/{session_id}` → fila en `profiles` por `session_id`.
- Matching puede ser query + scoring en Python sin tabla intermedia (MVP), o tabla `recommendations` si se cachea.
- Dashboard de mercado: agregaciones sobre `job_offers` filtradas por `ciudad` / `sector`.
- Actualizar este archivo cuando backend y pipeline acuerden el driver y migraciones.
