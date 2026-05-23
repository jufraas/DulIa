import { WIZARD_STEP_ICONS, WIZARD_STEPS } from '../../constants/onboardingOptions'

/**
 * @owner migue
 * @param {{ step: number }} props
 */
export default function WizardStepper({ step }) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {WIZARD_STEPS.map(({ title }, i) => {
        const Icon = WIZARD_STEP_ICONS[i]
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
