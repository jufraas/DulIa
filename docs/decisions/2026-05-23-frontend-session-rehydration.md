# Rehidratación de sesión al refresh

- **Fecha:** 2026-05-23
- **Área:** frontend
- **Estado:** activa
- **Autor/es:** Migue

## Contexto

Zustand vive solo en memoria. Tras completar el wizard y llegar a `/resultados`, un refresh vaciaba el store y redirigía a `/comenzar`. El backend ya exponía `GET /profile/{session_id}`, pero en mock siempre devuelve 404.

## Decisión

Capa de persistencia en **localStorage** + rehidratación al boot:

1. **`dulia_session_id`** — UUID anónimo (ya existía).
2. **`dulia_session_data`** — cache de `savedProfile`, `jobs`, `market`, `formSnapshot` tras completar wizard.
3. **`dulia_wizard_draft`** — paso + campos si el usuario refresca en `/comenzar` antes de enviar.
4. **`sessionHydration.js`** — al iniciar app: lee cache → intenta `GET /profile` → re-fetch jobs/market si faltan.
5. **`ResultsPage`** — espera `sessionHydrated` antes de redirigir.

Archivos: `sessionCache.js`, `sessionHydration.js`, `useSessionHydration.js`, `SessionLoading.jsx`.

## Por qué cache local además de GET /profile

- En `USE_MOCK_DATA=true`, `GET /profile` siempre 404 — sin cache, refresh rompe el demo.
- En producción, cache da carga instantánea; GET sirve para sincronizar con BD si el usuario cambia de dispositivo (mismo session_id).

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Solo GET /profile | Insuficiente en mock |
| Zustand persist middleware | Menos control sobre qué se guarda (PII) |
| sessionStorage | No sobrevive cierre de pestaña en todos los casos; localStorage OK para demo anónima |

## Consecuencias

- Refresh en `/resultados` y `/vacantes` mantiene progreso.
- `useProfileStore` persiste automáticamente al actualizar perfil/jobs/market.
- `createProfile` tiene fallback mock (`mockProfileFromPayload.js`) si el POST falla antes de cachear.

## Relacionado

- [2026-05-23-frontend-zustand-estado-perfil.md](./2026-05-23-frontend-zustand-estado-perfil.md) — store base (actualizar consecuencias)
- [2026-05-23-sin-login-flujo-anonimo.md](./2026-05-23-sin-login-flujo-anonimo.md) — session_id anónimo
