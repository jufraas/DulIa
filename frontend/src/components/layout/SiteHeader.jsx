import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import DuliaLogo from '../brand/DuliaLogo'
import Button from '../ui/Button'

const navLinks = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#para-quien', label: 'Para quién' },
  { href: '#modelo', label: 'Modelo' },
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="dh">
      <div className="container dl-container dh-inner">
        <Link to="/">
          <DuliaLogo />
        </Link>

        <nav className="dh-nav hidden md:flex" aria-label="Principal">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
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
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-lg px-3 py-3 text-[color:var(--fg-2)] hover:text-[color:var(--fg-1)]"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
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
