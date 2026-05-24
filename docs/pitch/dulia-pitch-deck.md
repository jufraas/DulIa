---
marp: true
theme: default
paginate: true
size: 16:9
backgroundColor: #0D0D0D
color: #FAFAFC
style: |
  section {
    font-family: Inter, "Segoe UI", system-ui, sans-serif;
    background: linear-gradient(160deg, #0D0D0D 0%, #150A22 55%, #0D0D0D 100%);
    padding: 48px 56px;
  }
  section.lead h1 {
    font-size: 2.4em;
    background: linear-gradient(90deg, #C084FC, #F472B6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  h1 { color: #C084FC; font-size: 1.75em; }
  h2 { color: #E9D5FF; font-size: 1.15em; font-weight: 600; }
  strong { color: #F472B6; }
  em { color: #A78BFA; font-style: normal; }
  ul { line-height: 1.55; }
  table { font-size: 0.82em; }
  th { background: rgba(124, 58, 237, 0.35); color: #FAFAFC; }
  td { background: rgba(255, 255, 255, 0.04); }
  blockquote {
    border-left: 4px solid #EC4899;
    background: rgba(236, 72, 153, 0.08);
    padding: 12px 20px;
    font-size: 0.95em;
  }
  code {
    background: rgba(168, 85, 247, 0.15);
    color: #E9D5FF;
    padding: 2px 6px;
    border-radius: 4px;
  }
  footer { color: #6B7280; font-size: 0.65em; }
---

<!-- _class: lead -->
<!-- _paginate: false -->

# DulIA

## Tu coach de carrera con inteligencia artificial

Barranqui-IA 2026 · Universidad Nacional de Colombia

**Demo:** https://dul-ia.vercel.app

---

# El problema

En Colombia, millones de jóvenes buscan empleo con **poca orientación personalizada**:

| Dolor | Qué pasa hoy |
|-------|----------------|
| **Sin rumbo** | Terminan estudios y no saben si buscar práctica, primer empleo o freelance |
| **Demasiado ruido** | Miles de vacantes, pocas alineadas con su perfil real |
| **Ofertas dudosas** | Aplicar sin filtro cuesta tiempo — y a veces dinero |

> *"Tengo habilidades, pero no sé qué hacer **esta semana** para acercarme al mercado."*

---

# La oportunidad

- El **48%** de quienes buscan primer empleo no recibe preparación estructurada para entrevistas.
- Los portales listan vacantes; **no generan un plan de acción** ni miden compatibilidad.
- La IA puede **personalizar** diagnóstico, recomendaciones y práctica — a escala.

**DulIA** cierra esa brecha con un flujo guiado de punta a punta.

---

# Qué es DulIA

Plataforma web que convierte el perfil de un joven en:

1. **Diagnóstico** — fortalezas, brechas y score vs mercado
2. **Oportunidades** — vacantes reales con semáforo de compatibilidad
3. **Plan 30-60-90** — tareas semanales accionables
4. **Seguimiento** — progreso checkeable y entrevista simulada con IA
5. **Coach** — chat contextual sobre tu análisis y vacantes

*No es un chatbot genérico: es un **sistema de orientación laboral** con datos reales.*

---

# Flujo del usuario

```
/  Landing  →  /comenzar  Wizard  →  /resultados  Análisis
                      ↓                      ↓
                 CV PDF (opc.)         Score · Radar · Plan · PDF
                      ↓                      ↓
              /vacantes  Oportunidades   Coach IA (FAB global)
                      ↓
         Login opcional  →  /progreso  →  /entrevistas
```

- **Sin registro** al inicio (`session_id` anónimo)
- **Registro Supabase** para guardar progreso y retomar el plan

---

# Demo — pantallas (capturas aquí)

| Ruta | Valor para el usuario |
|------|------------------------|
| `/comenzar` | Wizard 3 pasos · CV PDF · ubicación DANE · habilidades en tags |
| `/resultados` | Score ring · radar vs mercado · plan por fases · termómetro · PDF |
| `/vacantes` | Listado con **semáforo** verde / amarillo / rojo |
| `/progreso` | Día del plan · tareas · timeline 30/60/90 · desbloqueo al 80% |
| `/entrevistas` | Conversación por skill con feedback al cerrar |

<!-- Speaker note: Mostrar demo en vivo 90 s o video grabado -->

---

# Diferenciadores

- **Vacantes reales** — pipeline híbrido (GetOnBrd, Remotive) · ~380 jobs en BD
- **Scoring transparente** — % match + habilidades que faltan
- **Plan accionable** — no solo diagnóstico; tareas que el usuario marca hechas
- **Enfoque Colombia** — 32 deptos · 1.119 municipios · copy en español
- **IA con contexto** — Gemini conoce perfil, mercado y vacantes del usuario
- **Resiliente** — funciona en demo aunque el backend falle (fallback offline controlado)

---

# Arquitectura

```
┌──────────────┐   REST/JSON   ┌─────────────────┐
│   Frontend   │ ◄──────────► │  Backend FastAPI │
│ React · Vite │               │  + Gemini        │
└──────────────┘               └────────┬─────────┘
                                        │
                         ┌──────────────┼──────────────┐
                         ▼              ▼              ▼
                    Supabase        Gemini API      Pipeline ETL
                   PostgreSQL                         (scrapers)
```

| Repo | Rol |
|------|-----|
| `frontend/` | SPA React 19 · Zustand · Tailwind |
| `backend/` | API · progreso M3 · coach · entrevistas |
| `pipeline/` | Ingesta y refresco de vacantes |
| `docs/` | Contratos, decisiones, runbooks |

---

# IA en el producto

| Feature | Qué hace |
|---------|----------|
| **Parse CV** | Extrae datos del PDF y prellena el wizard |
| **Análisis** | Fortalezas, brechas, nivel de preparación |
| **Plan 30-60-90** | Semanas, hitos y tareas por fase |
| **Radar** | 5 dimensiones: tú vs mercado |
| **Coach** | Chat + function calling (buscar vacantes, explicar brechas) |
| **Entrevista V2** | Chat por etapas (rapport → técnica → cierre) |
| **Progreso** | Día dinámico desde `started_at` · hitos del plan |

Prompts versionados en `backend/prompts/PROMPTS.md`.

---

# Datos y calidad

| Métrica | Valor |
|---------|-------|
| Vacantes activas | ~380 |
| Pool entrevistas | 629 preguntas curadas |
| Tests backend | 24+ (pytest) |
| Tests frontend | 23 smoke (progress, API, entrevista V2) |
| Migraciones Supabase | 002–015 |
| Deploy | Vercel (front) + Railway (back) |

**URLs producción:**
- App: https://dul-ia.vercel.app
- API: https://dulia-production.up.railway.app

---

# Modelo de negocio (visión)

| Segmento | Propuesta |
|----------|-----------|
| **B2C** | Freemium: diagnóstico + plan básico gratis; entrevistas avanzadas premium |
| **B2B** | Licencia para bootcamps, SENA, universidades — cohortes con dashboard |
| **B2G** | Alianza con agencias de empleo municipales / programas de primer empleo |

*MVP actual: validación de producto y tracción en hackathon.*

---

# Equipo

<!-- Reemplazar con nombres y fotos reales -->

| Rol | Foco |
|-----|------|
| **Frontend / UX** | Wizard, resultados, progreso, entrevista, PDF, auth |
| **Backend / IA** | FastAPI, Gemini, progreso, coach, endpoints |
| **Pipeline / datos** | Scrapers, scoring, mercado |
| **Diseño** | Kit ReBrand · design system DulIA |

**Repo:** https://github.com/jufraas/DulIa

---

# Roadmap

| Horizonte | Entregable |
|-----------|------------|
| **Ahora** | Deploy estable · demo pitch · PDF export |
| **Corto** | Entrevista V2 100% backend · más fuentes CO |
| **Medio** | Recordatorios del plan · métricas de retención |
| **Largo** | App móvil · certificaciones por skill · empleadores |

---

# Impacto esperado

- Menos tiempo perdido aplicando a vacantes **no compatibles**
- Plan claro de **90 días** en lugar de listas genéricas de consejos
- Práctica de entrevista **sin costo** antes del contacto real con reclutadores
- Señales de confianza (semáforo) para **evitar ofertas dudosas**

> Medir: usuarios que completan semana 1 del plan · score promedio post-entrevista

---

<!-- _class: lead -->
<!-- _paginate: false -->

# Gracias

## DulIA — De tu perfil a tu próximo paso

**Probar ahora:** https://dul-ia.vercel.app

¿Preguntas?

<!-- QR opcional a la demo -->
