import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Flag,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import DuliaLogo from '../components/brand/DuliaLogo'
import PageShell from '../components/layout/PageShell'
import SiteFooter from '../components/layout/SiteFooter'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import TextArea from '../components/ui/TextArea'
import { submitProfile } from '../services/api'
import { useProfileStore } from '../store/useProfileStore'

const STEPS = [
  { title: 'Quién eres', subtitle: 'Datos básicos para personalizar tu ruta', icon: Sparkles },
  { title: 'Tu perfil laboral', subtitle: 'Formación, experiencia y habilidades', icon: Briefcase },
  { title: 'Qué buscas', subtitle: 'Preferencias para encontrar oportunidades reales', icon: Target },
]

const emptyForm = {
  name: '',
  city: '',
  age_range: '',
  current_situation: '',
  education_level: '',
  education: '',
  has_experience: '',
  experience_summary: '',
  skills: '',
  soft_skills: '',
  interests: '',
  work_mode: '',
  opportunity_type: '',
  availability: '',
  tools: '',
  portfolio_url: '',
}

/** @param {typeof emptyForm} form */
function buildPayload(form) {
  return {
    name: form.name.trim(),
    city: form.city.trim(),
    age_range: form.age_range,
    current_situation: form.current_situation,
    education_level: form.education_level,
    education: form.education.trim(),
    has_experience: form.has_experience === 'si',
    experience_summary: form.experience_summary.trim(),
    skills: form.skills.trim(),
    soft_skills: form.soft_skills.trim(),
    interests: form.interests.trim(),
    work_mode: form.work_mode,
    opportunity_type: form.opportunity_type,
    availability: form.availability,
    tools: form.tools.trim(),
    portfolio_url: form.portfolio_url.trim(),
  }
}

function WizardProgress({ value, step, total }) {
  return (
    <div className="hidden flex-1 md:block" style={{ maxWidth: 480, margin: '0 32px' }}>
      <div
        className="h-1.5 overflow-hidden rounded-full"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            background: 'linear-gradient(90deg,#7C3AED 0%,#A855F7 50%,#EC4899 100%)',
            boxShadow: '0 0 16px rgba(236,72,153,0.45)',
          }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-[family-name:var(--font-mono)] text-[11px] text-[color:var(--fg-3)]">
        <span>
          Paso {step} de {total}
        </span>
        <span>{Math.round(value)}%</span>
      </div>
    </div>
  )
}

function Stepper({ step }) {
  const icons = [Zap, Briefcase, Flag]
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {STEPS.map(({ title }, i) => {
        const Icon = icons[i]
        const active = i === step
        const done = i < step
        return (
          <div
            key={title}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold sm:px-4"
            style={{
              background: active
                ? 'rgba(168,85,247,0.22)'
                : done
                  ? 'rgba(52,211,153,0.12)'
                  : 'rgba(255,255,255,0.04)',
              border: `1px solid ${
                active
                  ? 'rgba(168,85,247,0.65)'
                  : done
                    ? 'rgba(52,211,153,0.35)'
                    : 'rgba(255,255,255,0.08)'
              }`,
              color: active ? 'var(--fg-1)' : done ? '#34D399' : 'var(--fg-3)',
            }}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">{title}</span>
            <span className="sm:hidden">{i + 1}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const setProfile = useProfileStore((s) => s.setProfile)
  const setResult = useProfileStore((s) => s.setResult)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}))
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
    setApiError('')
  }

  const validateStep = (currentStep) => {
    /** @type {Record<string, string>} */
    const next = {}

    if (currentStep === 0) {
      if (!form.name.trim()) next.name = 'Escribe tu nombre'
      if (!form.city.trim()) next.city = 'Indica tu ciudad'
      if (!form.age_range) next.age_range = 'Selecciona tu rango de edad'
      if (!form.current_situation) next.current_situation = 'Indica tu situación actual'
    }

    if (currentStep === 1) {
      if (!form.education_level) next.education_level = 'Selecciona tu nivel de estudios'
      if (!form.education.trim()) next.education = 'Cuéntanos qué estudias o estudiaste'
      if (!form.has_experience) next.has_experience = 'Indica si has trabajado antes'
      if (form.has_experience === 'si' && !form.experience_summary.trim()) {
        next.experience_summary = 'Describe brevemente tu experiencia'
      }
      if (!form.skills.trim()) next.skills = 'Menciona al menos una habilidad'
    }

    if (currentStep === 2) {
      if (!form.interests.trim()) next.interests = 'Indica tus intereses laborales'
      if (!form.work_mode) next.work_mode = 'Selecciona modalidad de trabajo'
      if (!form.opportunity_type) next.opportunity_type = 'Selecciona tipo de oportunidad'
      if (!form.availability) next.availability = 'Indica cuándo puedes empezar'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goNext = () => {
    if (!validateStep(step)) return
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const goBack = () => {
    setErrors({})
    if (step === 0) {
      navigate('/')
      return
    }
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(step)) return

    setLoading(true)
    setApiError('')

    try {
      const payload = buildPayload(form)
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

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <PageShell>
      <header className="dh">
        <Container className="dh-inner">
          <Link to="/">
            <DuliaLogo />
          </Link>
          <WizardProgress value={progress} step={step + 1} total={STEPS.length} />
          <Button variant="ghost" onClick={() => navigate('/')}>
            Cancelar
          </Button>
        </Container>
      </header>

      <main className="relative z-[1] flex-1 pb-24 pt-10 sm:pt-14">
        <Container className="max-w-[760px]">
          <Stepper step={step} />

          <div key={step} className="anim-in mt-10">
            <p className="eyebrow-dl mb-3 md:hidden">
              Paso {step + 1} de {STEPS.length} · {Math.round(progress)}%
            </p>
            <h1 className="h2 m-0">{STEPS[step].title}</h1>
            <p className="body mt-2">{STEPS[step].subtitle}</p>

            <form
              onSubmit={handleSubmit}
              className="card-dl mt-8 flex flex-col gap-5"
              style={{ padding: 28 }}
              noValidate
            >
              {step === 0 && (
                <>
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
                  <Select
                    label="Rango de edad"
                    name="age_range"
                    value={form.age_range}
                    onChange={update('age_range')}
                    error={errors.age_range}
                    options={[
                      { value: '16-20', label: '16 – 20 años' },
                      { value: '21-25', label: '21 – 25 años' },
                      { value: '26-30', label: '26 – 30 años' },
                      { value: '31+', label: '31 años o más' },
                    ]}
                  />
                  <Select
                    label="Situación actual"
                    name="current_situation"
                    value={form.current_situation}
                    onChange={update('current_situation')}
                    error={errors.current_situation}
                    options={[
                      { value: 'estudiante', label: 'Estudiante' },
                      { value: 'recien_egresado', label: 'Recién egresado' },
                      { value: 'primer_empleo', label: 'Buscando primer empleo' },
                      { value: 'desempleado', label: 'Desempleado' },
                      { value: 'cambio_laboral', label: 'Trabajando, quiero cambiar' },
                    ]}
                  />
                </>
              )}

              {step === 1 && (
                <>
                  <Select
                    label="Nivel de estudios"
                    name="education_level"
                    value={form.education_level}
                    onChange={update('education_level')}
                    error={errors.education_level}
                    options={[
                      { value: 'bachiller', label: 'Bachiller' },
                      { value: 'tecnico', label: 'Técnico / SENA' },
                      { value: 'tecnologo', label: 'Tecnólogo' },
                      { value: 'universitario', label: 'Universitario' },
                      { value: 'postgrado', label: 'Postgrado' },
                    ]}
                  />
                  <Input
                    label="Carrera o área de estudio"
                    name="education"
                    placeholder="Ej. Comunicación social, diseño gráfico..."
                    value={form.education}
                    onChange={update('education')}
                    error={errors.education}
                  />
                  <Select
                    label="¿Has trabajado antes?"
                    name="has_experience"
                    value={form.has_experience}
                    onChange={update('has_experience')}
                    error={errors.has_experience}
                    options={[
                      { value: 'no', label: 'No, busco mi primera experiencia' },
                      { value: 'si', label: 'Sí, tengo experiencia laboral' },
                    ]}
                  />
                  {form.has_experience === 'si' && (
                    <TextArea
                      label="Describe tu experiencia"
                      name="experience_summary"
                      placeholder="Ej. 6 meses en retail, practicante en marketing..."
                      value={form.experience_summary}
                      onChange={update('experience_summary')}
                      error={errors.experience_summary}
                    />
                  )}
                  <TextArea
                    label="Habilidades técnicas"
                    name="skills"
                    placeholder="Ej. Canva, Excel, Python, atención al cliente..."
                    value={form.skills}
                    onChange={update('skills')}
                    error={errors.skills}
                    hint="Separa con comas"
                  />
                  <TextArea
                    label="Habilidades blandas (opcional)"
                    name="soft_skills"
                    placeholder="Ej. Comunicación, trabajo en equipo, liderazgo..."
                    value={form.soft_skills}
                    onChange={update('soft_skills')}
                    hint="Opcional — mejora tu análisis"
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <TextArea
                    label="Intereses laborales"
                    name="interests"
                    placeholder="Ej. Marketing digital, contenido para redes, ventas..."
                    value={form.interests}
                    onChange={update('interests')}
                    error={errors.interests}
                  />
                  <Select
                    label="Modalidad de trabajo"
                    name="work_mode"
                    value={form.work_mode}
                    onChange={update('work_mode')}
                    error={errors.work_mode}
                    options={[
                      { value: 'presencial', label: 'Presencial' },
                      { value: 'remoto', label: 'Remoto' },
                      { value: 'hibrido', label: 'Híbrido' },
                      { value: 'indiferente', label: 'Me da igual' },
                    ]}
                  />
                  <Select
                    label="Tipo de oportunidad"
                    name="opportunity_type"
                    value={form.opportunity_type}
                    onChange={update('opportunity_type')}
                    error={errors.opportunity_type}
                    options={[
                      { value: 'empleo', label: 'Empleo formal' },
                      { value: 'practica', label: 'Práctica / pasantía' },
                      { value: 'freelance', label: 'Freelance / proyectos' },
                      { value: 'primer_empleo', label: 'Primer empleo junior' },
                    ]}
                  />
                  <Select
                    label="Disponibilidad"
                    name="availability"
                    value={form.availability}
                    onChange={update('availability')}
                    error={errors.availability}
                    options={[
                      { value: 'inmediata', label: 'Inmediata' },
                      { value: '1_mes', label: 'En 1 mes' },
                      { value: 'fines_semana', label: 'Solo fines de semana' },
                      { value: 'medio_tiempo', label: 'Medio tiempo' },
                    ]}
                  />
                  <TextArea
                    label="Herramientas que manejas (opcional)"
                    name="tools"
                    placeholder="Ej. Canva, CapCut, Figma, Excel..."
                    value={form.tools}
                    onChange={update('tools')}
                  />
                  <Input
                    label="LinkedIn o portafolio (opcional)"
                    name="portfolio_url"
                    type="url"
                    placeholder="https://linkedin.com/in/tu-perfil"
                    value={form.portfolio_url}
                    onChange={update('portfolio_url')}
                  />
                </>
              )}

              {apiError && (
                <p
                  className="rounded-[14px] px-4 py-3 text-sm"
                  style={{
                    border: '1px solid rgba(248,113,113,0.35)',
                    background: 'rgba(248,113,113,0.08)',
                    color: 'var(--danger)',
                  }}
                >
                  {apiError}
                </p>
              )}

              <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={goBack}
                  iconLeft={<ArrowLeft className="h-4 w-4" aria-hidden />}
                  className="sm:w-auto"
                >
                  {step === 0 ? 'Volver al inicio' : 'Atrás'}
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={goNext}
                    iconRight={<ArrowRight className="h-5 w-5" aria-hidden />}
                    className="sm:ml-auto"
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    iconRight={<Sparkles className="h-5 w-5" aria-hidden />}
                    className="sm:ml-auto"
                  >
                    Analizar mi perfil
                  </Button>
                )}
              </div>
            </form>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </PageShell>
  )
}
