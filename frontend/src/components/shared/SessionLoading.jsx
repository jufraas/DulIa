import PageShell from '../layout/PageShell'

/** Pantalla breve mientras se restaura la sesión tras refresh. */
export default function SessionLoading() {
  return (
    <PageShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-[color:var(--fg-3)] border-t-[color:var(--accent-pink)]"
          aria-hidden
        />
        <p className="m-0 text-sm text-[color:var(--fg-2)]">Restaurando tu sesión…</p>
      </div>
    </PageShell>
  )
}
