# DulIA — Design System

> **DulIA** es un *coach de carrera personal con inteligencia artificial* para jóvenes colombianos (18–25). Una plataforma web que analiza tu perfil y te entrega:
>
> 1. Oportunidades laborales reales (scrapeadas de portales colombianos).
> 2. Un **score de empleabilidad** del 0 al 100.
> 3. Un **plan de acción de 30 días** descargable en PDF.
> 4. Un detector de vacantes falsas + termómetro del mercado.
>
> Construida en **Barranqui-IA 2026** (hackathon, 48 h) por el equipo `krl0s · Migue · Jose · Jufra`.

Este folder es el sistema de diseño que acompaña al producto: tokens de color y tipografía, motivos visuales, lenguaje de UI y un UI kit listo para componer pantallas.

---

## 🧾 Fuentes

| Fuente | Link | Estado |
|---|---|---|
| GitHub repo principal | https://github.com/jufraas/DulIa | Sólo scaffolding (no había código de UI todavía en el momento de capturar el sistema). |
| Brief de diseño | Pasted_text dentro de la conversación inicial. | Fuente principal de la dirección visual. |
| AI_CONTEXT, ARCHITECTURE, etc. | https://github.com/jufraas/DulIa/tree/main/docs | Contexto de producto, stack y flujo. |

> 💡 **Para iterar sobre este sistema:** si en el repo `jufraas/DulIa` ya hay UI implementada en `frontend/`, explorar esa carpeta primero — los tokens aquí derivan del brief, no del código (que estaba vacío). El equipo puede sustituir componentes y revalidar.

---

## 📂 Índice del folder

```
DulIA-Design-System/
├── README.md                  ← este archivo
├── SKILL.md                   ← cómo usar este folder como skill
├── colors_and_type.css        ← TODOS los tokens (color, tipo, radii, sombras, motion)
├── fonts/                     ← (usamos Google Fonts via CDN — ver nota)
├── assets/                    ← logo, glyphs, fondos
├── preview/                   ← cards estáticas del Design System tab
└── ui_kits/
    └── dulia/                 ← UI kit principal: landing + wizard + resultados
        ├── index.html
        ├── Landing.jsx
        ├── Wizard.jsx
        ├── Results.jsx
        └── components.jsx
```

---

## ✍️ CONTENT FUNDAMENTALS

DulIA habla **español colombiano informal**, dirigido a jóvenes de 18–25 años. El tono es el de un coach cercano — confiado, motivador, nunca corporativo.

### Voz

- **Tuteo siempre.** "Tu perfil", "lo que sabes hacer", "descubre tu potencial". Nada de "usted".
- **Frases cortas y directas.** El producto es lineal tipo Duolingo: una acción por pantalla, una idea por frase.
- **Lenguaje de impulso, no de pedagogía.** No explicamos al usuario lo que es la IA — lo invitamos a usarla.
- **Cero jerga corporativa de RRHH.** Evitamos "competencias", "stakeholders", "sinergias". Sí usamos: *habilidades, lo que sabes, oportunidades, plan, score, perfil*.

### Casing & puntuación

- Headings en **Sentence case** (no Title Case). _"Descubre tu potencial"_, no _"Descubre Tu Potencial"_.
- Botones primarios en imperativo: **Empezar**, **Analizar mi perfil**, **Descargar mi plan**.
- Tildes siempre. El producto es colombiano; "más", "está", "cómo" llevan tilde.
- Sin emojis dentro del cuerpo del producto (la UI tiene suficiente personalidad gráfica). Sí pueden aparecer **glifos brand** (★, ◆, ✦) como acentos visuales en encabezados.

### Microcopy: ejemplos canónicos

| Lugar | Copy ✅ | Anti-copy ❌ |
|---|---|---|
| Hero | **Tu carrera, con IA de tu lado.** | *Una plataforma integral para potenciar tu trayectoria profesional*. |
| Subhero | DulIA analiza tu perfil y te dice exactamente qué hacer en los próximos 30 días. | El sistema realiza un análisis exhaustivo de competencias laborales. |
| CTA principal | **Descubre tu potencial** | *Comenzar registro* |
| Wizard intro | Cuéntanos qué sabes hacer. Tres pasos, dos minutos. | *Por favor complete el formulario a continuación.* |
| Wizard validación | Necesitamos al menos una habilidad. | *Error: campo requerido.* |
| Resultados | Tu score es **78**. Vas mejor de lo que crees. | *Su puntaje obtenido es 78/100.* |
| CTA PDF | **Descargar mi plan de 30 días** | *Exportar resultados* |
| Detector vacantes | Esta vacante huele raro. | *Esta oferta presenta inconsistencias.* |

### Vibe en una línea

> Coach que te conoce, te habla parejo y te empuja a moverte hoy.

---

## 🎨 VISUAL FOUNDATIONS

### Paleta

- **Fondo profundo:** `#0D0D0D` plano — sin negro azulado, sin gris. Es la firma de marca.
- **Brand ramp (violeta):** `#7C3AED → #A855F7 → #C084FC`. Siempre en este orden y siempre en gradiente diagonal 135° (o 90° horizontal). El violeta no se usa plano — siempre como gradiente o glow.
- **Acento magenta:** `#EC4899` reservado para CTAs primarios y momentos de celebración (score alto, plan listo). Aparece *menos del 10%* de la superficie de cualquier pantalla.
- **Texto:** off-white `#FAFAFC` para títulos, gris claro `#C9C9D6` para cuerpo, gris medio `#8A8A9B` para soporte.

### Tipografía

- **Display: Poppins** (700–900) — para H1, números grandes (el score), CTAs.
- **Body: Inter** (400–600) — para todo lo demás. Inter sostiene mejor el cuerpo a 14–18px.
- **Tracking apretado** (-0.03em) en displays; normal en body; +0.14em en eyebrows uppercase.
- **Substitución actual:** Poppins e Inter se cargan desde Google Fonts CDN. ⚠️ *Si el equipo quiere copias locales para offline / pitch sin internet, descargar los `.woff2` desde Google Fonts y reemplazar la línea `@import` en `colors_and_type.css`.*

### Esquinas y bordes

- **Border-radius por defecto:** `20px` (`--r-lg`) para cards, `14px` (`--r-md`) para inputs, `999px` para botones pill y chips.
- **Bordes con glow púrpura:** cards llevan `1px solid rgba(168,85,247,0.35)` + `box-shadow 0 8px 32px rgba(124,58,237,0.18)`. El "glow" no es un drop-shadow agresivo — es una halo violeta sutil que se intensifica en hover.
- **Sin bordes duros blancos**, sólo el ramp violeta a baja opacidad.

### Backgrounds

- **Base plana** `#0D0D0D` casi siempre.
- **Blobs radiales** detrás del hero y de la pantalla de resultados — uno violeta arriba-izquierda, uno magenta abajo-derecha, ambos al ~20% de opacidad. Suficiente para dar atmósfera, no tanto para distraer.
- **Sin foto-realismo, sin texturas, sin ruido.** Las únicas "imágenes" son ilustraciones generadas en CSS/SVG y los assets propios del producto.

### Sombras / glows (en orden de uso)

1. `--glow-violet` — borde estándar de cards.
2. `--glow-violet-strong` — hover de cards y wizard step activo.
3. `--glow-cta` — botones primarios magenta (sombra magenta + violeta).
4. `--shadow-lg` — overlay y modales.

### Animación

- **Easing:** `cubic-bezier(0.16, 1, 0.30, 1)` por defecto (out-expo). Para confirmaciones y entradas se usa `cubic-bezier(0.34, 1.56, 0.64, 1)` (bounce sutil) — pensado en Duolingo.
- **Duraciones:** 140 ms (toggles), 220 ms (hovers, fades), 420 ms (transiciones de pantalla).
- **Microanimaciones:** los pasos del wizard hacen un slide+fade (24px de desplazamiento). El score llena el anillo en ~1.2 s con `ease-out`. Los chips se elevan 2px en hover.
- **Sin parallax, sin glitch, sin scroll-jacking.**

### Hover & press

- **Hover sobre card:** glow violeta pasa de `0.18` → `0.35` opacidad + `translateY(-2px)`.
- **Hover sobre botón primario:** gradiente cambia a `--grad-cta-hot` (más caliente) + `box-shadow` crece 20%.
- **Press / active:** `transform: translateY(0) scale(0.98)` y reducción del glow al 50% — sensación táctil.
- **Focus visible:** outline magenta `2px solid` separado por `3px` del elemento (no usamos focus-ring nativo).

### Layout

- **Container:** max-width 1200 px, padding lateral 24/48 px (mobile/desktop).
- **Vertical rhythm:** todo se construye sobre `--s-` (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80).
- **Flujo Duolingo:** *una* acción dominante por pantalla. El CTA principal vive en el centro óptico y nunca compite con un secundario.
- **Header sticky** con backdrop-blur de 16 px y `rgba(13,13,13,0.7)` — la única zona con transparencia/blur del sistema. Lo demás es opaco.

### Transparencia & blur

- Solo dos casos: header sticky y overlay de modales. Todo lo demás opaco. La marca no es "vidrioso", es "neón sobre asfalto".

### Cards — anatomía

```
┌─────────────────────────────────────────┐
│  ← border 1px rgba(168,85,247,0.35)     │
│  ← background var(--bg-2) (#1A1A24)     │
│  ← box-shadow var(--glow-violet)        │
│  ← border-radius var(--r-lg) = 20px     │
│  ← padding var(--s-6) = 24px            │
│                                         │
│  [eyebrow violeta 12px uppercase]       │
│  [título Poppins 24/28 bold]            │
│  [body Inter 16 regular gris-2]         │
│  [accent: chip / icono / barra]         │
└─────────────────────────────────────────┘
```

### Imagery

- No hay fotografía real en el sistema. **Sí** hay:
  - **Glow blobs** (radiales violeta/magenta) como atmósfera.
  - **Ilustraciones geométricas** (anillos, arcos, partículas) en CSS/SVG.
  - **Logo gradient** como único elemento de marca con presencia visual fuerte.
- Si en algún momento se agregan fotos de usuarios, deben ir en **tritono violeta** (sombras violeta-700, midtones violeta-500, highlights magenta) — nunca a color natural.

---

## 🪧 ICONOGRAPHY

DulIA usa **Lucide** (https://lucide.dev) como sistema de iconos oficial.

- **Estilo:** stroke 1.75–2px, esquinas redondeadas, sin relleno. Combina perfecto con Poppins/Inter y con el border-radius generoso del sistema.
- **Color:** los iconos siempre toman `currentColor` y heredan del texto. Los iconos brand (en chips, badges) se pintan con `var(--violet-400)` o con el gradiente brand vía `<defs>` SVG.
- **Tamaños:** 16, 20, 24, 28, 32. Botones primarios usan 20 px. Cards de feature usan 28 px dentro de un cuadrado redondeado de 56 px con glow violeta.
- **Carga:** vía CDN `https://unpkg.com/lucide-static@latest/icons/` (SVGs sueltos) o `lucide-react` cuando se integra al frontend real.

> 🚩 **Substitución / flag:** el repo `jufraas/DulIa` no traía un sistema de iconos definido. Lucide es la elección recomendada por su consistencia con Poppins + dark mode; si el equipo prefiere Phosphor, Feather o Heroicons, basta con reemplazar la fuente de iconos y mantener el sizing.

### Emoji y unicode

- **No usamos emoji** dentro del producto. Sí en docs internas / READMEs (como este).
- Sí podemos usar **glifos tipográficos** como `★` `◆` `✦` `→` como acentos en eyebrows o callouts — siempre del color brand, nunca como sustituto de iconografía funcional.

### Logo

`assets/dulia-logo.svg` — marca tipográfica "DulIA" con la `I` y la `A` rellenadas con el gradiente brand. Existe también `dulia-mark.svg` (solo el isotipo) para favicons y avatares.

---

## 🧩 UI Kits

Un solo producto, una sola superficie (la web app DulIA).

| Kit | Ruta | Pantallas |
|---|---|---|
| **DulIA Web** | `ui_kits/dulia/index.html` | Landing → Wizard (3 pasos) → Resultados |

Cada pantalla es un componente JSX dentro de `ui_kits/dulia/`. `index.html` orquesta el flujo lineal con click-through real (botones funcionan, el wizard avanza, el score se anima). Es prototipo visual — no llama a API real.

---

## ⚠️ Caveats

- El `frontend/` del repo estaba vacío al momento de generar el sistema; **los tokens vienen 100% del brief**, no de código real. Cuando el equipo escriba la UI, debería re-validar paddings, font-sizes y radii contra los de Tailwind.
- Fonts cargadas via Google Fonts CDN. Sin red, fallback a `system-ui`.
- Lucide elegido como icon-system *sugerido*; el equipo puede cambiarlo.
- Las copias de texto son sugeridas — el equipo de pitch debe validarlas con su voz.
