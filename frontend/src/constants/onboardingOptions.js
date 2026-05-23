import { Briefcase, Flag, Sparkles, Target, Zap } from 'lucide-react'

export const WIZARD_STEPS = [
  {
    title: 'Quién eres',
    subtitle: 'Datos básicos para personalizar tu ruta',
    icon: Sparkles,
  },
  {
    title: 'Tu perfil laboral',
    subtitle: 'Formación, experiencia y habilidades',
    icon: Briefcase,
  },
  {
    title: 'Qué buscas',
    subtitle: 'Preferencias para encontrar oportunidades reales',
    icon: Target,
  },
]

export const WIZARD_STEP_ICONS = [Zap, Briefcase, Flag]

export const AGE_RANGE_OPTIONS = [
  { value: '16-20', label: '16 – 20 años' },
  { value: '21-25', label: '21 – 25 años' },
  { value: '26-30', label: '26 – 30 años' },
  { value: '31+', label: '31 años o más' },
]

export const CURRENT_SITUATION_OPTIONS = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'recien_egresado', label: 'Recién egresado' },
  { value: 'primer_empleo', label: 'Buscando primer empleo' },
  { value: 'desempleado', label: 'Desempleado' },
  { value: 'cambio_laboral', label: 'Trabajando, quiero cambiar' },
]

export const EDUCATION_LEVEL_OPTIONS = [
  { value: 'bachiller', label: 'Bachiller' },
  { value: 'tecnico', label: 'Técnico / SENA' },
  { value: 'tecnologo', label: 'Tecnólogo' },
  { value: 'universitario', label: 'Universitario' },
  { value: 'postgrado', label: 'Postgrado' },
]

export const HAS_EXPERIENCE_OPTIONS = [
  { value: 'no', label: 'No, busco mi primera experiencia' },
  { value: 'si', label: 'Sí, tengo experiencia laboral' },
]

export const WORK_MODE_OPTIONS = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'remoto', label: 'Remoto' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'indiferente', label: 'Me da igual' },
]

export const OPPORTUNITY_TYPE_OPTIONS = [
  { value: 'empleo', label: 'Empleo formal' },
  { value: 'practica', label: 'Práctica / pasantía' },
  { value: 'freelance', label: 'Freelance / proyectos' },
  { value: 'primer_empleo', label: 'Primer empleo junior' },
]

export const AVAILABILITY_OPTIONS = [
  { value: 'inmediata', label: 'Inmediata' },
  { value: '1_mes', label: 'En 1 mes' },
  { value: 'fines_semana', label: 'Solo fines de semana' },
  { value: 'medio_tiempo', label: 'Medio tiempo' },
]

export const CV_MAX_SIZE_MB = 5
export const CV_ACCEPT = 'application/pdf'
