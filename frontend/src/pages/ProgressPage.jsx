import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import SiteHeader from '../components/layout/SiteHeader'
import Container from '../components/ui/Container'

const MOCK = {
  nombre: 'Juan',
  score: 73,
  dia_actual: 3,
  porcentaje_global: 18,
  plan: [
    {
      semana: 1,
      titulo: 'Auditoría y diagnóstico',
      tareas: [
        { id: 1, texto: 'Actualizar LinkedIn', completada: true },
        { id: 2, texto: 'Crear GitHub', completada: true },
        { id: 3, texto: 'Listar 10 empresas objetivo', completada: false },
        { id: 4, texto: 'Actualizar CV', completada: false },
      ],
    },
    {
      semana: 2,
      titulo: 'Habilidades clave',
      tareas: [
        { id: 5, texto: 'Curso Python en Platzi', completada: false },
        { id: 6, texto: '3 ejercicios HackerRank', completada: false },
      ],
    },
    {
      semana: 3,
      titulo: 'Red de contactos',
      tareas: [
        { id: 7, texto: '20 conexiones LinkedIn', completada: false },
        { id: 8, texto: '1 meetup local', completada: false },
      ],
    },
    {
      semana: 4,
      titulo: 'Aplicación activa',
      tareas: [
        { id: 9, texto: 'Aplicar a 10 vacantes', completada: false },
        { id: 10, texto: 'Carta de presentación', completada: false },
      ],
    },
  ],
}

function buildInitialChecks() {
  const map = {}
  MOCK.plan.forEach(s => s.tareas.forEach(t => { map[t.id] = t.completada }))
  return map
}

function WeekCard({ semana, checks, onToggle }) {
  const total = semana.tareas.length
  const done = semana.tareas.filter(t => checks[t.id]).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-bold text-white">
          Semana {semana.semana}
        </span>
        <h3 className="m-0 text-sm font-semibold text-white">{semana.titulo}</h3>
      </div>

      <ul className="flex flex-col gap-2.5">
        {semana.tareas.map(tarea => {
          const checked = checks[tarea.id]
          return (
            <li key={tarea.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onToggle(tarea.id)}
                aria-label={checked ? `Desmarcar: ${tarea.texto}` : `Marcar: ${tarea.texto}`}
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  checked
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-600 bg-transparent hover:border-gray-400'
                }`}
              >
                {checked && (
                  <svg viewBox="0 0 10 10" className="h-3 w-3 text-white" fill="none">
                    <path
                      d="M1.5 5l2.5 2.5 4.5-4.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <span
                className={`text-sm transition-all ${
                  checked ? 'text-gray-600 line-through opacity-50' : 'text-gray-300'
                }`}
              >
                {tarea.texto}
              </span>
            </li>
          )
        })}
      </ul>

      <div>
        <div className="mb-1.5 flex justify-between text-xs text-gray-500">
          <span>{done} de {total} tareas</span>
          <span className={pct === 100 ? 'text-green-400 font-semibold' : ''}>{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function ProgressPage() {
  const navigate = useNavigate()
  const [checks, setChecks] = useState(buildInitialChecks)

  function toggle(id) {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <PageShell>
      <SiteHeader />

      <main className="relative z-[1] flex-1 pb-28 pt-14">
        <Container>

          {/* Header */}
          <div className="mb-10">
            <h1 className="m-0 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Buen trabajo, {MOCK.nombre} 👋
            </h1>
            <p className="mt-2 text-base text-gray-400">
              Día {MOCK.dia_actual} de 30 · {MOCK.porcentaje_global}% completado
            </p>
          </div>

          {/* Cards de semanas */}
          <div className="mb-10 grid gap-5 md:grid-cols-2">
            {MOCK.plan.map(semana => (
              <WeekCard
                key={semana.semana}
                semana={semana}
                checks={checks}
                onToggle={toggle}
              />
            ))}
          </div>

          {/* Sección entrevistas */}
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-gray-800 bg-gray-900 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="m-0 text-xl font-bold text-white">
                Practica con IA 🎯
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Simula entrevistas técnicas con feedback inmediato.
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => navigate('/entrevistas')}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90"
              >
                Iniciar entrevista
              </button>
              <p className="text-xs text-gray-500">0 entrevistas realizadas</p>
              <Link
                to="/entrevistas"
                className="text-xs font-medium text-purple-400 hover:text-purple-300"
              >
                Ver historial →
              </Link>
            </div>
          </div>

        </Container>
      </main>
    </PageShell>
  )
}
