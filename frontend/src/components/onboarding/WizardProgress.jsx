/**
 * @owner migue
 * @param {{ value: number, step: number, total: number }} props
 */
export default function WizardProgress({ value, step, total }) {
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
