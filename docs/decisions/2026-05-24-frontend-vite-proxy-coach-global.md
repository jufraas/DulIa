# Proxy Vite para API + coach global en la SPA

- **Fecha:** 2026-05-24
- **Área:** frontend
- **Estado:** activa
- **Autor/es:** Equipo frontend (Migue)

## Contexto

1. **Subida de CV:** `POST /profile/parse-cv` fallaba en dev cuando el usuario abría Vite por IP de red (`192.168.x.x:5173`) con `VITE_API_URL=http://localhost:8000/api` — el navegador bloqueaba la petición por CORS. Además, axios con `Content-Type: application/json` por defecto rompía el boundary de `multipart/form-data`.
2. **Coach:** el FAB y el chat solo vivían en `/resultados`; el producto pide ayuda contextual en landing, wizard y vacantes.

## Decisión

### API en desarrollo

- `VITE_API_URL=/api` (relativo) en `frontend/.env.local`.
- Proxy en `vite.config.js`: `/api` → `http://127.0.0.1:8000`.
- `parseCvPdf()` usa **`fetch` + `FormData`** (no axios) para que el browser ponga el boundary correcto.
- Errores de red/CORS/422 se muestran en la UI; no se usa mock silencioso en fallos de upload.

### Coach global

- `AppCoachShell` envuelve las rutas en `App.jsx`.
- `coachPageContext.js` define teaser/mensaje por ruta.
- FAB visible en todas las páginas excepto `/login`, `/registro`, `/construcción`.
- `CoachPromptBanner` solo en `/resultados`.
- `CoachAskLink` en hero, CTA, about, onboarding y vacantes.

### Backend (requisito para CV)

- Uvicorn debe arrancar con **`backend/.venv`**, no con Python del sistema — sin `markitdown[pdf]` el endpoint devuelve **422**.
- Windows: `.\.venv\Scripts\uvicorn.exe main:app --reload --port 8000`

## Por qué

- Proxy same-origin elimina CORS en dev (localhost e IP de red).
- `fetch` nativo es el patrón estándar para uploads multipart.
- Coach global refuerza el pitch “siempre hay alguien que te guía” sin duplicar providers por página.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Ampliar `CORS_ORIGINS` con cada IP LAN | Frágil; cambia en cada red |
| axios + manual boundary | Propenso a errores |
| Coach solo en resultados | No cubre dudas en wizard/landing |

## Consecuencias

- **Prod:** `VITE_API_URL` apunta al backend desplegado; no hay proxy Vite en build.
- **Docs:** `frontend/README.md`, `FRONTEND_INTEGRATION.md`, ADR CV actualizado.
- **Deps:** `pdfplumber` explícito en `backend/requirements.txt` (fallback de conversión).
