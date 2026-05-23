/* === DulIA UI kit — shared atoms === */

const { useState, useEffect, useRef } = React;

// ---------- ICON ----------
// Lucide-style icons (stroke 1.75, currentColor)
const ICONS = {
  sparkles: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></>,
  shield:   <><path d="M12 2L4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z"/><path d="M9 12l2 2 4-4"/></>,
  trend:    <><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></>,
  target:   <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  arrow:    <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  check:    <><polyline points="20 6 9 17 4 12"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  alert:    <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  star:     <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  bolt:     <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
  user:     <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  briefcase:<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
  flag:     <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  back:     <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
};
function Icon({ name, size = 20, color = "currentColor", strokeWidth = 1.75, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {ICONS[name] || null}
    </svg>
  );
}

// ---------- LOGO ----------
function Logo({ height = 28 }) {
  return <img src="../../assets/dulia-logo.svg" alt="DulIA" style={{ height, display:'block' }} />;
}

// ---------- BUTTON ----------
function Button({ children, variant = "primary", size = "md", onClick, icon, iconRight, type, disabled, style }) {
  const cls = `btn btn-${variant}${size !== "md" ? ` ${size}` : ""}`;
  return (
    <button className={cls} onClick={onClick} type={type} disabled={disabled} style={style}>
      {icon && <Icon name={icon} size={size === "lg" ? 22 : 18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "lg" ? 22 : 18} />}
    </button>
  );
}

// ---------- HEADER ----------
function Header({ active = "home", onNav }) {
  return (
    <header className="dh">
      <div className="container dh-inner">
        <a href="#" onClick={(e) => { e.preventDefault(); onNav && onNav("home"); }}>
          <Logo />
        </a>
        <nav className="dh-nav">
          <a href="#" onClick={(e)=>{e.preventDefault();onNav&&onNav("home");}}>Cómo funciona</a>
          <a href="#" onClick={(e)=>{e.preventDefault();onNav&&onNav("vacancies");}}>Oportunidades</a>
          <a href="#" onClick={(e)=>{e.preventDefault();onNav&&onNav("home");}}>Sobre DulIA</a>
        </nav>
        <Button variant="primary" size="sm" onClick={() => onNav && onNav("wizard")}>
          Empezar
        </Button>
      </div>
    </header>
  );
}

// ---------- CHIP ----------
function Chip({ children, selected, onClick }) {
  return (
    <div className={`chip-dl${selected ? " selected" : ""}`} onClick={onClick}>
      {selected && <Icon name="check" size={14} />}
      {children}
    </div>
  );
}

// ---------- SCORE RING ----------
function ScoreRing({ value = 0, size = 240, stroke = 18, animate = true }) {
  const [v, setV] = useState(animate ? 0 : value);
  useEffect(() => {
    if (!animate) return;
    const id = setTimeout(() => setV(value), 150);
    return () => clearTimeout(id);
  }, [value, animate]);
  const R = (size - stroke) / 2;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - v / 100);
  const color = v >= 75 ? "var(--score-high)" : v >= 50 ? "var(--score-mid)" : "var(--score-low)";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED"/>
            <stop offset="50%" stopColor="#A855F7"/>
            <stop offset="100%" stopColor="#EC4899"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={R}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={R}
          fill="none" stroke="url(#ringGrad)" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.30,1)",
            filter: "drop-shadow(0 0 16px rgba(168,85,247,0.55))" }}/>
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 900,
          fontSize: size * 0.32, lineHeight: 1, letterSpacing: "-0.05em",
          background: "linear-gradient(135deg,#C084FC 0%,#EC4899 100%)",
          backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent",
        }}>{v}</div>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 600,
          fontSize: size * 0.07, color: "var(--fg-3)", marginTop: 4,
        }}>/ 100 puntos</div>
      </div>
    </div>
  );
}

// ---------- ICON BOX ----------
function IconBox({ name, variant = "violet", size = 56, iconSize = 26 }) {
  return (
    <div className={`iconbox${variant === "magenta" ? " magenta" : ""}`}
      style={{ width: size, height: size }}>
      <Icon name={name} size={iconSize} color="#fff" strokeWidth={2}/>
    </div>
  );
}

window.DK = { Icon, Logo, Button, Header, Chip, ScoreRing, IconBox };
