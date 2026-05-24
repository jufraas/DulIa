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
- Columna izquierda: **un solo** `card-dl` con `ScoreCard` (`embedded`, compacto) + `PdfDownloadCard` (`pdf-card-in-grid`, altura natural) + `RegisterProgressButton` (compacto).
- Columna derecha: `ProfileSummary` (`profile-summary-card`).
- CSS en `dulia-kit.css`: ambas columnas **580px** en `lg+`; columna izq. con **`ScoreCard compactGrid`**, **`pdf-card-in-grid`**, **`RegisterProgressButton` compact** — **congelado** (2026-05-24).
- Columna derecha: scroll interno en `ProfileSummary`.

### 3. Layout `/resultados` congelado

- Diseño visual aprobado — **no modificar** `.analysis-overview-grid*`, `compactGrid`, `pdf-card-in-grid` sin pedido explícito.
- Nuevos bloques: insertar entre secciones o al final en `ResultsPage.jsx`.
- Regla Cursor: `.cursor/rules/results-layout-frozen.mdc` · nota en `COMPONENT_OWNERS.md`.

### 4. Contenido y captura PDF (2026-05-24)

- Bloques separados: header, intro (+ skills), score, análisis, plan, radar, timeline, oportunidades, mercado, perfil.
- Captura con `scrollHeight` (evita recorte de texto).
- `ScoreRing exportMode` — número visible en html2canvas (sin `background-clip: text`).
- Datos alineados a pantalla: intro tipo `ProfileSummary`, timeline 90d, top job fallback.

## Consecuencias

| Aspecto | Detalle |
|---------|---------|
| Bundle PDF | Chunk lazy ~600KB (html2canvas) al descargar |
| Mantenimiento | Misma estructura visual que pantalla; cambios en JSX del PDF |
| Desktop | Score `compactGrid` arriba; PDF + CTA progreso en `__actions` (scroll si overflow); **580px fijos** |
| Móvil | Columnas apiladas; resumen con `max-height` y scroll |

## Referencias

- [frontend/COMPONENT_OWNERS.md](../../frontend/COMPONENT_OWNERS.md)
- [FRONTEND_INTEGRATION.md](../FRONTEND_INTEGRATION.md)
