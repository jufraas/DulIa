/* === DulIA Landing === */
const { Logo, Button, Header, Chip, IconBox, Icon } = window.DK;

function Landing({ onStart }) {
  return (
    <div className="page" data-screen-label="01 Landing">
      <Header active="home" onNav={(t) => t === "wizard" && onStart()} />

      {/* HERO */}
      <section style={{ paddingTop: 80, paddingBottom: 100 }}>
        <div className="container" style={{
          display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 60,
          alignItems: "center"
        }}>
          <div>
            <div className="eyebrow-dl anim-in" style={{ marginBottom: 24 }}>
              <Icon name="sparkles" size={14}/>
              Barranqui-IA 2026 · Coach de carrera con IA
            </div>
            <h1 className="anim-in-delay-1" style={{
              fontSize: "clamp(48px, 6vw, 78px)",
              fontWeight: 900,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
              margin: 0
            }}>
              Tu carrera,<br/>
              con <span className="gradient-text">IA de tu lado</span>.
            </h1>
            <p className="anim-in-delay-2" style={{
              fontSize: 19, color: "var(--fg-2)", lineHeight: 1.55,
              maxWidth: 540, marginTop: 24
            }}>
              DulIA analiza tu perfil y te dice <b style={{color:"var(--fg-1)"}}>exactamente
              qué hacer</b> en los próximos 30 días. Sin formularios eternos,
              sin promesas vacías.
            </p>
            <div className="anim-in-delay-3" style={{
              display: "flex", gap: 14, marginTop: 36, alignItems: "center"
            }}>
              <Button variant="primary" size="lg" iconRight="arrow" onClick={onStart}>
                Descubre tu potencial
              </Button>
              <Button variant="ghost">Ver cómo funciona</Button>
            </div>
            <div className="anim-in-delay-4" style={{
              display: "flex", gap: 28, marginTop: 44, color: "var(--fg-3)", fontSize: 13
            }}>
              <span><b style={{color:"var(--violet-300)"}}>+2.400</b> jóvenes ya tienen su score</span>
              <span><b style={{color:"var(--violet-300)"}}>15k</b> vacantes reales</span>
            </div>
          </div>

          {/* hero card mock */}
          <HeroPreview />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ paddingTop: 40, paddingBottom: 120 }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="eyebrow-dl" style={{ marginBottom: 16 }}>
              <Icon name="bolt" size={14}/> Lo que hace DulIA
            </div>
            <h2 style={{
              fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800,
              letterSpacing: "-0.025em", margin: 0, lineHeight: 1.1
            }}>
              Cuatro herramientas, <span className="brand-text">un solo flujo</span>.
            </h2>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18
          }}>
            <FeatureCard
              icon="sparkles" variant="violet" eyebrow="01 · Coach IA"
              title="Coach personal con IA"
              body="Te conoce mejor que tu CV. Analiza lo que sabes, lo que te gusta y dónde estás, para decirte qué mover ya."
            />
            <FeatureCard
              icon="shield" variant="magenta" eyebrow="02 · Anti-fraude"
              title="Detector de vacantes falsas"
              body="Las vacantes que piden plata, datos raros o sueldos imposibles las marcamos antes de que apliques."
            />
            <FeatureCard
              icon="trend" variant="violet" eyebrow="03 · Mercado"
              title="Termómetro del mercado"
              body="Qué se busca hoy en Colombia, qué pagan y dónde está la demanda real. En tiempo real."
            />
            <FeatureCard
              icon="target" variant="magenta" eyebrow="04 · Score"
              title="Score de empleabilidad"
              body="Tu nivel del 0 al 100, basado en datos reales. Y un plan de 30 días para subirlo."
            />
          </div>

          {/* BIG CTA */}
          <div className="card-dl" style={{
            marginTop: 64, padding: 56, textAlign: "center",
            background: "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(236,72,153,0.10) 100%)",
            borderColor: "rgba(168,85,247,0.45)"
          }}>
            <h3 style={{
              fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em",
              margin: 0, lineHeight: 1.15
            }}>
              ¿Listo? Tres pasos. Dos minutos.<br/>
              <span className="gradient-text">Tu plan está esperando.</span>
            </h3>
            <div style={{ marginTop: 32 }}>
              <Button variant="primary" size="lg" iconRight="arrow" onClick={onStart}>
                Descubre tu potencial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer style={{
        padding: "40px 0", borderTop: "1px solid rgba(168,85,247,0.12)"
      }}>
        <div className="container" style={{
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Logo height={22}/>
            <span style={{ color: "var(--fg-3)", fontSize: 13 }}>
              Hecho con <span style={{color:"var(--magenta-400)"}}>♥</span> en Barranquilla · 2026
            </span>
          </div>
          <div style={{ color: "var(--fg-3)", fontSize: 13 }}>
            krl0s · Migue · Jose · Jufra
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, variant, eyebrow, title, body }) {
  return (
    <div className="card-dl hoverable" style={{ padding: 28 }}>
      <IconBox name={icon} variant={variant}/>
      <div className="eyebrow-dl" style={{ marginTop: 20, marginBottom: 8 }}>{eyebrow}</div>
      <h3 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.015em" }}>
        {title}
      </h3>
      <p style={{ fontSize: 15, color: "var(--fg-3)", lineHeight: 1.55, margin: 0 }}>
        {body}
      </p>
    </div>
  );
}

// Decorative hero preview card — shows the score concept
function HeroPreview() {
  return (
    <div style={{ position: "relative", height: 460 }}>
      {/* main card */}
      <div className="card-dl anim-in-delay-2" style={{
        position: "absolute", inset: 0, padding: 28,
        boxShadow: "var(--glow-violet-strong)",
        background: "linear-gradient(180deg, rgba(168,85,247,0.06), rgba(0,0,0,0)) , var(--bg-2)"
      }}>
        <div style={{ display: "flex", justifyContent:"space-between", alignItems: "center" }}>
          <div className="eyebrow-dl">
            <Icon name="user" size={14}/> Tu perfil · análisis IA
          </div>
          <div style={{
            padding: "4px 10px", borderRadius: 999,
            background: "rgba(52,211,153,0.14)", border: "1px solid rgba(52,211,153,0.35)",
            color: "#34D399", fontSize: 11, fontWeight: 700
          }}>EN VIVO</div>
        </div>

        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", marginTop: 12
        }}>
          <ScoreRingDemo/>
        </div>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MiniStat label="Match real" value="92%" tone="violet"/>
          <MiniStat label="Plan 30d" value="Listo" tone="magenta"/>
        </div>

        <div style={{
          marginTop: 14, padding: 14, borderRadius: 14,
          background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.25)",
          display: "flex", alignItems: "center", gap: 12
        }}>
          <Icon name="sparkles" size={18} color="var(--violet-300)"/>
          <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.5 }}>
            "Tienes base sólida en datos. Apunta a <b style={{color:"var(--fg-1)"}}>practicante de
            BI</b> esta semana."
          </div>
        </div>
      </div>

      {/* floating chip */}
      <div className="anim-in-delay-4" style={{
        position: "absolute", top: -14, right: -10,
        padding: "8px 14px", borderRadius: 999,
        background: "var(--grad-cta)", color: "#fff",
        fontSize: 13, fontWeight: 700,
        boxShadow: "var(--glow-cta)",
        display: "inline-flex", alignItems: "center", gap: 6
      }}>
        <Icon name="star" size={14} color="#fff" strokeWidth={2.4}/>
        Score 78
      </div>
    </div>
  );
}

function ScoreRingDemo() {
  return <window.DK.ScoreRing value={78} size={200} stroke={14}/>;
}

function MiniStat({ label, value, tone }) {
  const bg = tone === "magenta" ? "rgba(236,72,153,0.10)" : "rgba(168,85,247,0.10)";
  const br = tone === "magenta" ? "rgba(236,72,153,0.30)" : "rgba(168,85,247,0.30)";
  return (
    <div style={{
      padding: "12px 14px", borderRadius: 14, background: bg, border: `1px solid ${br}`
    }}>
      <div style={{ fontSize: 11, color: "var(--fg-3)", textTransform: "uppercase",
        letterSpacing: "0.1em", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22,
        marginTop: 2, color: "var(--fg-1)" }}>{value}</div>
    </div>
  );
}

window.Landing = Landing;
