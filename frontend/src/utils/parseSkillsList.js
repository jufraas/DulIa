/** @param {string | undefined} skills */
export function parseSkillsList(skills) {
  if (!skills) return []
  return skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}
