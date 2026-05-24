# Handoff Frontend — Humanizar labels del análisis (Resumen por DulIA)

> **Para:** Migue (frontend)  
> **De:** Carlos (backend)  
> **Fecha:** 2026-05-24  
> **Prioridad:** Pre-pitch (visual rápido)  
> **Estimación:** ~10 min

## Problema

En `/resultados`, el bloque "RESUMEN — POR DULIA" muestra los labels de fortalezas y debilidades en snake_case literal del backend:

```
✓ FORTALEZAS

educacion:   Estudiante de Ingeniería de Sistemas en la Universidad...
soft_skills: Liderazgo demostrado en capítulos estudiantiles (ACM Uninorte)...
experiencia: Experiencia práctica en desarrollo de videojuegos...
```

Debería verse:

```
✓ FORTALEZAS

Educación:           Estudiante de Ingeniería de Sistemas...
Habilidades blandas: Liderazgo demostrado en capítulos...
Experiencia:         Experiencia práctica en desarrollo de videojuegos...
```

## Causa

El prompt `PROFILE_ANALYSIS` (backend) devuelve `area` con valores fijos en snake_case por contrato:

```json
{
  "fortalezas": [
    { "area": "educacion", "descripcion": "...", "nivel": "alto" },
    { "area": "soft_skills", "descripcion": "...", "nivel": "medio" }
  ]
}
```

Valores posibles de `area`:  
`habilidades_tecnicas` | `experiencia` | `educacion` | `ubicacion` | `soft_skills`

El backend **no va a cambiar** este contrato (otras partes lo consumen). La humanización va en frontend.

## Archivos a tocar

### 1. `frontend/src/utils/analysisDisplay.js`

Agregar un diccionario y usarlo en `mapList`:

```js
const AREA_LABELS = {
  habilidades_tecnicas: 'Habilidades técnicas',
  soft_skills: 'Habilidades blandas',
  educacion: 'Educación',
  experiencia: 'Experiencia',
  ubicacion: 'Ubicación',
}

function humanizeArea(area, fallback) {
  if (!area || typeof area !== 'string') return fallback
  if (AREA_LABELS[area]) return AREA_LABELS[area]
  // Fallback: snake_case → "Snake Case"
  return area
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
```

Y reemplazar las dos líneas que arman `label`:

```js
// antes
fortalezas: mapList(analisis.fortalezas, (f) => ({
  label: String(f.area ?? 'Fortaleza'),
  text: String(f.descripcion ?? f.area ?? ''),
})),
debilidades: mapList(analisis.debilidades, (d) => ({
  label: String(d.area ?? 'A mejorar'),
  text: String(d.descripcion ?? d.area ?? ''),
})).slice(0, 2),

// después
fortalezas: mapList(analisis.fortalezas, (f) => ({
  label: humanizeArea(f.area, 'Fortaleza'),
  text: String(f.descripcion ?? f.area ?? ''),
})),
debilidades: mapList(analisis.debilidades, (d) => ({
  label: humanizeArea(d.area, 'A mejorar'),
  text: String(d.descripcion ?? d.area ?? ''),
})).slice(0, 2),
```

### 2. (Opcional) `frontend/src/components/results/ProfileSummary.jsx`

Si querés mejorar también la jerarquía visual de los bullets, mirá las líneas 73–80 y 90–97. La estructura `<strong>{label}:</strong> {text}` ya está bien una vez que el label sea humano; no hace falta más.

## Verificación

1. Reiniciar Vite (`npm run dev`).
2. En `/resultados` con la sesión `demo-pitch-tech` (o cualquier perfil con análisis ya guardado).
3. El bloque "FORTALEZAS" debe mostrar:
   - "Habilidades técnicas:" (no `habilidades_tecnicas:`)
   - "Habilidades blandas:" (no `soft_skills:`)
   - "Educación:" (no `educacion:`)
   - "Experiencia:" (no `experiencia:`)
4. Lo mismo aplica al bloque "A MEJORAR".

## Notas

- El backend va a meter cambios en **scoring de vacantes** (filtro de seniority + boost `hires_youth`). El contrato de `/jobs/recommended` no cambia: mismos campos, mismo `score_compatibilidad`. Solo verás scores más variados (30–85 en lugar de todos en 60–65) y sin "Senior Tech Lead" para estudiantes.
- Si tras los fixes de backend el resumen muestra texto raro (ej. `descripcion` repite el `area`), avisame y vemos en conjunto si toca también ajustar el prompt.
- No hace falta cambiar nada en `useProfileStore`, `loadResultsBundle` ni `ProfileSummary.jsx`.

## Commit sugerido

```
fix(ui): humanize analysis area labels en ProfileSummary

Mapea snake_case del backend (educacion, soft_skills, etc.) a labels
legibles para el bloque "Resumen — por DulIA" en /resultados.
```
