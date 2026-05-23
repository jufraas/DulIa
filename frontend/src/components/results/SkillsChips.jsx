import { Check } from 'lucide-react'

/**
 * @owner compañero-front
 * @param {{ skills: string[], limit?: number }} props
 */
export default function SkillsChips({ skills, limit = 4 }) {
  if (!skills.length) return null

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {skills.slice(0, limit).map((skill) => (
        <span key={skill} className="chip-dl selected">
          <Check className="h-3.5 w-3.5" aria-hidden />
          {skill}
        </span>
      ))}
    </div>
  )
}
