/**
 * @owner migue
 * @param {{ message: string }} props
 */
export default function ApiErrorBanner({ message }) {
  if (!message) return null

  return (
    <p
      className="rounded-[14px] px-4 py-3 text-sm"
      style={{
        border: '1px solid rgba(248,113,113,0.35)',
        background: 'rgba(248,113,113,0.08)',
        color: 'var(--danger)',
      }}
    >
      {message}
    </p>
  )
}
