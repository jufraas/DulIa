# Zustand para perfil y resultados

- **Fecha:** 2026-05-23
- **Área:** frontend
- **Estado:** activa
- **Autor/es:** Equipo frontend

## Contexto

Tras enviar el formulario, `/resultados` necesita el payload del perfil y la respuesta del análisis. Pasar todo por `navigate(state)` es frágil (refresh pierde datos).

## Decisión

Store mínimo en `frontend/src/store/useProfileStore.js` con Zustand:

- `profile` — lo que envió el usuario
- `result` — respuesta de la API o mock
- `setProfile`, `setResult`, `reset`

## Por qué

- API más simple que Context + reducer para 2 campos.
- Ya en `package.json`; sin boilerplate.
- Suficiente para hackathon; no persiste en localStorage (evita PII en disco por ahora).

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Props drilling | No escala entre rutas |
| React Context | Más código para el mismo resultado |
| localStorage | Riesgo/privacidad; innecesario en demo |

## Consecuencias

- Refresh en `/resultados` redirige a `/comenzar` si `result` es null.
- PDF y futuras pantallas leen del mismo store.
- Si se necesita persistencia, documentar nueva decisión aquí.
