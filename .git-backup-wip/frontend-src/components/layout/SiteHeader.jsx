import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Sparkles } from 'lucide-react'
import Container from '../ui/Container'

const navLinks = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#para-quien', label: 'Para quién' },
  { href: '#modelo', label: 'Modelo' },
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between sm:h-16">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          DulIA
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-300 transition hover:text-cyan-400"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/comenzar"
            className="hidden min-h-10 items-center rounded-xl bg-cyan-500 px-4 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400 sm:inline-flex"
          >
            Comenzar
          </Link>

          <button
            type="button"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 md:hidden"
            aria-expanded={open}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {open && (
        <nav
          className="border-t border-white/10 bg-slate-900 px-4 py-4 md:hidden"
          aria-label="Móvil"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-lg px-3 py-3 text-slate-200 hover:bg-white/5"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/comenzar"
                className="mt-2 flex min-h-11 items-center justify-center rounded-xl bg-cyan-500 font-semibold text-slate-900"
                onClick={() => setOpen(false)}
              >
                Comenzar
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
