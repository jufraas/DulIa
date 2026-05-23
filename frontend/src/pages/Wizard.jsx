/* === DulIA Wizard (3 steps) === */
const { Logo, Button, Chip, Icon, IconBox } = window.DK;
const { useState: useStateW } = React;

function Wizard({ onDone, onBack }) {
  const [step, setStep] = useStateW(0);
  const [data, setData] = useStateW({
    skills: ["Diseño en Figma", "Investigación de usuarios"],
    skillInput: "",
    yearsExp: 1,
    educLevel: "Estudiante universitario",
    goalRole: "Practicante UX",
    goalCity: "Bogotá",
    motivation: "crecer",
  });
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const total = 3;
  const progress = ((step + 1) / total) * 100;

  const next = () => {
    if (step < total - 1) setStep(step + 1);
    else onDone(data);
  };
  const back = () => {
    if (step > 0) setStep(step - 1);
    else onBack();
  };

  return (
    <div className="page" data-screen-label="02 Wizard">
      {/* slim header */}
      <header className="dh">
        <div className="container dh-inner">
          <a href="#" onClick={(e)=>{e.preventDefault();onBack();}}><Logo /></a>
          <div style={{ flex: 1, maxWidth: 480, margin: "0 32px" }}>
            <ProgressBar value={progress} step={step + 1} total={total}/>
          </div>
          <Button variant="ghost" onClick={onBack}>Cancelar</Button>
        </div>
      </header>

      <div style={{ paddingTop: 56, paddingBottom: 120 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <Stepper step={step}/>

          <div key={step} className="anim-in" style={{ marginTop: 40 }}>
            {step === 0 && <Step1 data={data} set={set}/>}
            {step === 1 && <Step2 data={data} set={set}/>}
            {step === 2 && <Step3 data={data} set={set}/>}
          </div>

          <div style={{
            display: "flex", justifyContent: "space-between", marginTop: 48
          }}>
            <Button variant="secondary" icon="back" onClick={back}>
              {step === 0 ? "Volver al inicio" : "Atrás"}
            </Button>
            <Button variant="primary" size="lg" iconRight="arrow" onClick={next}>
              {step === total - 1 ? "Analizar mi perfil" : "Siguiente"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- progress bar ----------
function ProgressBar({ value, step, total }) {
  return (
    <div>
      <div style={{
        height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden"
      }}>
        <div style={{
          height: "100%", width: `${value}%`,
          background: "linear-gradient(90deg,#7C3AED 0%,#A855F7 50%,#EC4899 100%)",
          borderRadius: 3,
          boxShadow: "0 0 16px rgba(236,72,153,0.45)",
          transition: "width 0.5s var(--ease-out)"
        }}/>
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between", marginTop: 6,
        fontSize: 11, color: "var(--fg-3)", fontFamily: "var(--font-mono)"
      }}>
        <span>Paso {step} de {total}</span>
        <span>{Math.round(value)}%</span>
      </div>
    </div>
  );
}

// ---------- stepper pills ----------
function Stepper({ step }) {
  const steps = [
    { label: "Habilidades", icon: "bolt" },
    { label: "Experiencia", icon: "briefcase" },
    { label: "Objetivos",   icon: "target" },
  ];
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {steps.map((s, i) => {
        const done = i < step, active = i === step;
        return (
          <React.Fragment key={i}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 16px", borderRadius: 999,
              background: active ? "rgba(236,72,153,0.10)" : done ? "rgba(124,58,237,0.10)" : "transparent",
              border: `1px solid ${active ? "rgba(236,72,153,0.55)" : done ? "rgba(168,85,247,0.35)" : "rgba(255,255,255,0.10)"}`,
              boxShadow: active ? "0 0 0 4px rgba(236,72,153,0.10)" : "none"
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: active ? "var(--grad-cta)" : done ? "var(--grad-brand)" : "rgba(255,255,255,0.06)",
                color: active || done ? "#fff" : "var(--fg-3)",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
              }}>
                {done ? <Icon name="check" size={14} color="#fff" strokeWidth={2.6}/> : i + 1}
              </div>
              <span style={{
                fontSize: 14, fontWeight: 600,
                color: active ? "var(--fg-1)" : done ? "var(--violet-200)" : "var(--fg-3)"
              }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, borderRadius: 1,
                background: i < step ? "linear-gradient(90deg,#7C3AED,#A855F7)" : "rgba(255,255,255,0.06)"
              }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------- STEPS ----------
function StepHeader({ eyebrow, title, sub }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 40 }}>
      <div className="eyebrow-dl" style={{ marginBottom: 14 }}>{eyebrow}</div>
      <h2 style={{
        fontSize: 36, fontWeight: 800, letterSpacing: "-0.025em",
        margin: 0, lineHeight: 1.15
      }}>{title}</h2>
      {sub && <p style={{
        marginTop: 12, fontSize: 17, color: "var(--fg-2)", lineHeight: 1.5
      }}>{sub}</p>}
    </div>
  );
}

function Step1({ data, set }) {
  const suggestions = ["Marketing digital", "Excel avanzado", "Python", "Diseño en Figma",
    "Ventas", "React", "Inglés B2", "Investigación de usuarios", "SQL", "Atención al cliente"];
  const addSkill = (s) => {
    if (!s) return;
    if (data.skills.includes(s)) {
      set("skills", data.skills.filter((x) => x !== s));
    } else {
      set("skills", [...data.skills, s]);
    }
  };
  return (
    <div className="card-dl" style={{ padding: 36 }}>
      <StepHeader
        eyebrow="Paso 1 · Habilidades"
        title="¿Qué sabes hacer?"
        sub="Mínimo tres. Tranquilo, nadie te va a juzgar — esto es para ti."
      />

      <div className="label-dl">Agrega o escribe la tuya</div>
      <div style={{ display: "flex", gap: 10 }}>
        <input className="field-dl" placeholder="Ej: edición de video, contabilidad básica…"
          value={data.skillInput} onChange={(e) => set("skillInput", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && data.skillInput.trim()) {
              addSkill(data.skillInput.trim()); set("skillInput", "");
            }
          }}/>
        <Button variant="secondary" onClick={() => {
          if (data.skillInput.trim()) { addSkill(data.skillInput.trim()); set("skillInput", ""); }
        }}>Agregar</Button>
      </div>

      <div style={{ marginTop: 24 }}>
        <div className="label-dl">Sugerencias</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {suggestions.map((s) => (
            <Chip key={s} selected={data.skills.includes(s)} onClick={() => addSkill(s)}>
              {s}
            </Chip>
          ))}
        </div>
      </div>

      {data.skills.length > 0 && (
        <div style={{
          marginTop: 28, padding: 16, borderRadius: 16,
          background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)"
        }}>
          <div className="eyebrow-dl" style={{ marginBottom: 10 }}>
            <Icon name="check" size={14}/> Tus habilidades ({data.skills.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.skills.map((s) => (
              <div key={s} className="chip-dl selected" onClick={() => addSkill(s)}>
                {s} ×
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Step2({ data, set }) {
  const levels = ["Bachiller", "Técnico", "Estudiante universitario", "Profesional", "Posgrado"];
  return (
    <div className="card-dl" style={{ padding: 36 }}>
      <StepHeader
        eyebrow="Paso 2 · Experiencia"
        title="¿Por dónde vas?"
        sub="Aún sin experiencia formal cuenta. Las prácticas, voluntariados y proyectos personales suman."
      />

      <div className="label-dl">Años de experiencia laboral</div>
      <div style={{
        display: "flex", gap: 10, padding: 6, borderRadius: 999,
        background: "var(--bg-2)", border: "1px solid rgba(168,85,247,0.20)"
      }}>
        {[0, 1, 2, 3, 5].map((n) => {
          const active = data.yearsExp === n;
          return (
            <button key={n} onClick={() => set("yearsExp", n)}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 999, border: 0,
                background: active ? "var(--grad-brand)" : "transparent",
                color: active ? "#fff" : "var(--fg-2)",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
                boxShadow: active ? "0 6px 20px rgba(124,58,237,0.40)" : "none"
              }}>
              {n === 0 ? "Ninguna" : n === 5 ? "5+ años" : `${n} año${n>1?'s':''}`}
            </button>
          );
        })}
      </div>

      <div className="label-dl" style={{ marginTop: 28 }}>Nivel educativo</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {levels.map((l) => (
          <Chip key={l} selected={data.educLevel === l} onClick={() => set("educLevel", l)}>
            {l}
          </Chip>
        ))}
      </div>

      <div className="label-dl" style={{ marginTop: 28 }}>Cuéntanos un logro del que estés orgulloso/a</div>
      <textarea className="field-dl" rows="3"
        placeholder="Ej: organicé un evento para 200 personas en mi universidad…"
        style={{ resize: "vertical", fontFamily: "var(--font-body)", minHeight: 90 }}
        defaultValue="Lideré el rediseño de la app de mi proyecto de grado. Tuve que entrevistar a 30 usuarios."/>
    </div>
  );
}

function Step3({ data, set }) {
  const cities = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Remoto", "No me importa"];
  const motivations = [
    { v: "crecer", label: "Crecer rápido en una empresa" },
    { v: "estable", label: "Algo estable y bien pago" },
    { v: "propio",  label: "Construir lo mío" },
    { v: "explorar", label: "Explorar, aún no sé" },
  ];
  return (
    <div className="card-dl" style={{ padding: 36 }}>
      <StepHeader
        eyebrow="Paso 3 · Objetivos"
        title="¿Para dónde vas?"
        sub="No tiene que ser perfecto. Con esto orientamos el plan de 30 días."
      />

      <div className="label-dl">Cargo o rol soñado</div>
      <input className="field-dl" value={data.goalRole}
        onChange={(e) => set("goalRole", e.target.value)}
        placeholder="Ej: Diseñador UX junior, analista de datos…"/>

      <div className="label-dl" style={{ marginTop: 24 }}>Ciudad (o remoto)</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {cities.map((c) => (
          <Chip key={c} selected={data.goalCity === c} onClick={() => set("goalCity", c)}>{c}</Chip>
        ))}
      </div>

      <div className="label-dl" style={{ marginTop: 24 }}>¿Qué te mueve?</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {motivations.map((m) => {
          const sel = data.motivation === m.v;
          return (
            <div key={m.v} onClick={() => set("motivation", m.v)}
              style={{
                padding: "16px 18px", borderRadius: 14,
                background: sel ? "rgba(236,72,153,0.10)" : "var(--bg-2)",
                border: `1px solid ${sel ? "rgba(236,72,153,0.55)" : "rgba(168,85,247,0.20)"}`,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                transition: "all 0.2s var(--ease-out)"
              }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                border: `2px solid ${sel ? "var(--magenta-500)" : "rgba(168,85,247,0.40)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {sel && <div style={{ width: 10, height: 10, borderRadius: "50%",
                  background: "var(--magenta-500)" }}/>}
              </div>
              <span style={{
                fontSize: 14, fontWeight: 600,
                color: sel ? "var(--fg-1)" : "var(--fg-2)"
              }}>{m.label}</span>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 36, padding: 18, borderRadius: 16,
        background: "linear-gradient(135deg, rgba(124,58,237,0.14), rgba(236,72,153,0.10))",
        border: "1px solid rgba(168,85,247,0.35)",
        display: "flex", alignItems: "center", gap: 14
      }}>
        <IconBox name="sparkles" variant="magenta" size={44} iconSize={22}/>
        <div style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.5 }}>
          Al darle a <b style={{color:"var(--fg-1)"}}>Analizar mi perfil</b>, DulIA cruza tus datos con
          15.000 vacantes reales y te entrega un score + plan personalizado.
        </div>
      </div>
    </div>
  );
}

window.Wizard = Wizard;
