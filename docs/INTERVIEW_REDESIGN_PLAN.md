# INTERVIEW_REDESIGN_PLAN — De quiz a conversación con IA entrevistadora

> **Versión:** v1.0 · 2026-05-24
> **Autores:** DulIA backend (CTO) + Migue (frontend lead)
> **Estado:** Plan F (M4) ✅ frontend · Plan B (B8) 🔲 pendiente backend
> **Suplanta:** [decisions/2026-05-24-mock-interview-seed-pool.md](decisions/2026-05-24-mock-interview-seed-pool.md) (parcial — el pool sigue siendo la fuente de preguntas)

---

## Resumen ejecutivo

El sistema actual (B4–B7) funciona como **quiz lineal**: la IA selecciona 5 preguntas del pool al inicio y las muestra una por una con cronómetro. La utilidad real del producto está en aprovechar al LLM para **encarnar a un entrevistador humano**: que conduzca una conversación con etapas, profundice con repreguntas, conecte el CV con la respuesta, y evalúe holísticamente al final.

Este documento define el rediseño en dos vías paralelas:

- **Plan B (Backend) — DulIA team.** Nueva máquina de estados conversacional + endpoint `/api/interview/v2/turn` con rúbrica por etapa y evaluación contextual.
- **Plan F (Frontend) — Migue.** Nuevo `/entrevistas` con chat en vivo, indicador de etapa, "el entrevistador está escribiendo…" y resumen final segmentado por etapa.

Mantenemos los endpoints **V1** (quiz lineal) en producción hasta que **V2** pase el smoke con jurado. El pool `interview_questions_seed` (629 filas, 521 tech reales + 108 no-tech AI) **se reutiliza tal cual** — cambia cómo se consume, no qué hay dentro.

---

## 1. Motivación y visión

### Limitaciones actuales (quiz)

| # | Limitación | Impacto en pitch |
|---|------------|------------------|
| 1 | Preguntas pre-seleccionadas al inicio, sin reacción al contexto | "Se ve un cuestionario más" |
| 2 | Sin follow-ups ni repreguntas | No demuestra que la IA "entiende" la respuesta |
| 3 | Sin etapas (rapport / técnica / comportamental / cierre) | No mapea a entrevistas reales |
| 4 | Score por mensaje, sin visión holística | Métrica frágil; un mal mensaje hunde la nota |
| 5 | El pool se "muestra"; no se inyecta como contexto rico (rúbrica, keywords) | Subutilizamos los 629 datos curados |
| 6 | Tono uniforme, no adapta voz al sector | Una entrevista de salud suena igual que una de tech |
| 7 | Sin memoria entre turnos (el front pasa todo cada vez) | Difícil escalar a sesiones largas |

### Visión nueva (entrevistador IA)

> *"Cuando el joven entra a `/entrevistas`, no ve un test: ve a Andrea, una entrevistadora del sector que eligió. Andrea lo saluda, le pide que cuente algo de él, le pregunta por la habilidad clave del CV, y según lo que responda, profundiza o cambia de tema. Después de ~6 a 10 turnos, le da feedback estructurado y le sugiere qué practicar."*

**Pilares:**

1. **Etapas explícitas:** `rapport → exploración_técnica → behavioral → cierre`. El back decide cuándo avanzar; el front muestra progreso.
2. **Pool como contexto, no como guion:** las preguntas del pool y sus rúbricas se inyectan al prompt para que la IA repregunte alineada al estándar del sector.
3. **Persona del entrevistador:** nombre + rol + estilo derivados del `target_sector` y `target_role`.
4. **Memoria del backend:** el estado de la conversación vive en `mock_interviews_v2` (jsonb `turns`, `stage_state`); el front solo envía el último mensaje.
5. **Evaluación por etapa, no por mensaje:** al cerrar cada etapa se computa un mini-score; el global agrega.

---

## 2. Contrato V2 — vista de alto nivel

```
POST /api/interview/v2/start          → { interview_id, persona, opening_message, stage: 'rapport' }
POST /api/interview/v2/turn           → { interview_id, message }
                                       ← { reply, stage, stage_advance, evidence?, finished?, summary? }
POST /api/interview/v2/abort          → cierre temprano (descarta scoring)
GET  /api/interview/v2/{id}           → estado completo (para reanudar)
GET  /api/interview/v2/history/{sid}  → historial unificado (V1 + V2)
```

Detalle de shapes en §5.

**V1 (legacy) sigue activa** bajo el mismo prefijo `/api/interview/...` para que el front pueda alternar con un flag (`VITE_INTERVIEW_VERSION=v2`).

---

## 3. PLAN B — Backend (DulIA team) {#plan-back}

Trabajo dividido en **5 hitos secuenciales (B8.1 → B8.5)**. Cada uno deja main en estado verde.

### B8.1 — Modelo de estado y migración

**Objetivo:** persistir entrevistas conversacionales sin romper V1.

**Tareas:**

- [ ] Crear `backend/migrations/016_interview_v2_state.sql`:
  ```sql
  CREATE TABLE public.mock_interviews_v2 (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      session_id text NOT NULL,
      target_skill text,
      target_role text,
      target_sector text NOT NULL,
      persona jsonb NOT NULL,        -- { nombre, rol_entrevistador, estilo }
      stage text NOT NULL DEFAULT 'rapport'
          CHECK (stage IN ('rapport', 'tecnica', 'behavioral', 'cierre', 'finalizada')),
      stage_state jsonb NOT NULL DEFAULT '{}'::jsonb,
                              -- { turns_in_stage: int, objectives_met: text[], evidences: [] }
      turns jsonb NOT NULL DEFAULT '[]'::jsonb,
                              -- [{ role, text, stage, t, evidence? }]
      pool_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
                              -- preguntas+rubricas tomadas al iniciar (no se vuelven a consultar)
      stage_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
                              -- { rapport: int, tecnica: int, behavioral: int, cierre: int }
      global_score integer CHECK (global_score IS NULL OR global_score BETWEEN 0 AND 100),
      weak_skills text[] DEFAULT '{}',
      summary jsonb,          -- bloque final estructurado (ver §5.4)
      status text NOT NULL DEFAULT 'in_progress'
          CHECK (status IN ('in_progress', 'completed', 'aborted')),
      version smallint NOT NULL DEFAULT 2,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      completed_at timestamptz
  );
  CREATE INDEX idx_mi_v2_session ON mock_interviews_v2(session_id);
  CREATE INDEX idx_mi_v2_status ON mock_interviews_v2(status);
  ALTER TABLE public.mock_interviews_v2 DISABLE ROW LEVEL SECURITY;
  ```
- [ ] Aplicar migración en Supabase prod vía SQL Editor o `apply_migration` MCP.
- [ ] Actualizar `docs/SCHEMA.md` con la nueva tabla.

**Definition of Done:**

- Tabla creada en prod, índices vivos.
- `python -c "from app.db.supabase import get_supabase; get_supabase().table('mock_interviews_v2').select('*').limit(1).execute()"` retorna 0 filas sin error.

---

### B8.2 — Modelos Pydantic y persona

**Objetivo:** definir el lenguaje de la API V2 y la "persona" del entrevistador.

**Tareas:**

- [ ] `backend/app/models/interview_v2_models.py`:
  ```python
  class InterviewPersona(BaseModel):
      nombre: str
      rol_entrevistador: str    # ej. "Lead de ingeniería"
      sector: str
      estilo: str               # ej. "cercano, exigente con ejemplos concretos"
      saludo_inicial: str

  class InterviewStartV2Input(BaseModel):
      session_id: str
      target_skill: str | None = None
      target_role: str | None = None

  class InterviewStartV2Response(BaseModel):
      interview_id: str
      persona: InterviewPersona
      opening_message: str       # primer turno del entrevistador (rapport)
      stage: str                 # 'rapport'
      max_turns: int             # hint para UI (ej. 10)

  class InterviewTurnInput(BaseModel):
      message: str = Field(..., min_length=1, max_length=2000)

  class StageAdvance(BaseModel):
      from_stage: str
      to_stage: str
      mini_score: int            # 0-100 sobre la etapa cerrada
      objectives_met: list[str]
      gaps: list[str]

  class InterviewTurnResponse(BaseModel):
      reply: str
      stage: str
      stage_advance: StageAdvance | None = None
      finished: bool = False
      summary: InterviewSummary | None = None  # solo cuando finished=True
      turns_in_stage: int
      total_turns: int

  class StageBreakdown(BaseModel):
      stage: str
      score: int
      strengths: list[str]
      gaps: list[str]
      key_moments: list[str]      # citas textuales de la conversación

  class InterviewSummary(BaseModel):
      global_score: int
      weak_skills: list[str]
      stages: list[StageBreakdown]
      feedback_general: str
      proximos_pasos: list[str]   # 2-3 acciones concretas
  ```

- [ ] `backend/app/services/interview_v2/persona.py`:
  - Función `build_persona(sector, target_role, perfil) -> InterviewPersona`.
  - Banco de **8 personas predefinidas** (1 por sector — tecnología, marketing, ventas, contabilidad, servicio_cliente, operaciones, salud, educación) con nombres latinos y estilos diferenciados.
  - Plantilla de `saludo_inicial`: incluye nombre del candidato (de perfil) + rol que aplica.

**Definition of Done:**

- Modelos pasan `python -m pytest tests/test_interview_v2_models.py` (validaciones de longitud, tipos).
- `build_persona` cubre los 8 sectores con tests de smoke.

---

### B8.3 — Máquina de estados conversacional

**Objetivo:** el "cerebro" que decide qué pregunta el entrevistador y cuándo avanzar etapa.

**Tareas:**

- [ ] `backend/app/services/interview_v2/state_machine.py`:

  **Etapas y reglas:**

  | Etapa | Mínimo turnos | Máximo turnos | Objetivos a evidenciar | Trigger de avance |
  |-------|---------------|---------------|------------------------|-------------------|
  | `rapport` | 2 | 3 | candidato se presenta + dice qué busca | Gemini detecta `objectives_met >= 2` |
  | `tecnica` | 3 | 5 | demuestra conocimiento de `target_skill` + da ejemplo concreto + responde una repregunta | Score parcial ≥ 60 **o** alcanzó máx. turnos |
  | `behavioral` | 2 | 4 | cuenta una situación STAR (Situation/Task/Action/Result) | Score parcial ≥ 55 **o** alcanzó máx. turnos |
  | `cierre` | 1 | 2 | candidato hace 1+ pregunta o expresa interés genuino | Cualquier respuesta no vacía |
  | `finalizada` | — | — | — | Genera `InterviewSummary` y persiste |

  **API interna del módulo:**
  ```python
  def next_action(state: dict, last_user_message: str) -> dict:
      """Devuelve { action: 'reply' | 'advance' | 'finish', stage_advance?, ... }."""
  ```

- [ ] `backend/app/services/interview_v2/evaluator.py`:
  - `evaluate_stage(stage, turns_in_stage, pool_rubricas) -> StageScore` — pide a Gemini un score 0-100 + objectives_met + gaps con un prompt específico por etapa.
  - Fallback heurístico (longitud + match de keywords contra rubrica del pool) si Gemini falla.

- [ ] `backend/app/services/interview_v2/conversation.py`:
  - `generate_reply(state, last_message, persona) -> str` — prompt principal del entrevistador.
  - Lee `pool_snapshot` para extraer 2–3 preguntas/rubricas relevantes y las inyecta como "puntos a cubrir" (no como texto literal).
  - Estilo del reply: 1–3 frases, naturales, con repregunta cuando aplique.

**Definition of Done:**

- `pytest tests/test_state_machine.py` cubre los 4 caminos críticos:
  1. Rapport → técnica con 2 turnos OK.
  2. Técnica corta (max_turns) sin alcanzar objetivos → avanza con `mini_score` bajo y gap registrado.
  3. Behavioral STAR completo → score ≥ 70.
  4. Cierre → genera summary con `global_score` promediado por pesos (técnica 0.45, behavioral 0.30, rapport 0.15, cierre 0.10).

---

### B8.4 — Endpoints REST V2

**Objetivo:** exponer la nueva API y dejarla integrable.

**Tareas:**

- [ ] `backend/app/routes/interview_v2_router.py`:
  ```python
  @router.post("/interview/v2/start", response_model=InterviewStartV2Response)
  @limiter.limit(INTERVIEW_START_LIMIT)   # 5/min (igual que V1)

  @router.post("/interview/v2/{id}/turn", response_model=InterviewTurnResponse)
  @limiter.limit("15/minute")             # más permisivo: conversacional

  @router.post("/interview/v2/{id}/abort")

  @router.get("/interview/v2/{id}", response_model=InterviewStateV2)

  @router.get("/interview/v2/history/{session_id}")   # opcional — fusiona con V1
  ```

- [ ] Registrar router en `backend/main.py` (sin tocar el V1).
- [ ] Documentar en `docs/ENDPOINTS.md` (sección nueva "Mock Interview V2") y en `docs/FRONTEND_INTEGRATION.md`.

- [ ] **Compatibilidad histórica:** `GET /interview/history/{session_id}` debe poder devolver entradas mixtas (`version: 1 | 2`). Agregar campo `version` en el response.

**Definition of Done:**

- Swagger en `/docs` muestra los 4 endpoints V2 con shapes correctas.
- Smoke E2E (curl o test) con `USE_MOCK_DATA=true`:
  1. `start` → recibe `persona.nombre`, `opening_message` no vacío.
  2. 6× `turn` → al 4º o 5º cambia de etapa.
  3. Último `turn` → `finished=true`, `summary.global_score` entre 0 y 100.

---

### B8.5 — Prompts especializados y feature flag

**Objetivo:** elevar la calidad del LLM y permitir rollback.

**Tareas:**

- [ ] Añadir a `docs/PROMPTS.md` (versión inicial **v1.0** cada uno):
  - `INTERVIEW_V2_OPENING` — genera saludo inicial dado persona + perfil.
  - `INTERVIEW_V2_TURN` — el grande: persona + historial + objetivos de etapa + pool_snapshot relevante.
  - `INTERVIEW_V2_STAGE_EVAL` — evaluación de la etapa cerrada (score + objectives_met + gaps).
  - `INTERVIEW_V2_FINAL_SUMMARY` — resumen final con `proximos_pasos`.

- [ ] Reglas de redacción de prompts (en cada uno):
  - **Idioma:** español colombiano sin parecer caricatura ("parce" no, "qué tal" sí).
  - **Tono:** entrevistador real, con preguntas abiertas, evita listas numeradas en el chat.
  - **Anti-alucinación:** *"si no entiendes la respuesta del candidato, pide aclaración antes de avanzar"*.
  - **Output JSON estricto** en eval y summary; output texto libre en `OPENING` y `TURN`.

- [ ] Variable de entorno `INTERVIEW_V2_ENABLED=true|false` (default `true` en dev, `false` en prod hasta cutover).

- [ ] **Métricas mínimas en logs** (sin Datadog/Sentry todavía):
  ```
  logger.info("interview_v2 turn", extra={
      "interview_id": id, "stage": stage,
      "turns_in_stage": n, "tokens_in": x, "tokens_out": y
  })
  ```

**Definition of Done:**

- Los 4 prompts documentados en PROMPTS.md con versión y ejemplo de input/output.
- Decisión añadida: `docs/decisions/2026-MM-DD-interview-v2-conversational.md`.
- Smoke con USE_MOCK_DATA=false y un perfil real en Supabase.

---

### Resumen de archivos backend a crear/tocar

```
backend/
├── migrations/
│   └── 016_interview_v2_state.sql                 ← NUEVO
├── app/
│   ├── models/
│   │   └── interview_v2_models.py                 ← NUEVO
│   ├── services/
│   │   └── interview_v2/
│   │       ├── __init__.py                        ← NUEVO
│   │       ├── persona.py                         ← NUEVO
│   │       ├── state_machine.py                   ← NUEVO
│   │       ├── evaluator.py                       ← NUEVO
│   │       └── conversation.py                    ← NUEVO
│   ├── routes/
│   │   └── interview_v2_router.py                 ← NUEVO
│   └── utils/
│       └── prompts.py                             ← TOCAR (cargar prompts v2)
├── tests/
│   ├── test_interview_v2_models.py                ← NUEVO
│   ├── test_state_machine.py                      ← NUEVO
│   └── test_interview_v2_e2e.py                   ← NUEVO (con TestClient + MOCK)
└── main.py                                         ← TOCAR (registrar router)
```

---

## 4. PLAN F — Frontend (Migue) {#plan-front}

Trabajo dividido en **4 hitos (M4.1 → M4.4)**. Asume que el back V2 está deployado en `localhost:8000`.

### M4.1 — Service layer y store

**Objetivo:** llamadas REST V2 + store Zustand con estado conversacional.

**Tareas:**

- [x] `frontend/src/services/interviewV2Api.js` — wrapper Axios:
  ```js
  export async function startInterviewV2(sessionId, targetSkill, targetRole) { ... }
  export async function sendInterviewTurn(interviewId, message) { ... }
  export async function abortInterview(interviewId) { ... }
  export async function fetchInterviewState(interviewId) { ... }
  ```
  Usa `withProgressFallback` para degradar a mock si el back está caído (igual que progress).

- [x] `frontend/src/store/useInterviewV2Store.js`:
  ```js
  {
    interviewId: null,
    persona: null,                     // { nombre, rol_entrevistador, sector, estilo }
    messages: [],                      // [{ role: 'interviewer' | 'candidate', text, stage, t }]
    stage: 'rapport',                  // sincronizado con back
    stageProgress: { rapport: 'doing', tecnica: 'pending', ... },
    finished: false,
    summary: null,
    sending: false,
    error: null,
    dataSource: 'api',                 // 'api' | 'mock'
  }
  ```
  Acciones: `start`, `sendMessage`, `abort`, `reset`.

- [x] `frontend/src/mocks/mockInterviewV2.js`:
  - Persona fija + 8 turnos pre-escritos por sector tecnología.
  - Útil para `VITE_FORCE_INTERVIEW_MOCK=true` y E2E tests sin Gemini.

**DoD:** ✅ Mock + fallback operativos; smoke API real pendiente de **B8** (`POST /interview/v2/start` en `:8000`).

---

### M4.2 — UI conversacional `/entrevistas`

**Objetivo:** UI tipo chat con header de etapa y typing indicator.

**Tareas:**

- [x] `InterviewV2Page.jsx` + router en `InterviewPage.jsx` (`VITE_INTERVIEW_VERSION`, default `v2`; quiz V1 vía `?legacy=1`).
- [x] Layout (3 zonas):
  - **Header de persona** (top, sticky): avatar + nombre + rol + sector. Pill con etapa actual.
  - **Stage stepper** (debajo del header): 4 pasos (`rapport · técnica · behavioral · cierre`) con estado `done | doing | pending`.
  - **Chat scroll** (centro): bubbles separadas por etapa con label sutil; "está escribiendo…" con animación cuando `sending`.
  - **Composer** (bottom, sticky): textarea autoexpansible + botón "Enviar"; deshabilitado en `finished`.

- [x] Componentes nuevos:
  ```
  src/components/interview/v2/
  ├── InterviewLauncherV2.jsx   ← elige skill + rol; inicia start()
  ├── InterviewChatHeader.jsx   ← persona + stage
  ├── StageStepper.jsx          ← 4 pasos visuales
  ├── ChatBubble.jsx            ← bubble entrevistador / candidato
  ├── ChatComposer.jsx          ← textarea + send
  ├── TypingIndicator.jsx       ← 3 puntos animados (Framer Motion)
  └── InterviewSummaryV2.jsx    ← summary final por etapa
  ```

- [x] Diseño visual coherente con `dulia-kit.css`:
  - Bubble entrevistador: fondo `--surface-card` con borde violeta sutil.
  - Bubble candidato: fondo `--brand-violet/15`, alineado a la derecha.
  - Stepper: gradient activo de morado a rosa (igual que tabs actuales).

**DoD:** ✅ Chat fluido, scroll automático, stepper por etapa.

---

### M4.3 — Resumen final y conexión con `/progreso`

**Objetivo:** cerrar el loop: resultados → agregar tareas al plan.

**Tareas:**

- [x] `InterviewSummaryV2.jsx`:
  - Score global + 4 cards de etapa con `score` + `strengths` + `gaps`.
  - Sección "Próximos pasos" (de `summary.proximos_pasos`).
  - CTA principal: **"Agregar refuerzo a mi plan"** — llama a `addTasksFromWeakSkills(summary.weak_skills)` y redirige a `/progreso`.
  - CTA secundaria: "Practicar otra vez" → reset + launcher.

- [x] `InterviewHistory.jsx` (actualizar): badge **Nuevo formato** en V2; click → `loadSummaryFromHistory` + `fetchInterviewState`. _Pendiente post-B8:_ fusionar historial V1+V2 en un solo endpoint.

- [x] Empty states pulidos:
  - Sin perfil coach todavía: redirige a `/comenzar`.
  - Sin historial: ilustración + "Aún no has practicado. Tu primera entrevista revelará tus fortalezas."

**DoD:** ✅ Flujo demo mock: start → ~8 turnos → summary → add-to-plan → `/progreso`.

---

### M4.4 — Pulido UX y micro-detalles

**Objetivo:** sensación de "es real, no es un quiz".

**Tareas:**

- [x] **Delay artificial entre etapas:** cuando back devuelve `stage_advance`, mostrar 1.5s un "Andrea está pensando en la siguiente sección…" antes de mostrar el reply de la nueva etapa. Vende profesionalismo.
- [x] **Tokens visibles en composer:**
- [x] **Botón "Pausar":**
- [x] **Indicador de conexión:**
- [x] **Accesibilidad:**
- [x] **Animación de entrada del summary:**

**DoD:** ✅ ESLint limpio; tests `npm run test:interview-v2` (5/5). _Pendiente:_ Lighthouse mobile ≥ 85 (no medido en CI).

---

### Resumen de archivos frontend a crear/tocar

```
frontend/src/
├── services/
│   └── interviewV2Api.js                  ← NUEVO
├── store/
│   └── useInterviewV2Store.js             ← NUEVO
├── mocks/
│   └── mockInterviewV2.js                 ← NUEVO
├── pages/
│   ├── InterviewPage.jsx                  ← TOCAR (router de versión)
│   └── InterviewV2Page.jsx                ← NUEVO
├── components/interview/v2/               ← NUEVO (carpeta)
│   ├── InterviewLauncherV2.jsx
│   ├── InterviewChatHeader.jsx
│   ├── StageStepper.jsx
│   ├── ChatBubble.jsx
│   ├── ChatComposer.jsx
│   ├── TypingIndicator.jsx
│   └── InterviewSummaryV2.jsx
└── utils/
    └── interviewV2Display.js              ← NUEVO (mappers respuesta → UI)
```

---

## 5. Contrato API V2 — detalle por endpoint

### 5.1 `POST /api/interview/v2/start`

**Request:**
```json
{ "session_id": "uuid-perfil", "target_skill": "React", "target_role": "Frontend Jr" }
```

**Response 200:**
```json
{
  "interview_id": "uuid-v2",
  "persona": {
    "nombre": "Andrea Restrepo",
    "rol_entrevistador": "Lead frontend",
    "sector": "tecnologia",
    "estilo": "cercana, exigente con ejemplos concretos",
    "saludo_inicial": "Hola Carlos, soy Andrea..."
  },
  "opening_message": "Hola Carlos, soy Andrea, lead de frontend en una fintech local. Antes de entrar al detalle técnico, cuéntame: ¿qué te motivó a postular a un rol de React Jr?",
  "stage": "rapport",
  "max_turns": 10
}
```

**Errores:**
- `404` perfil no encontrado.
- `409` ya hay una entrevista V2 en `in_progress` para ese `session_id` (devuelve `existing_interview_id` en `detail`).

---

### 5.2 `POST /api/interview/v2/{id}/turn`

**Request:**
```json
{ "message": "Llevo 6 meses haciendo proyectos personales y quiero entrar a la industria..." }
```

**Response 200 (no avance de etapa):**
```json
{
  "reply": "Bacano que tengas proyectos. ¿De los que has hecho, cuál te enseñó más sobre React? Cuéntame qué problema resolviste.",
  "stage": "rapport",
  "stage_advance": null,
  "turns_in_stage": 2,
  "total_turns": 2,
  "finished": false
}
```

**Response 200 (con avance de etapa):**
```json
{
  "reply": "Perfecto, eso me da contexto. Ahora pasemos a la parte técnica: ¿cómo manejas el estado compartido entre componentes?",
  "stage": "tecnica",
  "stage_advance": {
    "from_stage": "rapport",
    "to_stage": "tecnica",
    "mini_score": 72,
    "objectives_met": ["se_presenta_con_contexto", "expresa_motivacion"],
    "gaps": []
  },
  "turns_in_stage": 1,
  "total_turns": 3,
  "finished": false
}
```

**Response 200 (entrevista finalizada):**
```json
{
  "reply": "Gracias Carlos, fue genial conversar contigo. Te llegará el resumen ahora.",
  "stage": "finalizada",
  "stage_advance": { "from_stage": "cierre", "to_stage": "finalizada", "mini_score": 80, ... },
  "finished": true,
  "summary": { ... ver §5.4 ... }
}
```

**Errores:**
- `404` interview_id no existe.
- `409` ya está finalizada (`status: 'completed'`).
- `422` mensaje vacío o > 2000 chars.

---

### 5.3 `POST /api/interview/v2/{id}/abort` y `GET /api/interview/v2/{id}`

- `abort`: cambia `status` a `'aborted'`, no genera summary, retorna `{ aborted: true, interview_id }`.
- `GET state`: retorna `{ persona, stage, turns, stage_state, summary (si finalizada), status }` — usado para reanudar tras refresh.

---

### 5.4 Shape de `summary`

```json
{
  "global_score": 74,
  "weak_skills": ["estado global", "comunicar trade-offs"],
  "stages": [
    {
      "stage": "rapport",
      "score": 80,
      "strengths": ["claridad al presentarse", "motivación genuina"],
      "gaps": [],
      "key_moments": ["Llevo 6 meses haciendo proyectos personales..."]
    },
    {
      "stage": "tecnica",
      "score": 68,
      "strengths": ["maneja useState correctamente"],
      "gaps": ["no menciona Context API ni stores"],
      "key_moments": ["Para compartir estado uso props..."]
    },
    { "stage": "behavioral", ... },
    { "stage": "cierre", ... }
  ],
  "feedback_general": "Carlos, mostraste buena base de React y mucha actitud. Tu próximo salto es entender state management compartido — Context, Zustand o Redux Toolkit te van a destrabar muchas decisiones de arquitectura.",
  "proximos_pasos": [
    "Practica un proyecto que use Zustand o Context API para manejar autenticación",
    "Prepara 2 ejemplos STAR para entrevistas behavioral",
    "Revisa el método feynman para explicar conceptos técnicos a no-técnicos"
  ]
}
```

---

## 6. Migración y compatibilidad

| Concepto | V1 (quiz) | V2 (conversacional) |
|----------|-----------|---------------------|
| Tabla persistencia | `mock_interviews` | `mock_interviews_v2` |
| Prefijo endpoints | `/api/interview/*` | `/api/interview/v2/*` |
| Flag front | (default) | `VITE_INTERVIEW_VERSION=v2` |
| Historial | `GET /interview/history/{sid}` (solo V1) | Mismo endpoint, devuelve V1+V2 con campo `version` |
| Add tasks | `POST /progress/add-from-skills` | **Igual** — `summary.weak_skills` se envía sin cambios |

**Plan de rollout:**

1. Deploy back V2 con `INTERVIEW_V2_ENABLED=true` pero **sin tocar front**. Smoke con curl.
2. Migue activa `VITE_INTERVIEW_VERSION=v2` en su `.env.local`. Demo interna.
3. Si va bien, deploy frontend prod con flag a `v2`. V1 sigue accesible vía query string `?legacy=1` (opcional).
4. Después del pitch, dropear V1 si no se usa (migración 017).

---

## 7. Definition of Done (global)

- [ ] Backend: 4 endpoints V2 en Swagger, tests E2E pasando, summary completo con 4 etapas. _(Plan B — pendiente)_
- [x] Frontend: `/entrevistas` con chat fluido, summary segmentado, conexión con `/progreso`.
- [x] Demo: entrevista mock completa en **≤ 4 minutos** (`npm run test:interview-v2` valida 8 turnos).
- [x] Docs: `FRONTEND_INTEGRATION.md`, `PROJECT_STATE.md`, este plan actualizado.
- [x] ESLint y tests frontend sin errores nuevos (`test:interview-v2`, `test:progress`).
- [x] Capacidad de fallback: backend caído → `mockInterviewV2` sin romper UX.

---

## 8. Decisiones técnicas pendientes (a resolver en kickoff)

| # | Pregunta | Opción A | Opción B | Recomendación |
|---|----------|----------|----------|---------------|
| 1 | ¿Streaming de tokens del entrevistador (SSE)? | SSE en `/turn` | Polling con `sending` state | **B** para el MVP (más simple, latencia OK con Gemini Flash) |
| 2 | ¿Nombre de la entrevistadora fija por sector o aleatoria? | 1 nombre fijo por sector | Pool de 3 por sector | **A** para reconocimiento del usuario (siempre habla con Andrea en tech) |
| 3 | ¿Persistir `pool_snapshot` o recomputarlo cada turno? | Snapshot al inicio | Re-query cada turno | **A** — determinismo + ahorra requests a Supabase |
| 4 | ¿Cuál es el máximo de turnos por entrevista? | 10 | 14 | **10** — entrevista breve, demo-friendly |
| 5 | ¿Permitir editar/borrar respuestas previas? | Sí | No (chat append-only) | **No** — refleja entrevista real |

---

## 9. Riesgos y mitigación

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Gemini lento → UX de chat se siente truncada | Media | `TypingIndicator` mínimo 1.5s; rate limit del back; logs de tokens |
| El LLM se sale del personaje (rompe el rol) | Media | Prompt con instrucción anti-meta + ejemplo de "qué hacer si el candidato te pregunta si eres IA" |
| Score injusto por etapa corta | Baja | Ponderación de etapas (técnica 0.45 vs cierre 0.10) ya documentada |
| Estado conversacional rompe en refresh | Media | `GET /interview/v2/{id}` permite rehidratar; front guarda `interviewId` en localStorage |
| Migración 016 falla en prod | Baja | Aplicar primero en staging Supabase; tener rollback `DROP TABLE` listo |

---

## 10. Referencias

- Sistema actual (a reemplazar): `backend/app/services/interview_service.py`, `backend/migrations/012_progress_and_interviews.sql`
- Pool de preguntas (se reusa): `backend/migrations/015_replace_interview_pool_with_real_sources.sql`
- Decisiones previas: [mock-interview-seed-pool](decisions/2026-05-24-mock-interview-seed-pool.md), [interview-pool-real-sources](decisions/2026-05-24-interview-pool-real-sources.md), [interview-rate-limits](decisions/2026-05-24-interview-rate-limits.md)
- Endpoints actuales: [ENDPOINTS.md §Mock Interview](ENDPOINTS.md)
- Integración frontend actual: [FRONTEND_INTEGRATION.md §entrevista](FRONTEND_INTEGRATION.md)

---

**Próximo paso:** backend arranca **B8.1** (migración `mock_interviews_v2`); front ya consume `/api/interview/v2/*` con fallback mock hasta deploy.
