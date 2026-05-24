import { CheckCircle2, ListTodo } from 'lucide-react'
import { filterProgressTasks, useProgressStore } from '../../store/useProgressStore'

const FILTERS = [
  { id: /** @type {const} */ ('week'), label: 'Esta semana' },
  { id: /** @type {const} */ ('pending'), label: 'Pendientes' },
  { id: /** @type {const} */ ('completed'), label: 'Completadas' },
]

/** Panel lateral: filtros + lista compacta; click → scroll al timeline (M2.7–M2.8). */
export default function TaskList() {
  const progress = useProgressStore((s) => s.progress)
  const taskFilter = useProgressStore((s) => s.taskFilter)
  const highlightedTaskId = useProgressStore((s) => s.highlightedTaskId)
  const setTaskFilter = useProgressStore((s) => s.setTaskFilter)
  const requestTaskFocus = useProgressStore((s) => s.requestTaskFocus)

  if (!progress) return null

  const filteredTasks = filterProgressTasks(
    progress.tasks,
    taskFilter,
    progress.current_day,
  )

  return (
    <aside className="task-list card-dl flex flex-col p-0" aria-label="Lista de tareas">
      <div className="task-list__header shrink-0 border-b border-[rgba(168,85,247,0.12)] px-5 py-4">
        <div className="eyebrow-dl">
          <ListTodo className="h-3.5 w-3.5" aria-hidden />
          Tus tareas
        </div>
        <p className="mt-1 text-xs text-[color:var(--fg-3)]">
          Toca una tarea para verla en el plan
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setTaskFilter(filter.id)}
              className="rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all duration-200"
              style={
                taskFilter === filter.id
                  ? {
                      background: 'var(--grad-brand)',
                      color: '#fff',
                    }
                  : {
                      background: 'rgba(168,85,247,0.08)',
                      border: '1px solid rgba(168,85,247,0.25)',
                      color: 'var(--fg-2)',
                    }
              }
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="task-list__items m-0 list-none p-2">
        {filteredTasks.map((task) => {
          const locked = progress.phases.find((p) => p.phase === task.phase)?.locked
          const isHighlighted = highlightedTaskId === task.id

          return (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => requestTaskFocus(task)}
                className={`task-list__item${isHighlighted ? ' task-list__item--active' : ''}`}
              >
                <span className="task-list__item-body">
                  <span
                    className={`task-list__label${
                      task.completed ? ' task-list__label--done' : ''
                    }`}
                  >
                    {task.label}
                  </span>
                  <span className="task-list__meta">
                    Fase {task.phase}
                    {task.phase === '30' ? ` · Sem. ${task.week}` : ''}
                    {locked && !task.completed ? ' · Bloqueada' : ''}
                  </span>
                </span>
                {task.completed && (
                  <CheckCircle2
                    className="task-list__check h-4 w-4 shrink-0 text-[color:var(--success,#34d399)]"
                    aria-hidden
                  />
                )}
              </button>
            </li>
          )
        })}
        {filteredTasks.length === 0 && (
          <li className="task-list__empty">No hay tareas en este filtro.</li>
        )}
      </ul>
    </aside>
  )
}
