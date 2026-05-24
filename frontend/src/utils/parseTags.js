/** @param {string | undefined | null} value */
export function parseTags(value) {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** @param {string[]} tags */
export function tagsToString(tags) {
  return tags.join(', ')
}
