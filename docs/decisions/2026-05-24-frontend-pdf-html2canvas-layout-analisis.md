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
- Orquestación: `utils/generateAnalysisPdf.jsx` — monta con `createRoot`, captura con **html2canvas**, multipágina con **jsPDF** (lazy import desde `usePdfDownload`).
- Se elimina `utils/generateAnalysisPdf.js` (jsPDF manual).

### 2. Layout «Tu análisis»

- Nuevo `AnalysisOverviewGrid.jsx`: grid 2 columnas en desktop.
- Columna izquierda: **un solo** `card-dl` con `ScoreCard` (`embedded`) + `PdfDownloadCard` (`flex-1`).
- Columna derecha: `ProfileSummary` (`profile-summary-card`).
- CSS en `dulia-kit.css`: ambas columnas **580px** en `lg+`; scroll interno solo en el resumen.

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
