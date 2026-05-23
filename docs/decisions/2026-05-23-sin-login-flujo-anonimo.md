# Sin login — flujo anónimo con session_id

- **Fecha:** 2026-05-23
- **Área:** general
- **Estado:** activa (actualizada post-migración API)
- **Autor/es:** Equipo DulIA

## Contexto

Hackathon de 48 h. El producto debe ser usable al instante: el joven entra, da su información y recibe recomendaciones + PDF. No hay tiempo ni necesidad de cuentas de usuario con email/contraseña.

## Decisión

**No hay registro, login ni JWT.** Una visita se identifica con un `session_id` (UUID) generado en el frontend y guardado en `localStorage` (`dulia_session_id`).

Flujo: landing → onboarding (wizard) → resultados (jobs + mercado) → PDF descargable.

## Por qué

- Menos fricción para jóvenes en demo y pitch.
- Frontend más simple (sin auth, recuperación de contraseña, etc.).
- El entregable principal del usuario es el **PDF**, no una cuenta.
- `session_id` permite al backend persistir perfil y recomendaciones sin autenticación formal.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Login con Google/email | Tiempo de implementación; no aporta al MVP del hackathon |
| Cuentas de usuario con password | Requiere auth + schema de usuarios; fase 2 |
| Sin identificador alguno | Imposible recuperar perfil ni calcular jobs en segundo request |

## Consecuencias

- Estado de UI en **Zustand** (frontend). Refresh en `/resultados` sin perfil guardado redirige a `/comenzar`.
- Mensaje UX: *“Descarga tu PDF — no guardamos una cuenta, solo esta visita en tu navegador”* ([PrivacyNotice](../../frontend/src/components/shared/PrivacyNotice.jsx)).
- Backend no requiere autenticación; valida `session_id` como clave anónima.
- `GET /profile/{session_id}` puede devolver 404 si no hay perfil (modo mock del backend).
