import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import { submitProfile } from '../services/api'
import { useProfileStore } from '../store/useProfileStore'

const emptyForm = {
  name: '',
  city: '',
  education: '',
  skills: '',
  interests: '',
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const setProfile = useProfileStore((s) => s.setProfile)
  const setResult = useProfileStore((s) => s.setResult)

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}))
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
    setApiError('')
  }

  const validate = () => {
    /** @type {Record<string, string>} */
    const next = {}
    if (!form.name.trim()) next.name = 'Escribe tu nombre'
    if (!form.city.trim()) next.city = 'Indica tu ciudad'
    if (!form.education.trim()) next.education = 'Cuéntanos qué estudias o estudiaste'
    if (!form.skills.trim()) next.skills = 'Menciona al menos una habilidad'
    if (!form.interests.trim()) next.interests = 'Indica tus intereses laborales'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setApiError('')

    try {
      const payload = {
        name: form.name.trim(),
        city: form.city.trim(),
        education: form.education.trim(),
        skills: form.skills.trim(),
        interests: form.interests.trim(),
      }
      const result = await submitProfile(payload)
      setProfile(payload)
      setResult(result)
      navigate('/resultados')
    } catch {
      setApiError('No pudimos procesar tu perfil. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
        <Container className="flex h-14 items-center gap-3 sm:h-16">
          <Link
            to="/"
            className="inline-flex min-h-10 items-center gap-2 text-sm text-slate-300 transition hover:text-cyan-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver
          </Link>
          <span className="flex items-center gap-2 font-semibold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            DulIA
          </span>
        </Container>
      </header>

      <main className="py-10 sm:py-14">
        <Container className="max-w-xl">
          <div className="mb-8">
            <p className="text-sm font-medium text-cyan-400">Paso 1 de 2</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Cuéntanos sobre ti
            </h1>
            <p className="mt-3 text-slate-400">
              Con esta info la IA arma tu ruta y busca oportunidades reales en
              tu zona. Toma menos de 2 minutos.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:p-6"
            noValidate
          >
            <Input
              label="Nombre"
              name="name"
              placeholder="Ej. María González"
              value={form.name}
              onChange={update('name')}
              error={errors.name}
              autoComplete="name"
            />

            <Input
              label="Ciudad"
              name="city"
              placeholder="Ej. Barranquilla"
              value={form.city}
              onChange={update('city')}
              error={errors.city}
              autoComplete="address-level2"
            />

            <Input
              label="Estudios"
              name="education"
              placeholder="Ej. Comunicación social, técnico en diseño..."
              value={form.education}
              onChange={update('education')}
              error={errors.education}
            />

            <TextArea
              label="Habilidades"
              name="skills"
              placeholder="Ej. Canva, edición de video, Excel, atención al cliente..."
              value={form.skills}
              onChange={update('skills')}
              error={errors.skills}
              hint="Separa con comas si quieres"
            />

            <TextArea
              label="Intereses laborales"
              name="interests"
              placeholder="Ej. Marketing digital, contenido para redes, ventas..."
              value={form.interests}
              onChange={update('interests')}
              error={errors.interests}
              hint="¿Qué tipo de trabajo te gustaría encontrar?"
            />

            {apiError && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {apiError}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Analizar mi perfil
            </Button>
          </form>
        </Container>
      </main>
    </div>
  )
}
