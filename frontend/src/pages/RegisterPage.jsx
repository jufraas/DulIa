import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DuliaLogo from '../components/brand/DuliaLogo'
import { supabase } from '../services/supabase'

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function PasswordStrength({ password }) {
  function score(pwd) {
    let s = 0
    if (pwd.length >= 8) s++
    if (/[A-Z]/.test(pwd)) s++
    if (/[0-9]/.test(pwd)) s++
    if (/[^A-Za-z0-9]/.test(pwd)) s++
    return s
  }

  const colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#22C55E']
  const labels = ['Débil', 'Regular', 'Buena', 'Fuerte']
  const s = password.length === 0 ? 0 : score(password)

  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              backgroundColor: i < s ? colors[s - 1] : 'rgba(255,255,255,0.1)',
              transition: 'background-color 0.2s',
            }}
          />
        ))}
      </div>
      {password.length > 0 && (
        <span style={{ fontSize: '12px', color: colors[s - 1] ?? 'rgba(255,255,255,0.3)' }}>
          {labels[s - 1] ?? ''}
        </span>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', password: '' })
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/', { replace: true })
    })
  }, [navigate])

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleGoogleRegister() {
    if (!supabase) {
      setError('Registro no disponible: configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local')
      return
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setError(error.message)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!supabase) {
      setError('Registro no disponible: configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local')
      return
    }
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { nombre: form.nombre, apellido: form.apellido, telefono: form.telefono } },
    })
    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '12px 14px',
    color: '#F1F0FB',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{ minHeight: '100vh', backgroundColor: '#0F0F17', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#1A1A24',
          borderRadius: '24px',
          border: '1px solid rgba(139,92,246,0.4)',
          boxShadow: '0 0 40px rgba(139,92,246,0.15), 0 0 0 1px rgba(139,92,246,0.1)',
          padding: '40px 36px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <DuliaLogo height={36} />
        </div>

        {/* Título */}
        <h1 style={{ textAlign: 'center', color: '#F1F0FB', fontSize: '22px', fontWeight: '700', marginBottom: '28px', lineHeight: '1.3' }}>
          <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Crea tu cuenta.
          </span>
        </h1>

        {/* Botón Google */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            backgroundColor: '#ffffff',
            color: '#3c4043',
            border: 'none',
            borderRadius: '12px',
            padding: '11px 16px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          <GoogleIcon />
          Continuar con Google
        </button>

        {/* Divisor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>o</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Nombre y Apellido — 2 columnas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input
              type="text"
              placeholder="Nombre"
              value={form.nombre}
              onChange={set('nombre')}
              required
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Apellido"
              value={form.apellido}
              onChange={set('apellido')}
              required
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={set('email')}
            required
            style={inputStyle}
          />

          {/* Teléfono con prefijo */}
          <div style={{ display: 'flex', gap: '0' }}>
            <span
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRight: 'none',
                borderRadius: '12px 0 0 12px',
                padding: '12px 12px',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '15px',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              +57
            </span>
            <input
              type="tel"
              placeholder="Número de teléfono"
              value={form.telefono}
              onChange={set('telefono')}
              style={{
                ...inputStyle,
                borderRadius: '0 12px 12px 0',
                flex: 1,
              }}
            />
          </div>

          {/* Contraseña con toggle y fortaleza */}
          <div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={form.password}
                onChange={set('password')}
                required
                style={{
                  ...inputStyle,
                  padding: '12px 44px 12px 14px',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0',
                }}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            <PasswordStrength password={form.password} />
          </div>

          {error && (
            <p style={{ color: '#EF4444', fontSize: '14px', textAlign: 'center', margin: '0' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#EC4899',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '13px 16px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              marginTop: '4px',
            }}
          >
            Crear mi cuenta
          </button>
        </form>

        {/* Aviso legal */}
        <p style={{ textAlign: 'center', marginTop: '14px', color: 'rgba(255,255,255,0.3)', fontSize: '12px', lineHeight: '1.5' }}>
          Al registrarte aceptas nuestros{' '}
          <span style={{ color: 'rgba(139,92,246,0.7)' }}>Términos de servicio</span>
          {' '}y{' '}
          <span style={{ color: 'rgba(139,92,246,0.7)' }}>Política de privacidad</span>.
        </p>

        {/* Link a login */}
        <p style={{ textAlign: 'center', marginTop: '16px', color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            style={{ color: '#8B5CF6', fontWeight: '600', textDecoration: 'none' }}
          >
            Inicia sesión →
          </Link>
        </p>
      </div>
    </div>
  )
}
