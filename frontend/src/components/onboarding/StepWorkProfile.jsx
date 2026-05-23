import {
  EDUCATION_LEVEL_OPTIONS,
  HAS_EXPERIENCE_OPTIONS,
} from '../../constants/onboardingOptions'
import Input from '../ui/Input'
import Select from '../ui/Select'
import TextArea from '../ui/TextArea'

export default function StepWorkProfile({ form, errors, update }) {
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
        placeholder="Ej. Ingeniería de Sistemas, diseño gráfico..."
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
        <>
          <Input
            label="Años de experiencia"
            name="experience_years"
            type="number"
            min={0}
            max={40}
            placeholder="Ej. 1"
            value={form.experience_years}
            onChange={update('experience_years')}
            error={errors.experience_years}
          />
          <TextArea
            label="Describe tu experiencia"
            name="experience_summary"
            placeholder="Ej. 6 meses en retail, practicante en marketing..."
            value={form.experience_summary}
            onChange={update('experience_summary')}
            error={errors.experience_summary}
          />
        </>
      )}
      <TextArea
        label="Habilidades técnicas"
        name="skills"
        placeholder="Ej. Python, Excel, Git, atención al cliente..."
        value={form.skills}
        onChange={update('skills')}
        error={errors.skills}
        hint="Separa con comas — se envían como array al backend"
      />
      <TextArea
        label="Habilidades blandas (opcional)"
        name="soft_skills"
        placeholder="Ej. Comunicación, trabajo en equipo, liderazgo..."
        value={form.soft_skills}
        onChange={update('soft_skills')}
        hint="Se incluyen en texto libre para la IA"
      />
    </>
  )
}
