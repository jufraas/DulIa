import { buildStageProgress, INTERVIEW_V2_STAGES } from '../mocks/mockInterviewV2.js'

export const STAGE_LABELS = {
  rapport: 'Rapport',
  tecnica: 'Técnica',
  behavioral: 'Behavioral',
  cierre: 'Cierre',
  finalizada: 'Finalizada',
}

/** @param {string} stage */
export function stageLabel(stage) {
  return STAGE_LABELS[stage] ?? stage
}

/**
 * @param {string} currentStage
 * @param {string[]} [completedStages]
 */
export function mapStageProgress(currentStage, completedStages = []) {
  return buildStageProgress(currentStage, completedStages)
}

/**
 * @param {import('../mocks/mockInterviewV2').InterviewSummaryV2} summary
 * @param {string} [skill]
 */
export function mapSummaryToDisplay(summary, skill = 'React') {
  return {
    globalScore: summary.global_score,
    skill,
    weakSkills: summary.weak_skills ?? [],
    stages: (summary.stages ?? []).map((s) => ({
      stage: s.stage,
      label: stageLabel(s.stage),
      score: s.score,
      strengths: s.strengths ?? [],
      gaps: s.gaps ?? [],
      keyMoments: s.key_moments ?? [],
    })),
    feedbackGeneral: summary.feedback_general ?? '',
    proximosPasos: summary.proximos_pasos ?? [],
  }
}

/**
 * @param {Array<Record<string, unknown>>} items
 */
export function mapV2HistoryToDisplay(items) {
  return (items ?? []).map((item) => ({
    id: String(item.id ?? ''),
    skill: String(item.target_skill ?? item.skill ?? ''),
    score: Number(item.global_score ?? item.score ?? 0),
    fecha: String(item.completed_at ?? item.finished_at ?? item.created_at ?? ''),
    role: item.target_role != null ? String(item.target_role) : item.role != null ? String(item.role) : null,
    version: Number(item.version ?? 2),
  }))
}

/**
 * Convierte turns API → messages UI.
 * @param {Array<{ role?: string, text?: string, stage?: string, t?: string }>} turns
 */
export function turnsToMessages(turns) {
  return (turns ?? []).map((t) => ({
    role: t.role === 'candidate' ? 'candidate' : 'interviewer',
    text: String(t.text ?? ''),
    stage: String(t.stage ?? 'rapport'),
    t: String(t.t ?? new Date().toISOString()),
  }))
}

export { INTERVIEW_V2_STAGES }
