import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import Container from '../ui/Container'

const CONTACT_EMAIL = 'dulliahackaton@gmail.com'
const CONTACT_PHONE = '3009752198'

const quickLinks = [
  { href: '/', label: 'Inicio', router: true },
  { href: '/comenzar', label: 'Comenzar', router: true },
  { href: '/#como-funciona', label: 'Cómo funciona', router: false },
  { href: '/#modelo', label: 'Modelo de negocio', router: false },
]

const legalLinks = [
  { to: '/comenzar', label: 'Política de privacidad' },
  { to: '/comenzar', label: 'Términos de uso' },
]

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-slate-900/90">
      <Container className="py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block">
              <img
                src="/logo.svg"
                alt="DulIA — Coach de carrera con IA"
                className="h-10 w-auto"
                width={120}
                height={40}
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Coach de carrera con IA para jóvenes colombianos. Oportunidades
              laborales reales y plan de acción personalizado.
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400/90">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Barranqui-IA 2026 · Colombia
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Enlaces
            </h3>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {link.router ? (
                    <Link
                      to={link.href}
                      className="text-sm text-slate-400 transition hover:text-cyan-400"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-cyan-400"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact us
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-start gap-2.5 text-sm text-slate-400 transition hover:text-cyan-400"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" aria-hidden />
                  <span className="break-all">{CONTACT_EMAIL}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:+57${CONTACT_PHONE}`}
                  className="flex items-center gap-2.5 text-sm text-slate-400 transition hover:text-cyan-400"
                >
                  <Phone className="h-4 w-4 shrink-0 text-cyan-500" aria-hidden />
                  <span>+57 {CONTACT_PHONE.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}</span>
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Lun – Dom · Respuesta en menos de 24 h
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {year} DulIA. Todos los derechos reservados.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-xs text-slate-500 transition hover:text-slate-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-600">
            Hecho con IA para el futuro laboral de Colombia
          </p>
        </div>
      </Container>
    </footer>
  )
}
