import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import DuliaLogo from '../brand/DuliaLogo'
import Button from '../ui/Button'

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const featuresHref = location.pathname === '/' ? '#features' : '/#features'

  return (
    <header className="dh">
      <div className="container dl-container dh-inner">
        <Link to="/">
          <DuliaLogo />
        </Link>

        <nav className="dh-nav hidden md:flex" aria-label="Principal">
          <a href={featuresHref}>Cómo funciona</a>
          <Link to="/vacantes">Oportunidades</Link>
          <Link to="/sobre">Sobre DulIA</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/comenzar" className="hidden sm:block">
            <Button variant="primary" size="sm">
              Empezar
            </Button>
          </Link>

          <button
            type="button"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-[color:var(--fg-2)] hover:text-[color:var(--fg-1)] md:hidden"
            aria-expanded={open}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-[color:var(--border-glow)] px-4 py-4 md:hidden"
          aria-label="Móvil"
          style={{ background: 'rgba(13,13,13,0.95)' }}
        >
          <ul className="flex flex-col gap-1">
            <li>
              <a
                href={featuresHref}
                className="block rounded-lg px-3 py-3 text-[color:var(--fg-2)] hover:text-[color:var(--fg-1)]"
                onClick={() => setOpen(false)}
              >
                Cómo funciona
              </a>
            </li>
            <li>
              <Link
                to="/vacantes"
                className="block rounded-lg px-3 py-3 text-[color:var(--fg-2)] hover:text-[color:var(--fg-1)]"
                onClick={() => setOpen(false)}
              >
                Oportunidades
              </Link>
            </li>
            <li>
              <Link
                to="/sobre"
                className="block rounded-lg px-3 py-3 text-[color:var(--fg-2)] hover:text-[color:var(--fg-1)]"
                onClick={() => setOpen(false)}
              >
                Sobre DulIA
              </Link>
            </li>
            <li className="pt-2">
              <Link to="/comenzar" onClick={() => setOpen(false)}>
                <Button variant="primary" className="w-full justify-center">
                  Empezar
                </Button>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
