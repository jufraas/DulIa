/* === DulIA Results === */
const { Logo, Button, Header, Chip, Icon, IconBox, ScoreRing } = window.DK;

function Results({ data, onBack, onVacancies }) {
  const score = 78;

  return (
    <div className="page" data-screen-label="03 Results">
      <Header onNav={(t) => {
        if (t === "home") onBack();
        else if (t === "vacancies") onVacancies && onVacancies();
        else if (t === "wizard") onBack(); // restart
      }}/>

      <div style={{ paddingTop: 56, paddingBottom: 120 }}>
        <div className="container">
          {/* TITLE */}
          <div className="anim-in" style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="eyebrow-dl" style={{ marginBottom: 14 }}>
              <Icon name="sparkles" size={14}/> Análisis listo
            </div>
            <h1 style={{
              fontSize: "clamp(36px, 4.5vw, 60px)", fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0
            }}>
              Vas mejor de lo que crees,<br/>
              <span className="gradient-text">parcero</span>.
            </h1>
          </div>

          {/* HERO ROW: SCORE + SUMMARY + PDF */}
          <div className="anim-in-delay-1" style={{
            display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 24,
            marginBottom: 48
          }}>
            {/* Score card */}
            <div className="card-dl" style={{
              padding: 36, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 20, boxShadow: "var(--glow-violet-strong)"
            }}>
              <div className="eyebrow-dl"><Icon name="target" size={14}/> Tu score de empleabilidad</div>
              <ScoreRing value={score} size={240} stroke={18}/>
              <div style={{
                padding: "8px 16px", borderRadius: 999,
                background: "rgba(52,211,153,0.14)",
                border: "1px solid rgba(52,211,153,0.35)",
                color: "#34D399", fontSize: 13, fontWeight: 700,
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                <Icon name="trend" size={14}/> Estás en el top 28% del mercado
              </div>
            </div>

            {/* Summary + PDF */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="card-dl" style={{ padding: 28, flex: 1 }}>
                <div className="eyebrow-dl" style={{ marginBottom: 14 }}>
                  <Icon name="sparkles" size={14}/> Resumen de tu perfil — por DulIA
                </div>
                <p style={{
                  fontSize: 17, color: "var(--fg-2)", lineHeight: 1.55, margin: 0
                }}>
                  Tienes una <b style={{color:"var(--fg-1)"}}>base sólida en diseño UX</b> y
                  habilidades de investigación que muchas vacantes piden. Tu punto débil ahora
                  mismo es <b style={{color:"var(--magenta-400)"}}>no haber publicado tu portfolio</b>.
                  Resuélvelo y tu score sube a <b className="brand-text">86</b> en 2 semanas.
                </p>
                <div style={{
                  display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap"
                }}>
                  <span className="chip-dl selected">Diseño en Figma</span>
                  <span className="chip-dl selected">Investigación</span>
                  <span className="chip-dl">+ Portfolio (te falta)</span>
                </div>
              </div>

              {/* THE PDF BUTTON — HERO ELEMENT */}
              <PdfCard/>
            </div>
          </div>

          {/* TWO COLUMNS: opportunities + 30-day plan */}
          <div className="anim-in-delay-2" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24
          }}>
            <Opportunities onSeeAll={onVacancies}/>
            <ThirtyDayPlan/>
          </div>

          {/* SECONDARY PDF CTA AT BOTTOM */}
          <div className="anim-in-delay-3" style={{
            marginTop: 48, padding: 36,
            borderRadius: 24,
            background: "linear-gradient(135deg, rgba(236,72,153,0.14) 0%, rgba(124,58,237,0.10) 100%)",
            border: "1px solid rgba(236,72,153,0.35)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24
          }}>
            <div>
              <h3 style={{
                fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.015em"
              }}>Llévate tu plan completo</h3>
              <p style={{ margin: "8px 0 0", color: "var(--fg-2)", fontSize: 15 }}>
                Tu score, perfil y plan de 30 días en un PDF que puedes compartir.
              </p>
            </div>
            <Button variant="primary" size="lg" icon="download">
              Descargar mi plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// PDF DOWNLOAD CARD — el elemento más visible de la pantalla
// =========================================================
function PdfCard() {
  return (
    <div className="pdf-card-anim" style={{
      position: "relative",
      borderRadius: 24,
      padding: 28,
      background: "linear-gradient(135deg, #EC4899 0%, #A855F7 60%, #7C3AED 100%)",
      backgroundSize: "200% 200%",
      boxShadow: "0 24px 60px rgba(236,72,153,0.45), 0 8px 20px rgba(168,85,247,0.40)",
      overflow: "hidden",
    }}>
      {/* pulsing halo behind card */}
      <div className="pdf-halo" aria-hidden="true"/>

      {/* shine blobs */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 200, height: 200,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 70%)"
      }}/>
      <div style={{
        position: "absolute", bottom: -50, left: -30, width: 180, height: 180,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(192,132,252,0.30) 0%, transparent 70%)"
      }}/>

      {/* moving shine sweep */}
      <div className="pdf-shine" aria-hidden="true"/>

      {/* floating sparkles */}
      <span className="pdf-spark s1" aria-hidden="true">✦</span>
      <span className="pdf-spark s2" aria-hidden="true">✧</span>
      <span className="pdf-spark s3" aria-hidden="true">★</span>
      <span className="pdf-spark s4" aria-hidden="true">✦</span>

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20 }}>
        <div className="pdf-icon-bob" style={{
          width: 72, height: 72, borderRadius: 18,
          background: "rgba(13,13,13,0.30)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.20)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon name="download" size={32} color="#fff" strokeWidth={2.2}/>
        </div>
        <div style={{ flex: 1, color: "#fff" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", opacity: 0.85
          }}>
            ★ Tu siguiente paso
          </div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em",
            marginTop: 4, lineHeight: 1.15,
          }}>
            Descargar mi plan<br/>de 30 días
          </div>
        </div>
      </div>

      <button className="pdf-btn" style={{
        position: "relative",
        marginTop: 24, width: "100%",
        padding: "18px 24px",
        border: 0, borderRadius: 16,
        background: "rgba(13,13,13,0.88)",
        color: "#fff",
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17,
        cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.40)",
        overflow: "hidden",
      }}>
        <span className="pdf-btn-sweep" aria-hidden="true"/>
        <Icon name="download" size={20} color="#fff" strokeWidth={2.2}/>
        <span style={{ position: "relative" }}>Descargar PDF · 2 MB</span>
      </button>

      <div style={{
        marginTop: 14, display: "flex", justifyContent: "center", gap: 18,
        color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 500,
        position: "relative", zIndex: 1
      }}>
        <span>✓ Sin marca de agua</span>
        <span>✓ Compártelo</span>
        <span>✓ 100% gratis</span>
      </div>
    </div>
  );
}

// =========================================================
// OPPORTUNITIES
// =========================================================
function Opportunities({ onSeeAll }) {
  const jobs = [
    { co: "Rappi",     role: "Practicante UX",           loc: "Bogotá · Híbrido",    pay: "$1.8M",
      match: 92, tags: ["Figma","Investigación"], hot: true },
    { co: "Bancolombia", role: "Diseñador Jr. Producto", loc: "Medellín · Híbrido",  pay: "$2.4M",
      match: 87, tags: ["Figma","Design system"] },
    { co: "Mercado Libre", role: "UX Researcher Jr.",    loc: "Remoto Colombia",     pay: "$2.8M",
      match: 81, tags: ["Investigación","Inglés B2"] },
  ];
  return (
    <div className="card-dl" style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="eyebrow-dl"><Icon name="briefcase" size={14}/> Oportunidades para ti</div>
        <span style={{ fontSize: 12, color: "var(--fg-3)" }}>15.000 vacantes analizadas</span>
      </div>
      <h3 style={{
        margin: "10px 0 22px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.015em"
      }}>3 vacantes reales que cuadran contigo</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {jobs.map((j) => (
          <div key={j.co} style={{
            padding: 16, borderRadius: 16,
            background: "var(--bg-1)",
            border: "1px solid rgba(168,85,247,0.20)",
            display: "flex", alignItems: "center", gap: 14
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "var(--grad-brand)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16,
              flexShrink: 0
            }}>{j.co[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{j.role}</span>
                {j.hot && <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 999,
                  background: "rgba(236,72,153,0.18)",
                  color: "var(--magenta-300)",
                  fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase"
                }}>HOT</span>}
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
                {j.co} · {j.loc} · <b style={{color:"var(--fg-2)"}}>{j.pay}</b>
              </div>
            </div>
            <div style={{
              padding: "4px 10px", borderRadius: 999,
              background: j.match >= 90 ? "rgba(52,211,153,0.14)" : "rgba(168,85,247,0.12)",
              border: `1px solid ${j.match >= 90 ? "rgba(52,211,153,0.35)" : "rgba(168,85,247,0.30)"}`,
              color: j.match >= 90 ? "#34D399" : "var(--violet-200)",
              fontSize: 12, fontWeight: 700
            }}>{j.match}% match</div>
          </div>
        ))}
      </div>

      {/* fake job warning */}
      <div style={{
        marginTop: 14, padding: 12, borderRadius: 12,
        background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.30)",
        display: "flex", gap: 10, alignItems: "center", fontSize: 12, color: "var(--fg-2)"
      }}>
        <Icon name="alert" size={16} color="#F87171"/>
        <span><b style={{color:"#F87171"}}>2 vacantes filtradas</b> · pedían dinero por "capacitación".</span>
      </div>

      <button onClick={onSeeAll} style={{
        marginTop: 14, width: "100%",
        padding: "12px 16px", borderRadius: 14,
        background: "rgba(168,85,247,0.10)",
        border: "1px solid rgba(168,85,247,0.35)",
        color: "var(--fg-1)",
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
        cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        Ver el panel completo con semáforo
        <Icon name="arrow" size={16}/>
      </button>
    </div>
  );
}

// =========================================================
// 30-DAY PLAN
// =========================================================
function ThirtyDayPlan() {
  const weeks = [
    { w: "Semana 1", title: "Pon tu portfolio en línea",
      tasks: ["Sube 3 proyectos a Behance", "Conecta tu LinkedIn", "Reescribe tu bio"] },
    { w: "Semana 2", title: "Aplica a 10 vacantes (con cariño)",
      tasks: ["Carta personalizada cada una", "Sigue a 5 reclutadores en LinkedIn"] },
    { w: "Semana 3", title: "Sube tu nivel técnico",
      tasks: ["Curso de Design Systems (gratis)", "Reto: rediseña una app real"] },
    { w: "Semana 4", title: "Entrevistas + cierre",
      tasks: ["Prepara tu storytelling", "Practica con DulIA Mock"] },
  ];
  return (
    <div className="card-dl" style={{ padding: 28 }}>
      <div className="eyebrow-dl"><Icon name="calendar" size={14}/> Tu plan de 30 días</div>
      <h3 style={{
        margin: "10px 0 22px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.015em"
      }}>Una cosa a la vez. <span className="brand-text">Tú puedes.</span></h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {weeks.map((w, i) => (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: i === 0 ? "var(--grad-cta)" : "var(--grad-brand)",
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15,
              flexShrink: 0,
              boxShadow: i === 0 ? "0 8px 22px rgba(236,72,153,0.40)" : "0 6px 16px rgba(124,58,237,0.30)"
            }}>{i + 1}</div>
            <div style={{ flex: 1, paddingBottom: 8 }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline"
              }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{w.title}</span>
                <span style={{ fontSize: 11, color: "var(--fg-3)", fontWeight: 600 }}>{w.w}</span>
              </div>
              <ul style={{
                margin: "8px 0 0", padding: 0, listStyle: "none",
                fontSize: 13, color: "var(--fg-3)", lineHeight: 1.7
              }}>
                {w.tasks.map((t) => (
                  <li key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon name="check" size={14} color="var(--violet-400)" strokeWidth={2.4}/>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.Results = Results;
