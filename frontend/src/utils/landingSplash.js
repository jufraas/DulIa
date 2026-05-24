/** Tras el primer ciclo de la app, las visitas a `/` son navegación SPA (sin splash). */
let spaNavigationActive = false

/** Llamar desde App tras montar — marca que ya no es la carga inicial del documento. */
export function markSpaNavigationReady() {
  spaNavigationActive = true
}

/** Splash solo en carga/refresco completo de la página, no al volver a `/` por el router. */
export function shouldShowLandingSplash() {
  return !spaNavigationActive
}

/** Tests. */
export function resetLandingSplashState() {
  spaNavigationActive = false
}
