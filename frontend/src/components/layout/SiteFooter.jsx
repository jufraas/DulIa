import Container from '../ui/Container'

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 py-10">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-white">DulIA</p>
          <p className="mt-1 text-sm text-slate-400">
            Coach de carrera con IA · Barranqui-IA 2026
          </p>
        </div>
        <p className="text-sm text-slate-500">
          Hecho para jóvenes colombianos que buscan su primera oportunidad real.
        </p>
      </Container>
    </footer>
  )
}
