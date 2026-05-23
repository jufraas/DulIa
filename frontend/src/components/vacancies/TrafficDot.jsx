import { VACANCY_STATUS } from './vacancyStatus'

/** @param {{ status: 'green'|'yellow'|'red', pulse?: boolean, size?: number }} props */
export default function TrafficDot({ status, pulse = false, size = 12 }) {
  const s = VACANCY_STATUS[status]
  return (
    <span
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      {pulse && (
        <span
          className="absolute rounded-full"
          style={{
            inset: -4,
            background: s.color,
            opacity: 0.3,
            animation: 'trafficPulse 1.8s ease-out infinite',
          }}
        />
      )}
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }}
      />
    </span>
  )
}
