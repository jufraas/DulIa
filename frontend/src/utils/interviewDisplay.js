/** @param {number} score */
export function scoreToNivel(score) {
  if (score >= 80) return 'Avanzado'
  if (score >= 60) return 'Intermedio'
  return 'Básico'
}

/**
 * Adapta resultado API/mock store → forma UI de Jufra (InterviewResults).
 * @param {import('../mocks/mockInterview').InterviewResult} result
 */
export function mapInterviewResultToDisplay(result) {
  return {
    score: result.score,
    nivel: scoreToNivel(result.score),
    skill: result.skill,
    weakSkills: result.weak_skills ?? [],
    feedback: (result.feedback ?? []).map((item) => ({
      pregunta: item.question,
      score: item.score,
      texto: item.feedback,
    })),
  }
}

/**
 * @param {import('../mocks/mockInterview').InterviewHistoryItem[]} items
 */
export function mapHistoryToDisplay(items) {
  return (items ?? []).map((item) => ({
    id: item.id,
    skill: item.skill,
    score: item.score,
    fecha: item.finished_at,
  }))
}
