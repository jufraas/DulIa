import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import DuliaLogo from '../brand/DuliaLogo'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

function userDisplayInfo(user) {
  const nombre = user.user_metadata?.nombre || ''
  const apellido = user.user_metadata?.apellido || ''
  const fullName = [nombre, apellido].filter(Boolean).join(' ') || user.email?.split('@')[0] || ''
  return {
    initial: fullName.charAt(0).toUpperCase(),
    fullName,
    email: user.email || '',
  }
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, isConfigured, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const dropdownRef = useRef(/** @type {HTMLDivElement | null} */(null))

  const userInfo = user ? userDisplayInfo(user) : null

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(/** @type {MouseEvent} */ e) {
      if (dropdownRef.current && !dropdownRef.current.contains(/** @type {Node} */(e.target))) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  async function handleSignOut() {
    await signOut()
    setDropdownOpen(false)
    navigate('/')
  }

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
          {userInfo && (
            <>
              <Link to="/progreso">Mi progreso</Link>
              <Link to="/entrevistas">Entrevistas</Link>
            </>
          )}
          <Link to="/sobre">Sobre DulIA</Link>
        </nav>

        <div className="flex items-center gap-2">
          {userInfo ? (
            <div style={{ position: 'relative' }} ref={dropdownRef} className="hidden sm:block">
              <button
                type="button"
                onClick={() => setDropdownOpen(v => !v)}
                aria-label="Menú de usuario"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {userInfo.initial}
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: 240,
                  backgroundColor: 'rgba(26,26,36,0.97)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: 16,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                  overflow: 'hidden',
                  zIndex: 100,
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 999,
                      background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
                    }}>
                      {userInfo.initial}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ color: '#F1F0FB', fontSize: 14, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {userInfo.fullName}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {userInfo.email}
                      </p>
                    </div>
                  </div>
                  <div style={{ padding: '8px' }}>
                    <Link
                      to="/progreso"
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: 'block', padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14, textDecoration: 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      Mi progreso
                    </Link>
                    <Link
                      to="/entrevistas"
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: 'block', padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14, textDecoration: 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      Entrevistas
                    </Link>
                    <Link
                      to="/perfil"
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: 'block', padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14, textDecoration: 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      Mi perfil
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, color: '#F87171', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : isConfigured ? (
            <Link to="/login" className="hidden sm:block text-[color:var(--fg-2)] hover:text-[color:var(--fg-1)] text-sm font-medium px-3 py-2 transition-colors">
              Iniciar sesión
            </Link>
          ) : null}
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
            {userInfo && (
              <>
                <li>
                  <Link
                    to="/progreso"
                    className="block rounded-lg px-3 py-3 text-[color:var(--fg-2)] hover:text-[color:var(--fg-1)]"
                    onClick={() => setOpen(false)}
                  >
                    Mi progreso
                  </Link>
                </li>
                <li>
                  <Link
                    to="/entrevistas"
                    className="block rounded-lg px-3 py-3 text-[color:var(--fg-2)] hover:text-[color:var(--fg-1)]"
                    onClick={() => setOpen(false)}
                  >
                    Entrevistas
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link
                to="/sobre"
                className="block rounded-lg px-3 py-3 text-[color:var(--fg-2)] hover:text-[color:var(--fg-1)]"
                onClick={() => setOpen(false)}
              >
                Sobre DulIA
              </Link>
            </li>
            {isConfigured && !userInfo && (
              <li>
                <Link
                  to="/login"
                  className="block rounded-lg px-3 py-3 text-[color:var(--fg-2)] hover:text-[color:var(--fg-1)]"
                  onClick={() => setOpen(false)}
                >
                  Iniciar sesión
                </Link>
              </li>
            )}
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
