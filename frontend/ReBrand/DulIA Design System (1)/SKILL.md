---
name: dulia-design
description: Use this skill to generate well-branded interfaces and assets for DulIA — a Spanish-language, dark-mode AI career-coach for young Colombians (18–25). Contains essential design guidelines, colors, type, fonts, assets, and a 3-screen UI kit (Landing → Wizard → Results) for prototyping or production.
user-invocable: true
---

# DulIA — Design Skill

DulIA es un coach de carrera con IA para jóvenes colombianos. La identidad visual es **dark mode profundo (#0D0D0D)** con acentos en **gradiente violeta** (`#7C3AED → #A855F7 → #C084FC`) y **magenta** (`#EC4899`) para CTAs. Tono Duolingo-tech: cercano, motivador, tuteo.

## Cómo usar

1. Lee `README.md` — tiene CONTENT FUNDAMENTALS (voz, microcopy ejemplos), VISUAL FOUNDATIONS (color, tipo, espacio, animación, hover/press) e ICONOGRAPHY.
2. Importa `colors_and_type.css` en cualquier HTML que generes — trae **todos los tokens** (color, tipografía Poppins+Inter, radii, sombras/glows, motion, spacing).
3. Para UI completa: copia y referencia desde `ui_kits/dulia/`:
   - `components.jsx` (átomos: Button, Header, Chip, ScoreRing, IconBox, Icon, Logo)
   - `kit.css` (estilos del kit)
   - `Landing.jsx`, `Wizard.jsx`, `Results.jsx` (pantallas)
4. Assets brand: `assets/dulia-logo.svg`, `assets/dulia-mark.svg`, `assets/bg-blobs.svg`.
5. Iconos: Lucide (stroke 1.75, currentColor). Lista usada en `components.jsx > ICONS`.

## Reglas no negociables

- **Fondo siempre `#0D0D0D` plano.** Nunca azulado, nunca gris.
- **Violeta sólo en gradiente** (135° preferido). Nunca plano.
- **Magenta `#EC4899` reservado para CTAs primarios** y momentos de celebración. <10% de la superficie.
- **Border-radius `20px`** para cards, `14px` para inputs, `999px` para botones/chips.
- **Cards llevan glow violeta sutil** (`var(--glow-violet)`), no drop-shadow agresivo.
- **Tuteo siempre.** Sentence case en headings. Imperativo en CTAs (`Empezar`, `Descubre tu potencial`).
- **Una acción dominante por pantalla** — flujo lineal Duolingo.
- **Sin emojis** dentro del producto. Sí glifos `★ ✦ ◆` como acentos.

## Si el usuario pide algo

- **Nueva pantalla** → usa los átomos de `components.jsx`, los tokens de `colors_and_type.css`, y mantén el sistema (radii, glow, tono).
- **Variantes / tweaks** → varía dentro del sistema (color de gradiente, tamaños). No inventes nuevas paletas.
- **Slides / pitch** → fondo `#0D0D0D`, headline en `gradient-text`, logo en esquina, atmósfera radial.
- **Producción** → todos los tokens son CSS vars; mapéalos a Tailwind config si el equipo usa Tailwind (el repo `jufraas/DulIa` lo hace).

Si el usuario invoca esta skill sin contexto, pregúntale **qué pantalla o pieza** quiere construir, **para qué momento** (pitch, demo, prod) y **si quiere variantes**.
