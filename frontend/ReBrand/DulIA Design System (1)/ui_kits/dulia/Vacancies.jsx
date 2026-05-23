/* === DulIA Vacancies — panel con semáforo verde/amarillo/rojo === */
const { Logo, Button, Header, Chip, Icon, IconBox } = window.DK;
const { useState: useStateV, useMemo } = React;

// Status definitions (traffic light)
const STATUS = {
  green:  { label: "Verificada",  color: "#34D399", bg: "rgba(52,211,153,0.14)",  br: "rgba(52,211,153,0.40)",  icon: "check"  },
  yellow: { label: "Revísala",    color: "#FBBF24", bg: "rgba(251,191,36,0.14)",  br: "rgba(251,191,36,0.40)",  icon: "alert"  },
  red:    { label: "Sospechosa",  color: "#F87171", bg: "rgba(248,113,113,0.12)", br: "rgba(248,113,113,0.45)", icon: "shield" },
};

const JOBS = [
  { id: 1, status: "green",  co: "Rappi",          role: "Practicante UX",          loc: "Bogotá · Híbrido",   pay: "$1.800.000",
    match: 92, posted: "Hace 2 días", tags: ["Figma","Investigación"],
    flag: "Empresa verificada · pago acorde al mercado." },
  { id: 2, status: "green",  co: "Bancolombia",     role: "Diseñador Jr. Producto",  loc: "Medellín · Híbrido", pay: "$2.400.000",
    match: 87, posted: "Hace 4 días", tags: ["Figma","Design system"],
    flag: "Vacante publicada en LinkedIn oficial." },
  { id: 3, status: "green",  co: "Mercado Libre",   role: "UX Researcher Jr.",       loc: "Remoto Colombia",    pay: "$2.800.000",
    match: 81, posted: "Hoy",         tags: ["Investigación","Inglés B2"],
    flag: "Reclutador con perfil real." },
  { id: 4, status: "yellow", co: "Estudio Anónimo", role: "Diseñador Multiusos",     loc: "Sin especificar",    pay: "A convenir",
    match: 64, posted: "Hace 1 día",  tags: ["Figma","Photoshop","Premiere"],
    flag: "Salario no publicado y rol muy amplio. Pregunta antes de aplicar." },
  { id: 5, status: "yellow", co: "Agencia 360",     role: "Practicante Marketing",   loc: "Bogotá · Presencial",pay: "$1.000.000",
    match: 58, posted: "Hace 5 días", tags: ["Redes sociales","Excel"],
    flag: "Pago bajo el SMMLV — confirma si es práctica formal o contrato." },
  { id: 6, status: "red",    co: "OportunidadXM",   role: "Trainee Inversiones",     loc: "100% remoto · global", pay: "USD $5.000/mes",
    match: 0,  posted: "Hace 1 hora", tags: ["Sin experiencia","Cupos limitados"],
    flag: "Pide $200 USD por 'capacitación inicial'. NUNCA pagues por trabajar." },
  { id: 7, status: "red",    co: "Multinivel Pro",  role: "Líder de Equipo",         loc: "Tu casa",              pay: "Hasta $10M",
    match: 0,  posted: "Hace 3 horas",tags: ["Sin requisitos"],
    flag: "Esquema piramidal: te piden reclutar para ganar." },
];

function Vacancies({ onBack }) {
  const [filter, setFilter] = useStateV("all");
  const counts = useMemo(() => ({
    all:    JOBS.length,
    green:  JOBS.filter(j => j.status === "green").length,
    yellow: JOBS.filter(j => j.status === "yellow").length,
    red:    JOBS.filter(j => j.status === "red").length,
  }), []);
  const filtered = filter === "all" ? JOBS : JOBS.filter(j => j.status === filter);

  return (
    <div className="page" data-screen-label="04 Vacancies">
      <Header active="opps" onNav={(t) => t === "home" && onBack()}/>

      <div style={{ paddingTop: 56, paddingBottom: 120 }}>
        <div className="container">

          {/* HEADER */}
          <div className="anim-in" style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            gap: 24, marginBottom: 36
          }}>
            <div>
              <div className="eyebrow-dl" style={{ marginBottom: 14 }}>
                <Icon name="briefcase" size={14}/> Panel de vacantes · DulIA filtró por ti
              </div>
              <h1 style={{
                fontSize: "clamp(36px, 4.5vw, 54px)", fontWeight: 800,
                letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0
              }}>
                {JOBS.length} oportunidades,<br/>
                <span className="gradient-text">solo aplicas a las buenas</span>.
              </h1>
            </div>
            <Button variant="secondary" icon="back" onClick={onBack}>Volver</Button>
          </div>

          {/* SEMÁFORO STATS */}
          <div className="anim-in-delay-1" style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24
          }}>
            <TrafficStat
              status="green"
              count={counts.green}
              title="Verificadas y seguras"
              body="Empresas reales, pagos acordes, reclutadores confirmados."
            />
            <TrafficStat
              status="yellow"
              count={counts.yellow}
              title="Revisa antes de aplicar"
              body="Algo no cuadra: salario, descripción o requisitos."
            />
            <TrafficStat
              status="red"
              count={counts.red}
              title="Vacantes sospechosas"
              body="Las marcamos: piden dinero, esquema piramidal o datos raros."
            />
          </div>

          {/* FILTER CHIPS */}
          <div className="anim-in-delay-2" style={{
            display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center"
          }}>
            <span style={{ fontSize: 12, color: "var(--fg-3)", marginRight: 6, fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase" }}>Mostrar</span>
            <FilterChip label={`Todas`}        count={counts.all}    active={filter==="all"}    onClick={()=>setFilter("all")}/>
            <FilterChip label="Verificadas"    count={counts.green}  active={filter==="green"}  onClick={()=>setFilter("green")}    dot="#34D399"/>
            <FilterChip label="Revísala"       count={counts.yellow} active={filter==="yellow"} onClick={()=>setFilter("yellow")}   dot="#FBBF24"/>
            <FilterChip label="Sospechosas"    count={counts.red}    active={filter==="red"}    onClick={()=>setFilter("red")}      dot="#F87171"/>
          </div>

          {/* LIST */}
          <div className="anim-in-delay-3" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(j => <VacancyRow key={j.id} job={j}/>)}
          </div>

          {/* EDUCATION BANNER */}
          <div className="anim-in-delay-4" style={{
            marginTop: 32, padding: 24, borderRadius: 20,
            background: "linear-gradient(135deg, rgba(124,58,237,0.14), rgba(236,72,153,0.10))",
            border: "1px solid rgba(168,85,247,0.35)",
            display: "flex", alignItems: "center", gap: 18
          }}>
            <IconBox name="shield" size={56} iconSize={26}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
                ¿Cómo sabe DulIA cuáles son falsas?
              </div>
              <div style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.5, marginTop: 4 }}>
                Cruzamos cada vacante con la Cámara de Comercio, históricos de reclutadores
                y patrones de fraude. Si algo no cuadra, lo marcamos antes de que apliques.
              </div>
            </div>
            <Button variant="secondary" iconRight="arrow">Ver criterios</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- TRAFFIC LIGHT STAT CARD ----------
function TrafficStat({ status, count, title, body }) {
  const s = STATUS[status];
  return (
    <div className="card-dl" style={{
      padding: 22,
      borderColor: s.br,
      boxShadow: `0 0 0 1px ${s.br}, 0 14px 40px ${s.bg}`,
      position: "relative", overflow: "hidden",
    }}>
      {/* glow bar at top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: s.color, opacity: 0.85,
        boxShadow: `0 0 20px ${s.color}`,
      }}/>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <TrafficDot status={status} pulse/>
        <span style={{
          fontSize: 12, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.14em", color: s.color
        }}>{s.label}</span>
      </div>
      <div style={{
        display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6
      }}>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 900,
          fontSize: 56, lineHeight: 1, letterSpacing: "-0.04em", color: "var(--fg-1)"
        }}>{count}</span>
        <span style={{ fontSize: 14, color: "var(--fg-3)" }}>vacantes</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-1)", marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: "var(--fg-3)", lineHeight: 1.45 }}>{body}</div>
    </div>
  );
}

// ---------- TRAFFIC DOT (the literal traffic-light dot) ----------
function TrafficDot({ status, size = 12, pulse }) {
  const s = STATUS[status];
  return (
    <span style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      {pulse && (
        <span style={{
          position: "absolute", inset: -4, borderRadius: "50%",
          background: s.color, opacity: 0.30,
          animation: "trafficPulse 1.8s ease-out infinite",
        }}/>
      )}
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: s.color, boxShadow: `0 0 10px ${s.color}`,
      }}/>
    </span>
  );
}

// ---------- FILTER CHIP ----------
function FilterChip({ label, count, active, onClick, dot }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "10px 16px", borderRadius: 999,
      background: active ? "var(--grad-brand)" : "rgba(168,85,247,0.08)",
      border: `1px solid ${active ? "transparent" : "rgba(168,85,247,0.25)"}`,
      color: active ? "#fff" : "var(--fg-2)",
      fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
      cursor: "pointer",
      boxShadow: active ? "0 8px 22px rgba(124,58,237,0.40)" : "none",
      transition: "all 0.2s var(--ease-out)"
    }}>
      {dot && <span style={{
        width: 8, height: 8, borderRadius: "50%", background: dot,
        boxShadow: `0 0 8px ${dot}`
      }}/>}
      {label}
      <span style={{
        padding: "2px 8px", borderRadius: 999,
        background: active ? "rgba(13,13,13,0.30)" : "rgba(255,255,255,0.06)",
        fontSize: 11, fontWeight: 700,
        color: active ? "#fff" : "var(--fg-3)"
      }}>{count}</span>
    </button>
  );
}

// ---------- VACANCY ROW ----------
function VacancyRow({ job }) {
  const s = STATUS[job.status];
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "8px auto 1fr auto auto",
      gap: 18, alignItems: "center",
      padding: "16px 20px",
      borderRadius: 18,
      background: "var(--bg-2)",
      border: `1px solid ${s.br}`,
      boxShadow: `0 8px 24px ${s.bg}`,
      transition: "transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out)",
      cursor: "pointer",
    }}
    onMouseEnter={(e)=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 14px 36px ${s.bg}, 0 0 0 1px ${s.color}`;}}
    onMouseLeave={(e)=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=`0 8px 24px ${s.bg}`;}}
    >
      {/* COLOR RAIL on the left */}
      <div style={{
        width: 6, height: 48, borderRadius: 3,
        background: s.color,
        boxShadow: `0 0 12px ${s.color}`,
      }}/>

      {/* COMPANY LOGO */}
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: job.status === "red"
          ? "linear-gradient(135deg, #5A5A6B, #22222F)"
          : "var(--grad-brand)",
        color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18,
        opacity: job.status === "red" ? 0.6 : 1,
      }}>{job.co[0]}</div>

      {/* INFO */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
            color: job.status === "red" ? "var(--fg-2)" : "var(--fg-1)",
            textDecoration: job.status === "red" ? "line-through" : "none",
            textDecorationColor: "rgba(248,113,113,0.6)"
          }}>{job.role}</span>
          <StatusBadge status={job.status}/>
        </div>
        <div style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 4 }}>
          <b style={{ color: "var(--fg-2)" }}>{job.co}</b> · {job.loc} · {job.posted}
        </div>
        <div style={{
          marginTop: 6, fontSize: 12,
          color: s.color, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Icon name={s.icon} size={13}/> {job.flag}
        </div>
      </div>

      {/* PAY + MATCH */}
      <div style={{ textAlign: "right" }}>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
          color: job.status === "red" ? "var(--fg-3)" : "var(--fg-1)"
        }}>{job.pay}</div>
        <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>
          {job.match > 0 ? `${job.match}% match` : "—"}
        </div>
      </div>

      {/* ACTION */}
      {job.status === "red" ? (
        <span style={{
          padding: "8px 14px", borderRadius: 999,
          background: "rgba(248,113,113,0.10)",
          border: "1px solid rgba(248,113,113,0.35)",
          color: "#F87171", fontSize: 12, fontWeight: 700
        }}>BLOQUEADA</span>
      ) : (
        <Button variant={job.status === "green" ? "primary" : "secondary"} size="sm" iconRight="arrow">
          {job.status === "green" ? "Aplicar" : "Ver"}
        </Button>
      )}
    </div>
  );
}

// ---------- STATUS BADGE ----------
function StatusBadge({ status }) {
  const s = STATUS[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 9px", borderRadius: 999,
      background: s.bg, border: `1px solid ${s.br}`,
      color: s.color, fontSize: 10, fontWeight: 800,
      letterSpacing: "0.08em", textTransform: "uppercase"
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: s.color, boxShadow: `0 0 6px ${s.color}`
      }}/>
      {s.label}
    </span>
  );
}

window.Vacancies = Vacancies;
