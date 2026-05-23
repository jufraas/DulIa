# Post-MVP — Embellecimientos y fase 2

> Ideas para **después** de cerrar el flujo principal de DulIA (coach de carrera para jóvenes colombianos).  
> **No mezclar con el pitch de 3 min** salvo como slide de roadmap (20–30 s).

**Idea principal (MVP):** landing → wizard (+ CV) → perfil → score → vacantes con semáforo → plan 30d → PDF → coach.

---

## Cómo usar este documento

| Prioridad | Cuándo | Objetivo |
|-----------|--------|----------|
| **P0** | Antes del pitch | Demo fluida y “wow” visual sin cambiar la historia |
| **P1** | Refuerza el core | Misma idea, más profundidad — **recomendado para roadmap en pitch** |
| **P2** | Fase 2 producto | Retención, cuenta, sync entre dispositivos |
| **P3** | Spinoff / otro vertical | **No mezclar en MVP** — ver [ideallamativamacondo.md](./ideallamativamacondo.md) |

---

## P0 — Pulido pre-pitch (misma historia)

### Deploy público

- **Qué:** Front en Vercel + backend en Railway/Render con `CORS_ORIGINS` y `VITE_API_URL`.
- **Por qué:** URL compartible en demo; el jurado no abre localhost.
- **Dueño:** Carlos (backend) + quien despliegue front.
- **Estado:** Pendiente.

### Termómetro de mercado en UI

- **Estado:** ✅ `MarketThermometer` en `/resultados` y `/vacantes`.

### Burbuja / chat del coach

- **Estado:** ✅ `CoachChatBubble` + `useCoachChat.js` en `/resultados`.

### Plan 30 días desde backend (Carlos)

- **Estado:** ✅ Front usa `POST .../action-plan` (Plan 2); legacy `GET /plan/{id}` deprecado.

### Copy con datos reales (no hardcode)

- **Estado:** ✅ `OpportunitiesPreview` usa `market.total_vacantes_activas`; `ScoreCard` usa `comparativa` del analyze.
- **Pendiente:** prototipos kit huérfanos (`Landing.jsx`, `Wizard.jsx`).

### Links externos en vacantes

- **Estado:** ✅ Preview + panel semáforo; mocks con URL demo.

### Plan 30d dentro del PDF

- **Estado:** ✅ PDF incluye score, análisis IA, plan 30d, radar, jobs, mercado y perfil.

### Vacantes reales en BD

- **Qué:** Pipeline inserta jobs en Supabase (`USE_MOCK_DATA=false`).
- **Por qué:** Demo con ofertas creíbles de Barranquilla/Caribe.
- **Dueño:** Jose + Carlos.

---

## P1 — Refuerza el pitch (roadmap recomendado en slide)

> Estas ideas **profundizan DulIA como coach de carrera** — encajan en el pitch como “fase 2” sin confundir el producto.

### Login opcional + “Guardar mi progreso”

- **Qué:** Tras resultados, CTA: “Crea cuenta para no perder tu plan” (Google OAuth vía Supabase Auth).
- **Por qué:** Retención; modelo freemium; el jurado ve producto recurrente, no one-shot.
- **Principio:** **No obligatorio** — el flujo anónimo actual sigue igual para demo y baja fricción.
- **Dueño:** Carlos (auth + BD) + Migue (API/link session) + Joufra (UX modal).
- **Migración:** Vincular `session_id` anónimo → `user_id` al registrarse.

### Timeline interactiva del plan 30 días

- **Qué:** `ThirtyDayPlan` con checks por tarea, semana activa, barra de progreso (%).
- **Por qué:** “Una cosa a la vez” se vuelve accionable; el usuario **siente** avance.
- **Reglas v1 (simple):**
  - Usuario marca tareas completadas (checkboxes).
  - Semana N+1 visible; opcional desbloqueo por fecha (`started_at + 7 días`).
- **Dueño:** Joufra (UI) + Carlos (persistencia).
- **Sin login:** Progreso en `localStorage` / extensión de `dulia_session_data`.
- **Con login:** Sync en tabla `plan_progress`.

### Persistencia de progreso (backend)

- **Qué:** Tabla `plan_progress` + endpoints:

  ```
  GET   /api/plan/{session_id}/progress
  PATCH /api/plan/progress   { completed_tasks, current_week, ... }
  POST  /api/auth/link-session   { session_id } → asocia a user
  ```

- **Campos sugeridos:** `user_id`, `session_id`, `started_at`, `current_week`, `completed_tasks[]`, `updated_at`.
- **Dueño:** Carlos.

### Coach con contexto de progreso

- **Qué:** Al chatear, el coach sabe en qué semana vas y qué tareas faltan.
- **Por qué:** Diferenciador vs ChatGPT genérico — “llevas 2/3 tareas de la semana 1”.
- **Dueño:** Carlos (prompt + contexto) + Joufra (UI).
- **Depende de:** Timeline + progreso persistido.

### Banner “modo demo” / health

- **Qué:** Mostrar en UI si `apiUsesMock` o backend en mock (discreto, dev/demo).
- **Dueño:** Migue / Joufra.
- **Estado:** `apiUsesMock` en store; UI no montada.

---

## P2 — Producto maduro (post-hackathon)

| Idea | Descripción |
|------|-------------|
| **Notificaciones / email** | Recordatorio semanal del plan (“Esta semana: aplica a 3 vacantes verdes”). |
| **Historial de planes** | Usuario ve planes anteriores al regenerar perfil. |
| **Percentil de empleabilidad real** | Score vs cohorte (ciudad, edad, sector) — requiere analytics o BD agregada. |
| **Más fuentes de vacantes** | Adzuna, Jooble, scrapers regionales en pipeline. |
| **Panel empleador / B2B** | Empresas publican vacantes “verdes” — fuera de scope hackathon. |

---

## P3 — Línea aparte (no mezclar en pitch principal)

### Startup Potential Analyzer (MacondoLab-style)

- **Qué:** Evaluar si un **proyecto/startup** tiene potencial (escalabilidad, impacto, viabilidad…).
- **Usuario:** Emprendedores / equipos en incubadoras — **≠** joven buscando empleo.
- **Por qué NO en MVP:** Dispersa la marca; otro wizard, otras métricas, otro pitch.
- **Cuándo sí:** Post-validación de DulIA carrera, o partnership con incubadoras / MacondoLab.
- **Detalle completo:** [ideallamativamacondo.md](./ideallamativamacondo.md)

---

## Qué decir en el pitch (30 s de roadmap)

> “Hoy completas tu perfil, ves vacantes con semáforo anti-estafa y te llevas un plan de 30 días en PDF.  
> **Próximo paso:** cuenta opcional para seguir tu timeline semana a semana y un coach que sabe dónde vas en el plan.  
> Exploramos después herramientas para ecosistemas de innovación, pero el foco es el joven colombiano que busca su primer empleo con seguridad.”

---

## Decisiones pendientes (equipo)

1. ¿Login obligatorio o solo opcional post-resultados? → **Recomendado: opcional**
2. ¿Progreso del plan por checks, por fechas, o ambos? → **Recomendado: checks primero**
3. ¿Actualizar decisión [sin-login](../decisions/2026-05-23-sin-login-flujo-anonimo.md) a “sin login **obligatorio**”? → Cuando implementen P1

---

## Relación con docs principales

| Doc | Contenido |
|-----|-----------|
| [PROJECT_STATE.md](../PROJECT_STATE.md) | Estado actual del MVP |
| [ENDPOINTS.md](../ENDPOINTS.md) | Contrato API (incl. plan pendiente backend) |
| [ideallamativamacondo.md](./ideallamativamacondo.md) | Idea spinoff emprendimiento |

_Última actualización: 2026-05-23 — consolidado desde conversación de equipo (Migue + roadmap pitch)._
