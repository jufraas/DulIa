export const MOCK_QUESTIONS = {
  React: [
    '¿Cuál es la diferencia entre useEffect y useLayoutEffect? Explica un caso de uso concreto para cada uno.',
    'Explica el concepto de "lifting state up". ¿Cuándo preferirías usar Context API o Zustand en lugar de elevar estado?',
    '¿Qué son los React Hooks? Nombra las 3 reglas principales que debes seguir al usarlos y por qué existen.',
    '¿Cómo detectarías y solucionarías re-renders innecesarios en un componente? Menciona al menos 3 técnicas.',
    'Describe el ciclo de vida de un componente funcional con Hooks: montaje, actualización y desmontaje.',
  ],
  Python: [
    'Explica la diferencia entre listas, tuplas, sets y diccionarios. ¿Cuándo usarías cada estructura y por qué?',
    '¿Qué son los decoradores en Python? Escribe mentalmente un decorador que mida el tiempo de ejecución de una función.',
    'Describe cómo manejarías excepciones. ¿Cuál es la diferencia entre except Exception y except BaseException? ¿Cuándo usar finally?',
    '¿Cómo funciona la gestión de memoria en Python? Explica el garbage collector, reference counting y el GIL.',
    '¿Qué es una list comprehension? ¿Cuándo la usarías vs un bucle for? ¿Qué es una generator expression y cuándo es más eficiente?',
  ],
  SQL: [
    '¿Cuál es la diferencia entre INNER JOIN, LEFT JOIN, RIGHT JOIN y FULL OUTER JOIN? Da un ejemplo real para cada uno.',
    'Explica los índices en bases de datos. ¿Cuándo mejoran el rendimiento y cuándo lo perjudican? ¿Qué es un índice compuesto?',
    '¿Qué son las window functions como ROW_NUMBER, RANK, DENSE_RANK y LAG/LEAD? Describe un caso de uso real.',
    'Escribe mentalmente una consulta para encontrar el segundo salario más alto en una tabla "empleados" (id, nombre, salario). Explica tu enfoque.',
    '¿Cuál es la diferencia entre WHERE y HAVING? ¿En qué orden se ejecutan las cláusulas SQL?',
  ],
  Excel: [
    '¿Cómo usarías VLOOKUP o INDEX/MATCH para cruzar datos entre dos tablas? ¿Por qué muchos prefieren INDEX/MATCH?',
    'Explica la diferencia entre referencia absoluta ($A$1), relativa (A1) y mixta ($A1 o A$1). ¿Cuándo necesitas cada tipo?',
    '¿Qué son las tablas dinámicas? Describe cómo analizarías ventas por región y mes. ¿Qué campos pondrías en filas, columnas y valores?',
    'Describe cómo usarías SUMIF, COUNTIF, AVERAGEIF y sus variantes con múltiples criterios. Da un ejemplo.',
    '¿Cómo protegerías datos sensibles en Excel? Menciona opciones de seguridad, validación de datos y auditoría de fórmulas.',
  ],
  'Power BI': [
    '¿Cuál es la diferencia entre medidas (measures) y columnas calculadas en DAX? ¿Cómo afectan el rendimiento?',
    'Explica el modelo estrella (star schema) y por qué es importante. ¿Cuál es la diferencia con un snowflake schema?',
    '¿Cómo usarías la función CALCULATE de DAX? Explica el contexto de filtro y cómo CALCULATE lo modifica.',
    'Describe el proceso de transformación de datos en Power Query. ¿Qué pasos realizarías al importar Excel con formato inconsistente?',
    '¿Cómo crearías un reporte con múltiples páginas que compartan filtros? Explica segmentadores sincronizados vs filtros de informe.',
  ],
}

export const MOCK_INTERVIEW_RESULT = {
  score: 74,
  nivel: 'Intermedio',
  skill: 'React',
  weakSkills: ['Estado Global', 'Performance', 'Testing'],
  feedback: [
    {
      pregunta: MOCK_QUESTIONS.React[0],
      score: 80,
      texto: 'Buena explicación de los conceptos básicos. Podrías profundizar en casos de uso de useLayoutEffect al medir el DOM antes de que el usuario vea el render, para evitar parpadeos visuales.',
    },
    {
      pregunta: MOCK_QUESTIONS.React[1],
      score: 72,
      texto: 'Comprendes bien el lifting state. Sin embargo, la comparación con Context API podría ser más precisa. Recuerda que Context tiene trade-offs de rendimiento y no siempre reemplaza el lifting.',
    },
    {
      pregunta: MOCK_QUESTIONS.React[2],
      score: 85,
      texto: 'Excelente conocimiento de las reglas de los Hooks. Mencionaste correctamente que no deben usarse en condicionales o bucles. Buen detalle sobre el eslint-plugin-react-hooks.',
    },
    {
      pregunta: MOCK_QUESTIONS.React[3],
      score: 60,
      texto: 'Conoces React.memo y useMemo, pero la respuesta carece de profundidad. Faltó mencionar useCallback, el React Profiler, la virtualización de listas y el impacto de closures en las dependencias.',
    },
    {
      pregunta: MOCK_QUESTIONS.React[4],
      score: 73,
      texto: 'Buen entendimiento general. Profundiza en el cleanup de effects para evitar memory leaks y en cómo las dependencias del array de useEffect determinan cuándo se re-ejecuta el efecto.',
    },
  ],
}

export const MOCK_HISTORY = [
  { id: 'h1', skill: 'React', score: 82, fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'h2', skill: 'SQL', score: 65, fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'h3', skill: 'Python', score: 71, fecha: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'h4', skill: 'Excel', score: 58, fecha: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
]
