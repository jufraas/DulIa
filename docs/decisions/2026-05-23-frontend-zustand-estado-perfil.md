# Zustand para perfil y resultados

- **Fecha:** 2026-05-23
- **Área:** frontend
- **Estado:** activa
- **Autor/es:** Equipo frontend

## Contexto

Tras enviar el formulario, `/resultados` necesita el payload del perfil y la respuesta del análisis. Pasar todo por `navigate(state)` es frágil (refresh pierde datos).

## Decisión

Store en `frontend/src/store/useProfileStore.js` con Zustand:

- `savedProfile` — respuesta `POST /profile`
- `formSnapshot` — copia del formulario enviado
- `jobs`, `market` — resultados paralelos
- `sessionId`, `sessionHydrated` — control de sesión
- Setters persisten en `dulia_session_data` vía `sessionCache.js`

## Por qué

- API más simple que Context + reducer para pocos campos.
- Ya en `package.json`; sin boilerplate.
- Persistencia en localStorage para sobrevivir refresh (ver [2026-05-23-frontend-session-rehydration.md](./2026-05-23-frontend-session-rehydration.md)).

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Props drilling | No escala entre rutas |
| React Context | Más código para el mismo resultado |

## Consecuencias

- Refresh en `/resultados` ya **no** redirige si hay cache o perfil en API.
- PDF y pantallas de resultados leen del mismo store.
- Borrador del wizard en `dulia_wizard_draft` para refresh en `/comenzar`.
