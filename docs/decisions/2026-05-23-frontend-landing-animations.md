# Animaciones landing — splash + Framer Motion

- **Fecha:** 2026-05-23
- **Área:** frontend
- **Estado:** activa
- **Autor/es:** Migue

## Contexto

La landing (`WelcomePage`) necesita dos tipos de motion alineados al kit ReBrand:

1. **Splash inicial** al entrar (logo + halo).
2. **Entrada del hero** tras el splash y **reveal al scroll** en features/CTA.

El kit ReBrand indica microanimaciones con `ease-out` y sin scroll-jacking.

## Decisión

- **Librería:** [`framer-motion`](https://www.framer.com/motion/) (ya en `package.json`).
- **Componente compartido:** `src/components/motion/RevealOnScroll.jsx` con dos modos:
  - `trigger="mount"` — `animate` al montar (hero, sincronizado con fin del splash).
  - `trigger="scroll"` — `whileInView` (features, cards, CTA).
- **Orquestación splash:** `WelcomePage.jsx` con fases `splash` → `exit` → `done`.
- **Montaje diferido:** el contenido de la landing monta en `exit` (fade del splash); el hero anima solo cuando `phase === 'done'`.
- **Skip splash en SPA:** variable en memoria (`splashDismissedInSpa`); **recarga de página** vuelve a mostrar splash.

## Por qué

- `whileInView` solo no sirve para el hero: la animación corría detrás del splash opaco y el usuario no la veía.
- Montar hero/features durante el splash desperdiciaba trabajo (ScoreRing, animaciones CSS ocultas).
- Framer Motion ya estaba instalado; evita AOS u otra dependencia.
- `useReducedMotion()` respeta accesibilidad.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Solo CSS `anim-in` | No hay reveal al scroll entre secciones |
| AOS (data attributes) | Menos idiomático en React; deps extra |
| `sessionStorage` para skip splash | Persistía al recargar y ocultaba el splash |
| Montar todo desde frame 0 | ScoreRing y animaciones corrían ocultas bajo el splash |

## Consecuencias

| Archivo | Rol |
|---------|-----|
| `pages/WelcomePage.jsx` | Fases splash + `heroEnter={phase === 'done'}` |
| `components/welcome/LandingSplash.jsx` | Overlay logo (CSS en `dulia-kit.css`) |
| `components/welcome/HeroSection.jsx` | `RevealOnScroll` con `trigger="mount"` |
| `components/welcome/FeaturesSection.jsx` | `trigger="scroll"` (default) en header y cards |
| `components/welcome/CTABanner.jsx` | `trigger="scroll"` |
| `components/motion/RevealOnScroll.jsx` | Wrapper reutilizable |

### Tiempos splash (ajustables)

- Visible: `SPLASH_MS = 1100`
- Fade out: `FADE_MS = 400` (debe coincidir con `.landing-splash--out` en CSS)

### Uso en otras pantallas

```jsx
import RevealOnScroll from '../motion/RevealOnScroll'

// Al scroll
<RevealOnScroll delay={0.1}>...</RevealOnScroll>

// Al montar (ej. tras un modal)
<RevealOnScroll trigger="mount" enter={isOpen}>...</RevealOnScroll>
```
