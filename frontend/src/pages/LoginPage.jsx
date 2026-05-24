import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DuliaLogo from '../components/brand/DuliaLogo'
import AuthDisabledBanner from '../components/auth/AuthDisabledBanner'
import RedirectIfHasProfile from '../components/auth/RedirectIfHasProfile'
import { useAuth } from '../hooks/useAuth'
import { checkProfile } from '../hooks/useProfileCheck'
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

const disabledBtn = { opacity: 0.45, cursor: 'not-allowed' }

async function resolvePostLoginPath(userId) {
  const hasCoachProfile = await checkProfile(userId)
  return hasCoachProfile ? '/progreso' : '/comenzar'
}

function LoginPageContent() {
  const navigate = useNavigate()
  const { user, isConfigured } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return undefined
    let cancelled = false
    void resolvePostLoginPath(user.id).then((path) => {
      if (!cancelled) navigate(path, { replace: true })
    })
    return () => {
      cancelled = true
    }
  }, [user, navigate])

  async function handleGoogleLogin() {
    if (!supabase || !isConfigured) return
    setError(null)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (oauthError) setError(oauthError.message)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!supabase || !isConfigured) return
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
    } else if (data.user?.id) {
      navigate(await resolvePostLoginPath(data.user.id))
    }
  }

  return (
    <div
      style={{ minHeight: '100vh', backgroundColor: '#0F0F17', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#1A1A24',
          borderRadius: '24px',
          border: '1px solid rgba(139,92,246,0.4)',
          boxShadow: '0 0 40px rgba(139,92,246,0.15), 0 0 0 1px rgba(139,92,246,0.1)',
          padding: '40px 36px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <DuliaLogo height={36} />
        </div>

        <h1 style={{ textAlign: 'center', color: '#F1F0FB', fontSize: '22px', fontWeight: '700', marginBottom: '28px', lineHeight: '1.3' }}>
          Bienvenido de vuelta,{' '}
          <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            parcero.
          </span>
        </h1>

        <AuthDisabledBanner />

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={!isConfigured}
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
            cursor: isConfigured ? 'pointer' : 'not-allowed',
            marginBottom: '20px',
            ...(isConfigured ? {} : disabledBtn),
          }}
        >
          <GoogleIcon />
          Continuar con Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>o</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={!isConfigured}
            style={{
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '12px 14px',
              color: '#F1F0FB',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box',
              ...(isConfigured ? {} : disabledBtn),
            }}
          />

          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={!isConfigured}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '12px 44px 12px 14px',
                color: '#F1F0FB',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                ...(isConfigured ? {} : disabledBtn),
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              disabled={!isConfigured}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: isConfigured ? 'pointer' : 'not-allowed',
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

          {error && (
            <p style={{ color: '#EF4444', fontSize: '14px', textAlign: 'center', margin: '0' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isConfigured}
            style={{
              width: '100%',
              backgroundColor: '#EC4899',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '13px 16px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: isConfigured ? 'pointer' : 'not-allowed',
              marginTop: '4px',
              ...(isConfigured ? {} : disabledBtn),
            }}
          >
            Iniciar sesión
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '22px', color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
          ¿No tienes cuenta?{' '}
          <Link
            to="/registro"
            style={{ color: '#8B5CF6', fontWeight: '600', textDecoration: 'none' }}
          >
            Regístrate parcero →
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <RedirectIfHasProfile fallbackPath="/progreso">
      <LoginPageContent />
    </RedirectIfHasProfile>
  )
}
