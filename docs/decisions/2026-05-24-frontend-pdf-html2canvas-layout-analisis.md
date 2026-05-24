# PDF de resultados con React + html2canvas y layout «Tu análisis»

**Fecha:** 2026-05-24  
**Área:** frontend  
**Estado:** Aceptado

## Contexto

El export PDF usaba jsPDF imperativo (~230 líneas) difícil de mantener y desalineado con la UI. En `/resultados`, la columna izquierda (score + CTA PDF) y el resumen IA debían verse como **dos contenedores del mismo tamaño**, al mismo nivel visual.

## Decisión

### 1. Generación PDF

- Documento React off-screen: `components/pdf/AnalysisPdfDocument.jsx` + `PdfSection.jsx`.
- Estilos dedicados: `styles/pdf-document.css`.
- Orquestación: `utils/generateAnalysisPdf.jsx` — monta con `createRoot`, **`flushSync` desde `react-dom`**, captura por bloques `[data-pdf-block]` con **html2canvas**, ensambla multipágina con **jsPDF** (lazy en `usePdfDownload`).
- Cada hoja del PDF se rellena con fondo `#0D0D0D` antes del contenido (sin bandas blancas al final).
- Saltos de página por sección: un bloque no se parte de otra; si una sección es más alta que una hoja, continúa en la siguiente.
- Captura en PNG (mejor nitidez que JPEG).
- Se elimina `utils/generateAnalysisPdf.js` (jsPDF manual).

### 2. Layout «Tu análisis»

- Nuevo `AnalysisOverviewGrid.jsx`: grid 2 columnas en desktop.
- Columna izquierda: **un solo** `card-dl` con `ScoreCard` (`embedded`) + `PdfDownloadCard` (`flex-1`).
- Columna derecha: `ProfileSummary` (`profile-summary-card`).
- CSS en `dulia-kit.css`: ambas columnas **580px** en `lg+`; scroll interno solo en el resumen.

### 3. Layout `/resultados` congelado

- Diseño visual aprobado — **no modificar** tamaños/grid/alturas de componentes existentes sin pedido explícito.
- Nuevos bloques: insertar entre secciones o al final en `ResultsPage.jsx`.
- Regla Cursor: `.cursor/rules/results-layout-frozen.mdc` · nota en `COMPONENT_OWNERS.md`.

## Consecuencias

| Aspecto | Detalle |
|---------|---------|
| Bundle PDF | Chunk lazy ~600KB (html2canvas) al descargar |
| Mantenimiento | Misma estructura visual que pantalla; cambios en JSX del PDF |
| Desktop | Score fijo arriba; PDF llena el resto del contenedor izquierdo |
| Móvil | Columnas apiladas; resumen con `max-height` y scroll |

## Referencias

- [frontend/COMPONENT_OWNERS.md](../../frontend/COMPONENT_OWNERS.md)
- [FRONTEND_INTEGRATION.md](../FRONTEND_INTEGRATION.md)
