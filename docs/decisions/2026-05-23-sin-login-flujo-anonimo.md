# Sin login — flujo anónimo lineal

- **Fecha:** 2026-05-23
- **Área:** general
- **Estado:** activa
- **Autor/es:** Equipo DulIA

## Contexto

Hackathon de 48 h. El producto debe ser usable al instante: el joven entra, da su información y recibe análisis + PDF. No hay tiempo ni necesidad de cuentas de usuario.

## Decisión

**No hay registro, login ni sesiones persistentes.** Una visita = un análisis completo.

Flujo: landing → onboarding (formulario ± CV) → resultados → PDF descargable.

## Por qué

- Menos fricción para jóvenes en demo y pitch.
- Frontend más simple (sin auth, JWT, recuperación de contraseña).
- El entregable del usuario es el **PDF**, no una cuenta.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Login con Google/email | Tiempo de implementación; no aporta al MVP del hackathon |
| Guardar perfil en BD por usuario | Requiere auth + schema de usuarios; fase 2 |

## Consecuencias

- Estado del análisis vive en **Zustand en memoria** (frontend). Refresh en `/resultados` redirige a `/comenzar`.
- Mensaje UX recomendado: *“Descarga tu PDF — no guardamos tu sesión”*.
- Backend no necesita autenticación en endpoints del MVP.
