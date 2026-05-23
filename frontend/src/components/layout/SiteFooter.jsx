import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import DuliaLogo from '../brand/DuliaLogo'
import Container from '../ui/Container'

const CONTACT_EMAIL = 'dulliahackaton@gmail.com'
const CONTACT_PHONE = '3009752198'

const quickLinks = [
  { href: '/', label: 'Inicio', router: true },
  { href: '/sobre', label: 'Sobre DulIA', router: true },
  { href: '/comenzar', label: 'Comenzar', router: true },
  { href: '/#features', label: 'Cómo funciona', router: false },
  { href: '/sobre#modelo', label: 'Modelo de negocio', router: false },
]

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative z-[1] border-t py-10 sm:py-12"
      style={{ borderColor: 'rgba(168,85,247,0.12)' }}
    >
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block">
              <DuliaLogo height={22} />
            </Link>
            <p className="body mt-4 max-w-xs">
              Coach de carrera con IA para jóvenes colombianos. Oportunidades
              laborales reales y plan de acción personalizado.
            </p>
            <p className="caption mt-3 inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[color:var(--violet-300)]" aria-hidden />
              Barranqui-IA 2026 · Colombia
            </p>
          </div>

          <div>
            <h3 className="eyebrow mb-4">Enlaces</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {link.router ? (
                    <Link
                      to={link.href}
                      className="small transition hover:text-[color:var(--fg-1)]"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="small transition hover:text-[color:var(--fg-1)]"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="small flex items-start gap-2.5 transition hover:text-[color:var(--fg-1)]"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--violet-400)]" aria-hidden />
                  <span className="break-all">{CONTACT_EMAIL}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:+57${CONTACT_PHONE}`}
                  className="small flex items-center gap-2.5 transition hover:text-[color:var(--fg-1)]"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[color:var(--violet-400)]" aria-hidden />
                  <span>+57 {CONTACT_PHONE.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-10 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: 'rgba(168,85,247,0.12)' }}
        >
          <p className="caption">© {year} DulIA. Todos los derechos reservados.</p>
          <p className="caption">
            Hecho con{' '}
            <span style={{ color: 'var(--magenta-400)' }}>♥</span> en Barranquilla
            · krl0s · Migue · Jose · Jufra
          </p>
        </div>
      </Container>
    </footer>
  )
}
