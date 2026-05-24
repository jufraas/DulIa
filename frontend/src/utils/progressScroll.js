/**
 * @param {import('../mocks/mockProgress').ProgressTask} task
 */
export function getTaskScrollTargetId(task) {
  if (task.phase === '30') return `timeline-task-${task.id}`
  return `timeline-phase-${task.phase}`
}

/**
 * @param {string} targetId
 * @param {{ behavior?: ScrollBehavior, block?: ScrollLogicalPosition }} [options]
 */
export function scrollToProgressTarget(targetId, options = {}) {
  const { behavior = 'smooth', block = 'center' } = options
  const el = document.getElementById(targetId)
  if (!el) return false
  el.scrollIntoView({ behavior, block })
  return true
}

/**
 * @param {import('../mocks/mockProgress').ProgressTask} task
 */
export function scrollToProgressTask(task) {
  return scrollToProgressTarget(getTaskScrollTargetId(task))
}
