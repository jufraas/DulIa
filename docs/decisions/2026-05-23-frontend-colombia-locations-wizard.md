# Selects departamento → municipio (DANE) en onboarding

- **Fecha:** 2026-05-23
- **Área:** frontend
- **Estado:** activa
- **Autor/es:** Equipo frontend

## Contexto

El paso 1 del wizard usaba inputs de texto libre para ciudad y departamento, con validación débil y datos inconsistentes para el mercado laboral.

## Decisión

Catálogo estático DIVIPOLA en `frontend/src/constants/colombiaLocations.js`:

- 32 departamentos (Bogotá D.C. dentro de Cundinamarca)
- 1.119 municipios
- Helpers: `getDepartmentOptions()`, `getCityOptions()`, `resolveLocationFields()` (CV prefill)

Regenerar desde JSON DANE:

```bash
cd frontend
node scripts/build-colombia-locations.mjs .tmp/colombia_completa.json
```

## UI

`StepPersonalInfo.jsx`: select departamento → select ciudad (ciudad deshabilitada hasta elegir depto). Ambos obligatorios en `validateOnboardingStep.js`.

## Consecuencias

- Payload `POST /profile` recibe strings canónicos alineados al mercado.
- Borradores wizard y CV con solo ciudad infieren departamento vía `resolveLocationFields`.
- **Alias CV/Gemini (2026-05-23):** nombres frecuentes (`Bogotá`, `Atlantico` sin tilde) se resuelven al municipio/departamento canónico DANE antes de rellenar los selects.
