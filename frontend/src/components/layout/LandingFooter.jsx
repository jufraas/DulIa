import DuliaLogo from '../brand/DuliaLogo'
import Container from '../ui/Container'

/** Footer minimal del kit ReBrand (Landing.jsx) */
export default function LandingFooter() {
  return (
    <footer
      className="relative z-[1] border-t py-10"
      style={{ borderColor: 'rgba(168,85,247,0.12)' }}
    >
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3.5">
            <DuliaLogo height={22} />
            <span className="text-[13px] text-[color:var(--fg-3)]">
              Hecho con <span style={{ color: 'var(--magenta-400)' }}>♥</span> en Barranquilla
              · 2026
            </span>
          </div>
          <div className="text-[13px] text-[color:var(--fg-3)]">
            Carlos · Migue · Jose · Jufra
          </div>
        </div>
      </Container>
    </footer>
  )
}
