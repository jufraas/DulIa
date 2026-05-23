# ARCHITECTURE — Arquitectura de DulIA

## Diagrama general

```
┌─────────────┐     HTTP/REST      ┌─────────────────────┐
│   Frontend  │ ◄────────────────► │      Backend        │
│ React+Vite  │   JSON o multipart │  FastAPI + Uvicorn  │
│  Tailwind   │                    │  + MarkItDown (CV)  │
└─────────────┘                    └────────┬────────────┘
                                            │
                              ┌─────────────┼──────────────┐
                              │             │              │
                    ┌─────────▼──────┐  ┌───▼───┐  ┌──────▼──────┐
                    │  Base de datos │  │  BD   │  │ Gemini API  │
                    │  (por definir) │  │  ...  │  │  (Google)   │
                    └────────────────┘  └───────┘  └─────────────┘
                              ▲
                    ┌─────────┴──────┐
                    │    Pipeline    │
                    │  scrapers.py   │
                    └────────────────┘
```

## Módulos

### `frontend/`
- SPA **sin login**: landing → onboarding → resultados → PDF.
- Captura perfil (wizard 3 pasos) y **opcionalmente CV PDF**.
- Envía `POST /api/profile` (JSON o multipart).
- Muestra resultados; genera PDF descargable (jsPDF).
- Mock local si backend no está listo.
- **No** convierte PDF, **no** llama a Gemini.
- **Responsable:** Equipo frontend

### `backend/`
- API REST; orquesta Gemini (`docs/PROMPTS.md`).
- Si recibe CV: **MarkItDown** (Python) → markdown para el prompt.
- Lee ofertas de BD (cuando pipeline esté activo).
- **Responsable:** Carlos

### `pipeline/`
- Scrapers de portales laborales colombianos → BD.
- Independiente del backend.
- **Responsable:** Compa 2

## Flujo principal (happy path)

0. Usuario ve **landing** (sin registro).
1. Usuario en **onboarding**:
   - Completa wizard (datos laborales), y/o
   - **Importa CV en PDF** (opcional).
2. Frontend envía `POST /api/profile`:
   - JSON solo, o
   - `multipart`: `profile` + `cv`.
3. Backend:
   - Si hay CV → MarkItDown → `cv_markdown`.
   - Arma prompt: formulario + cv_markdown + ofertas BD.
4. Backend llama **Gemini**.
5. Backend responde JSON (score, oportunidades, roadmap).
6. Frontend muestra **resultados** + botón **descargar PDF**.

## Comunicación entre módulos

| De | A | Protocolo |
|----|---|-----------|
| Frontend | Backend | HTTP REST (JSON o multipart/form-data) |
| Backend | MarkItDown | Librería Python (in-process) |
| Backend | Gemini | HTTPS (SDK Google) |
| Backend | BD | Driver nativo (por definir) |
| Pipeline | BD | Driver nativo (por definir) |

## Responsabilidades: datos del usuario

| Dato | Frontend | Backend |
|------|----------|---------|
| Formulario wizard | Captura + valida | Recibe JSON |
| CV PDF | Sube archivo | Convierte a MD |
| Análisis IA | Muestra resultado | Gemini |
| PDF plan de acción | Genera (jsPDF) | — |
