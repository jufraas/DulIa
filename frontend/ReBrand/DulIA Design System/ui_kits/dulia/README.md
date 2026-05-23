# DulIA Web — UI Kit

Recreación hi-fi del flujo del producto: **Landing → Wizard (3 pasos) → Resultados**.

## Pantallas

| Componente | Archivo | Pantalla |
|---|---|---|
| `Landing`  | `Landing.jsx` | Hero + 4 features + CTA |
| `Wizard`   | `Wizard.jsx`  | 3 pasos (habilidades, experiencia, objetivos) |
| `Results`  | `Results.jsx` | Score ring + perfil IA + oportunidades + plan 30 días + **PDF** |

## Átomos compartidos

En `components.jsx` (expuestos en `window.DK`):

- `Icon`, `Logo`
- `Button` — variantes `primary` (gradiente magenta→violeta), `secondary`, `ghost`
- `Header` — sticky con blur
- `Chip` — seleccionable con check
- `IconBox` — cuadrado redondeado con gradiente, para features
- `ScoreRing` — anillo animado 0–100, gradiente brand, shadow del mismo color

## Cómo correrlo

Abre `index.html`. Es un SPA con routing por hash (`#home`, `#wizard`, `#results`).
La navegación es real (Empezar → Siguiente → Analizar → Resultados). Los datos del
wizard no se envían a ningún API — se mantienen en estado local.

## Notas de fidelidad

- El **PDF download button** en `Results` está deliberadamente sobre-amplificado:
  card con gradiente brand completo + glow magenta + botón secundario interno.
  Es el elemento más visible de la pantalla — pensado para que se fotografíe en el pitch.
- El **score ring** anima desde 0 hasta el valor real con `cubic-bezier(0.16, 1, 0.30, 1)`
  en 1.2s. Color por rango: rojo / ámbar / verde.
- **Wizard transitions** son slide+fade controladas por la clave `key={step}` en React.
- Header es la única zona con `backdrop-filter: blur` — coherente con el resto del
  sistema (opaco).

## Faltantes / próximos

- Falta vista mobile responsiva real (el kit fue diseñado en desktop primero).
- Falta empty-state cuando el score es bajo (<50) — sólo se muestra el caso "feliz".
- El detector de vacantes falsas aparece como una advertencia in-line; podría
  tener su propia vista de detalle.
