/**
 * @param {string} mensaje
 * @returns {import('../store/useProfileStore').CoachChatResponse}
 */
export function mockCoachChatResponse(mensaje) {
  const snippet = mensaje.trim().slice(0, 80)
  return {
    respuesta:
      `¡Buena pregunta! Para «${snippet}» te sugiero: fortalecer una habilidad técnica esta semana, ` +
      'actualizar tu CV con logros medibles y filtrar vacantes verdes en tu ciudad. ' +
      'El mercado local está activo en tecnología y servicios.',
    sugerencias_rapidas: [
      'Ver vacantes recomendadas',
      'Explorar termómetro',
      'Agregar habilidad',
    ],
  }
}
