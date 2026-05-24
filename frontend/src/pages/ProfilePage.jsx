import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SiteHeader from '../components/layout/SiteHeader'
import { supabase } from '../services/supabase'

const card = {
  backgroundColor: '#1A1A24',
  border: '1px solid rgba(168,85,247,0.30)',
  borderRadius: 22,
  boxShadow: '0 0 32px rgba(139,92,246,0.10)',
  padding: '28px 32px',
}

const inputStyle = {
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  padding: '12px 14px',
  color: '#F1F0FB',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  color: 'rgba(255,255,255,0.55)',
  fontSize: 13,
  marginBottom: 6,
  display: 'block',
}

const sectionTitle = {
  color: '#F1F0FB',
  fontSize: 17,
  fontWeight: 700,
  marginBottom: 20,
}

const prefixSpan = {
  backgroundColor: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRight: 'none',
  borderRadius: '12px 0 0 12px',
  padding: '12px',
  color: 'rgba(255,255,255,0.5)',
  fontSize: 15,
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
}

const saveBtn = {
  backgroundColor: '#EC4899',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  padding: '12px 24px',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  alignSelf: 'flex-start',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [initial, setInitial] = useState('U')
  const [fullName, setFullName] = useState('')

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [personalMsg, setPersonalMsg] = useState(null)

  const [linkedin, setLinkedin] = useState('')
  const [instagram, setInstagram] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [socialMsg, setSocialMsg] = useState(null)

  useEffect(() => {
    async function load() {
      if (!supabase) {
        navigate('/login', { replace: true })
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login', { replace: true }); return }

      setEmail(user.email || '')
      const n = user.user_metadata?.nombre || ''
      const a = user.user_metadata?.apellido || ''
      setNombre(n)
      setApellido(a)
      const fn = [n, a].filter(Boolean).join(' ') || user.email?.split('@')[0] || ''
      setFullName(fn)
      setInitial(fn.charAt(0).toUpperCase())

      const { data: profile } = await supabase
        .from('profiles')
        .select('telefono, linkedin, instagram, whatsapp')
        .eq('id', user.id)
        .single()

      if (profile) {
        setTelefono(profile.telefono || '')
        setLinkedin(profile.linkedin || '')
        setInstagram(profile.instagram || '')
        setWhatsapp(profile.whatsapp || '')
      }
      setLoading(false)
    }
    load()
  }, [navigate])

  async function savePersonal(e) {
    e.preventDefault()
    setPersonalMsg(null)
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').upsert({ id: user.id, nombre, apellido, telefono })
    setPersonalMsg(error ? { ok: false, text: error.message } : { ok: true, text: '¡Guardado!' })
  }

  async function saveSocial(e) {
    e.preventDefault()
    setSocialMsg(null)
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').upsert({ id: user.id, linkedin, instagram, whatsapp })
    setSocialMsg(error ? { ok: false, text: error.message } : { ok: true, text: '¡Guardado!' })
  }

  async function handleSignOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-0, #0F0F17)' }}>
        <SiteHeader />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-0, #0F0F17)' }}>
      <SiteHeader />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* Avatar + nombre */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            fontWeight: 700,
            color: '#fff',
            boxShadow: '0 0 32px rgba(139,92,246,0.35)',
          }}>
            {initial}
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: '#F1F0FB', fontSize: 22, fontWeight: 700, margin: 0 }}>{fullName}</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '4px 0 0' }}>{email}</p>
          </div>
        </div>

        {/* Información personal */}
        <form onSubmit={savePersonal}>
          <div style={card}>
            <h2 style={sectionTitle}>Información personal</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input style={inputStyle} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" />
                </div>
                <div>
                  <label style={labelStyle}>Apellido</label>
                  <input style={inputStyle} value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Apellido" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Correo electrónico</label>
                <input style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} value={email} readOnly />
              </div>

              <div>
                <label style={labelStyle}>Teléfono</label>
                <div style={{ display: 'flex' }}>
                  <span style={prefixSpan}>+57</span>
                  <input
                    style={{ ...inputStyle, borderRadius: '0 12px 12px 0', flex: 1 }}
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    placeholder="Número de teléfono"
                    type="tel"
                  />
                </div>
              </div>

              {personalMsg && (
                <p style={{ color: personalMsg.ok ? '#22C55E' : '#EF4444', fontSize: 14, margin: 0 }}>
                  {personalMsg.text}
                </p>
              )}

              <button type="submit" style={saveBtn}>Guardar cambios</button>
            </div>
          </div>
        </form>

        {/* Redes sociales */}
        <form onSubmit={saveSocial} style={{ marginTop: 20 }}>
          <div style={card}>
            <h2 style={sectionTitle}>Redes sociales</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>LinkedIn</label>
                <input style={inputStyle} value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/tu-perfil" />
              </div>
              <div>
                <label style={labelStyle}>Instagram</label>
                <input style={inputStyle} value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@tu_usuario" />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp</label>
                <div style={{ display: 'flex' }}>
                  <span style={prefixSpan}>+57</span>
                  <input
                    style={{ ...inputStyle, borderRadius: '0 12px 12px 0', flex: 1 }}
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    placeholder="Número de WhatsApp"
                    type="tel"
                  />
                </div>
              </div>

              {socialMsg && (
                <p style={{ color: socialMsg.ok ? '#22C55E' : '#EF4444', fontSize: 14, margin: 0 }}>
                  {socialMsg.text}
                </p>
              )}

              <button type="submit" style={saveBtn}>Guardar redes</button>
            </div>
          </div>
        </form>

        {/* Seguridad */}
        <div style={{ ...card, marginTop: 20 }}>
          <h2 style={sectionTitle}>Seguridad</h2>
          <p style={{ color: '#F1F0FB', fontSize: 15, margin: '0 0 6px' }}>Contraseña</p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '0 0 14px' }}>
            Puedes cambiar tu contraseña cuando quieras.
          </p>
          <Link
            to="/construccion"
            style={{ color: 'var(--violet-300, #C4B5FD)', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}
          >
            ¿Olvidaste tu contraseña? Cámbiala aquí →
          </Link>
        </div>

        {/* Cerrar sesión */}
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              backgroundColor: 'transparent',
              color: '#F87171',
              border: '1px solid rgba(239,68,68,0.5)',
              borderRadius: 12,
              padding: '12px 32px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    </div>
  )
}
