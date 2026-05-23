/**
 * Construye un SavedProfile local cuando POST /profile no responde.
 * Shape alineado a ProfileOut del backend (_perfil_out_mock).
 *
 * @param {import('../utils/buildProfilePayload').ProfileApiPayload} payload
 * @returns {import('../store/useProfileStore').SavedProfile}
 */
export function buildMockProfileFromPayload(payload) {
  return {
    id: `mock-${payload.session_id.slice(0, 8)}`,
    session_id: payload.session_id,
    nombre: payload.nombre?.trim() || 'Usuario DulIA',
    edad: payload.edad,
    ciudad: payload.ciudad?.trim() || 'Barranquilla',
    departamento: payload.departamento,
    nivel_educativo: payload.nivel_educativo,
    carrera: payload.carrera,
    experiencia_anios: payload.experiencia_anios ?? 0,
    habilidades: (payload.habilidades ?? []).map((h) => h.toLowerCase()),
    sectores_interes: (payload.sectores_interes ?? []).map((s) => s.toLowerCase()),
    modalidad: payload.modalidad,
    created_at: new Date().toISOString(),
  }
}
