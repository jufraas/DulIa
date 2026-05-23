import DuliaLogo from '../brand/DuliaLogo'
import Container from '../ui/Container'

/** Footer minimal del kit ReBrand (Landing.jsx) */
export default function LandingFooter() {
  const year = new Date().getFullYear()

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
              © {year} DulIA. Todos los derechos reservados.
            </span>
          </div>
          <div className="text-[13px] text-[color:var(--fg-3)]">
            krl0s · Migue · Jose · Joufra
          </div>
        </div>
      </Container>
    </footer>
  )
}
