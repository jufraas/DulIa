import {
  Briefcase,
  Download,
  LayoutDashboard,
  Radar,
  TrendingUp,
  Waypoints,
} from 'lucide-react'
import { RESULTS_SECTIONS } from '../../constants/resultsSections'

/** @type {Record<string, import('lucide-react').LucideIcon>} */
const SECTION_ICONS = {
  'resultados-analisis': LayoutDashboard,
  'resultados-mercado': TrendingUp,
  'resultados-oportunidades-plan': Briefcase,
  'resultados-radar': Radar,
  'resultados-timeline': Waypoints,
  'resultados-pdf': Download,
}

/**
 * @param {{
 *   activeId: string,
 *   onNavigate: (id: string) => void,
 * }} props
 */
export default function ResultsSectionNav({ activeId, onNavigate }) {
  const renderLink = (section, compact = false) => {
    const Icon = SECTION_ICONS[section.id] ?? LayoutDashboard
    const active = activeId === section.id

    return (
      <button
        key={section.id}
        type="button"
        onClick={() => onNavigate(section.id)}
        className={`results-section-nav__link ${active ? 'results-section-nav__link--active' : ''} ${compact ? 'results-section-nav__link--compact' : ''}`}
        aria-current={active ? 'true' : undefined}
      >
        <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
        <span>{section.label}</span>
      </button>
    )
  }

  return (
    <>
      <nav
        className="results-section-nav results-section-nav--mobile lg:hidden"
        aria-label="Secciones del análisis"
      >
        <p className="results-section-nav__eyebrow">Ir a</p>
        <div className="results-section-nav__scroll">
          {RESULTS_SECTIONS.map((s) => renderLink(s, true))}
        </div>
      </nav>

      <nav
        className="results-section-nav results-section-nav--desktop hidden lg:block"
        aria-label="Secciones del análisis"
      >
        <p className="results-section-nav__eyebrow">En esta página</p>
        <div className="results-section-nav__list">
          {RESULTS_SECTIONS.map((s) => renderLink(s, false))}
        </div>
      </nav>
    </>
  )
}
