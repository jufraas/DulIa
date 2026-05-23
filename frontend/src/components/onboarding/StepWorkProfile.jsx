import {
  EDUCATION_LEVEL_OPTIONS,
  HAS_EXPERIENCE_OPTIONS,
} from '../../constants/onboardingOptions'
import CvUpload from './CvUpload'
import Input from '../ui/Input'
import Select from '../ui/Select'
import TextArea from '../ui/TextArea'

/**
 * @owner migue
 * @param {{
 *   form: import('../../store/useProfileStore').OnboardingFormState,
 *   errors: Record<string, string>,
 *   cvFile: File | null,
 *   update: (field: string) => (e: import('react').ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
 *   onCvChange: (file: File | null) => void,
 * }} props
 */
export default function StepWorkProfile({
  form,
  errors,
  cvFile,
  update,
  onCvChange,
}) {
  return (
    <>
      <Select
        label="Nivel de estudios"
        name="education_level"
        value={form.education_level}
        onChange={update('education_level')}
        error={errors.education_level}
        options={EDUCATION_LEVEL_OPTIONS}
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
        options={HAS_EXPERIENCE_OPTIONS}
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
      <CvUpload file={cvFile} onChange={onCvChange} error={errors.cv} />
    </>
  )
}
