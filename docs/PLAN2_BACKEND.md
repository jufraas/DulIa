# PLAN 2 BACKEND — Mejoras Avanzadas de IA y Datos

> **Estado:** Fases 1 y 3 completas (análisis, plan, gráficas). Fase 2 parcial (coach function calling). Deploy pospuesto.
> **Creado:** 2026-05-23  
> **Dueño:** Backend Team  
> **Dependencias:** Frontend (gráficas), BD con datos reales

## Resumen Ejecutivo

Este plan eleva DulIA de "demo funcional" a "demo impresionante" mediante:

1. **Enriquecimiento IA del perfil** — Análisis profundo con insights accionables
2. **Plan de acción personalizado** — Roadmap de 30-60-90 días generado por IA
3. **Function Calling** — Coach que interactúa con datos reales de la BD
4. **Datos enriquecidos para gráficas** — Radar de habilidades y timeline de evolución

**No incluye:** Memoria conversacional persistente (se hidrata con perfil + contexto).

---

## FASE 1 — Análisis de Perfil y Plan de Acción con IA

### 1.1 Servicio: Análisis de Perfil Enriquecido

**Objetivo:** Generar insights profundos sobre el perfil del usuario usando IA.

**Nueva tabla: `profile_analysis`**
```sql
CREATE TABLE profile_analysis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text REFERENCES profiles(session_id),
    fortalezas jsonb,           -- [{"area": "habilidades_tecnicas", "descripcion": "...", "nivel": "alto"}]
    debilidades jsonb,          -- [{"area": "experiencia", "descripcion": "...", "impacto": "medio"}]
    gaps_mercado jsonb,         -- [{"habilidad": "python", "demanda": "alta", "tu_nivel": "bajo"}]
    oportunidades jsonb,        -- [{"sector": "tecnologia", "razon": "...", "potencial": "alto"}]
    nivel_preparacion jsonb,    -- {"overall": 72, "descripcion": "Preparado para roles junior"}
    recomendaciones jsonb,        -- ["Enfocate en X", "Considera Y"]
    raw_gemini_response text,   -- Para debugging
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

**Servicio: `app/services/profile_analysis_service.py`**

**Prompt: `PROFILE_ANALYSIS`** (v1.0)
```
Eres un experto en desarrollo de carrera y análisis de perfiles profesionales para el mercado laboral colombiano.

Analiza el siguiente perfil de un joven (18-28 años) del Caribe colombiano y genera un análisis estructurado.

PERFIL DEL USUARIO:
{perfil_json}

CONTEXTO DEL MERCADO:
- Top sectores en su ciudad: {top_sectores}
- Vacantes disponibles: {total_vacantes}
- Salario promedio en su nivel: {salario_promedio}

Genera un análisis en JSON con esta estructura exacta:

{
  "fortalezas": [
    {
      "area": "habilidades_tecnicas|experiencia|educacion|ubicacion|soft_skills",
      "descripcion": "Descripción específica de la fortaleza",
      "nivel": "alto|medio|bajo"
    }
  ],
  "debilidades": [
    {
      "area": "...",
      "descripcion": "...",
      "impacto": "alto|medio|bajo"
    }
  ],
  "gaps_mercado": [
    {
      "habilidad": "nombre de la habilidad",
      "demanda": "alta|media|baja",
      "tu_nivel": "alto|medio|bajo|inexistente",
      "brecha": "descripción de la brecha"
    }
  ],
  "oportunidades": [
    {
      "sector": "nombre del sector",
      "razon": "por qué encaja con su perfil",
      "potencial": "alto|medio|bajo",
      "accion_inmediata": "qué hacer ahora"
    }
  ],
  "nivel_preparacion": {
    "overall": 0-100,
    "descripcion": "narrativa sobre su preparación",
    "comparativa": "donde se sitúa vs el mercado"
  },
  "recomendaciones": [
    "Recomendación específica y accionable 1",
    "Recomendación específica y accionable 2",
    "Recomendación específica y accionable 3"
  ]
}

REGLAS:
1. Sé específico, no genérico. Menciona habilidades y sectores concretos del perfil.
2. Prioriza el contexto colombiano y del Caribe.
3. Las recomendaciones deben ser accionables: "Haz X curso" no "Considera mejorar".
4. El nivel_preparacion.overall debe calcularse honestamente (no siempre 80+).
5. Máximo 3-4 items por categoría.
```

**Endpoint: `POST /api/profile/{session_id}/analyze`**
- Genera o regenera el análisis
- Guarda en `profile_analysis`
- Devuelve el análisis completo

**Response 200:**
```json
{
  "session_id": "...",
  "analisis": {
    "fortalezas": [...],
    "debilidades": [...],
    "gaps_mercado": [...],
    "oportunidades": [...],
    "nivel_preparacion": {...},
    "recomendaciones": [...]
  },
  "generado_en": "2026-05-23T10:00:00Z"
}
```

### 1.2 Servicio: Plan de Acción Personalizado

**Objetivo:** Generar un roadmap de 30-60-90 días específico para el usuario.

**Nueva tabla: `action_plans`**
```sql
CREATE TABLE action_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text REFERENCES profiles(session_id),
    resumen_ejecutivo text,      -- Descripción general del plan
    fase_30 jsonb,               -- {"objetivo": "...", "acciones": [...], "metricas": [...]}
    fase_60 jsonb,               -- Lo mismo
    fase_90 jsonb,               -- Lo mismo
    recursos_recomendados jsonb, -- [{"tipo": "curso|certificacion|libro|practica", "nombre": "...", "url": "..."}]
    milestones jsonb,            -- [{"fecha": "...", "logro": "..."}]
    raw_gemini_response text,
    created_at timestamptz DEFAULT now()
);
```

**Servicio: `app/services/action_plan_service.py`**

**Prompt: `ACTION_PLAN_GENERATOR`** (v1.0)
```
Eres un mentor de carrera experto en el mercado laboral colombiano.

Crea un plan de acción personalizado de 30-60-90 días para este joven profesional.

PERFIL DEL USUARIO:
{perfil_json}

ANÁLISIS PREVIO:
{analisis_json}

VACANTES RECOMENDADAS (top 5):
{vacantes_json}

CONTEXTO DEL MERCADO:
{market_context_json}

Genera un plan en JSON con esta estructura:

{
  "resumen_ejecutivo": "2-3 párrafos sobre el plan general y por qué estos pasos",
  "fase_30": {
    "titulo": "Fundamentos y Preparación",
    "objetivo": "Qué lograr en 30 días",
    "acciones": [
      {
        "semana": 1,
        "tarea": "Tarea específica",
        "duracion_estimada": "X horas",
        "recursos_necesarios": ["recurso 1", "recurso 2"],
        "como_verificar": "Cómo saber si lo logró"
      }
    ],
    "metricas": ["Métrica 1", "Métrica 2"]
  },
  "fase_60": {
    "titulo": "Aplicación y Visibilidad",
    "objetivo": "...",
    "acciones": [...],
    "metricas": [...]
  },
  "fase_90": {
    "titulo": "Consolidación y Oportunidades",
    "objetivo": "...",
    "acciones": [...],
    "metricas": [...]
  },
  "recursos_recomendados": [
    {
      "tipo": "curso|certificacion|libro|practica|comunidad",
      "nombre": "Nombre específico",
      "descripcion": "Por qué este recurso",
      "duracion": "X horas/semanas",
      "costo_aprox": "Gratis|$XX.XXX COP"
    }
  ],
  "milestones": [
    {"dia": 30, "logro": "CV actualizado con nuevas habilidades"},
    {"dia": 60, "logro": "Perfil optimizado y 10 postulaciones enviadas"},
    {"dia": 90, "logro": "Entrevistas programadas y habilidades reforzadas"}
  ]
}

REGLAS:
1. Cada acción debe ser específica y medible.
2. Adapta recursos al presupuesto (muchos gratis para jóvenes).
3. Considera su tiempo disponible (estudiante/empleado).
4. Prioriza habilidades de mayor demanda en su sector.
5. Incluye acciones de networking (comunidades, eventos).
```

**Endpoint: `POST /api/profile/{session_id}/action-plan`**
- Genera o regenera el plan
- Opcional: `?regenerate=true` para forzar regeneración

**Response 200:**
```json
{
  "session_id": "...",
  "plan": {
    "resumen_ejecutivo": "...",
    "fase_30": {...},
    "fase_60": {...},
    "fase_90": {...},
    "recursos_recomendados": [...],
    "milestones": [...]
  },
  "generado_en": "2026-05-23T10:00:00Z"
}
```

### 1.3 Actualizar Servicio de Perfil

**Modificar: `profile_service.py`**

Después de crear/guardar un perfil (`POST /api/profile`), llamar automáticamente:
1. `profile_analysis_service.analyze()`
2. `action_plan_service.generate()`

**Response mejorado de POST /api/profile:**
```json
{
  "id": "...",
  "session_id": "...",
  "nombre": "...",
  // ... campos existentes
  "analisis": {...},       // Incluido automáticamente
  "plan_accion": {...}     // Incluido automáticamente
}
```

**Nota:** En modo mock, generar análisis y plan simulados realistas.

---

## FASE 2 — Function Calling para el Coach

### 2.1 Arquitectura de Function Calling

**Objetivo:** El coach puede "actuar" invocando funciones reales del backend.

**Nueva estructura: `app/services/coach/`**
```
coach/
├── __init__.py
├── router.py              # Decide si usar función o responder directo
├── functions.py           # Definición de funciones disponibles
├── executor.py            # Ejecuta las funciones
└── prompts.py             # Prompts específicos para function calling
```

### 2.2 Funciones Disponibles

**Definición en `coach/functions.py`:**

```python
FUNCIONES_DISPONIBLES = [
    {
        "name": "buscar_vacantes_filtradas",
        "description": "Busca vacantes activas que coincidan con criterios específicos del usuario",
        "parameters": {
            "type": "object",
            "properties": {
                "habilidades": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Lista de habilidades requeridas (ej: ['python', 'excel'])"
                },
                "sector": {
                    "type": "string",
                    "description": "Sector laboral (ej: 'tecnologia', 'salud', 'comercial')"
                },
                "ciudad": {
                    "type": "string",
                    "description": "Ciudad específica (ej: 'Barranquilla')"
                },
                "salario_min": {
                    "type": "integer",
                    "description": "Salario mínimo aceptable en COP"
                },
                "modalidad": {
                    "type": "string",
                    "enum": ["presencial", "remoto", "hibrido"],
                    "description": "Modalidad de trabajo preferida"
                },
                "limit": {
                    "type": "integer",
                    "default": 5,
                    "description": "Número máximo de resultados"
                }
            }
        }
    },
    {
        "name": "explicar_score_match",
        "description": "Explica detalladamente por qué una vacante es buena o mala para el usuario",
        "parameters": {
            "type": "object",
            "properties": {
                "job_id": {
                    "type": "string",
                    "description": "ID de la vacante a analizar"
                }
            },
            "required": ["job_id"]
        }
    },
    {
        "name": "comparar_vacantes",
        "description": "Compara 2-3 vacantes lado a lado para ayudar a decidir",
        "parameters": {
            "type": "object",
            "properties": {
                "job_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 2,
                    "maxItems": 3,
                    "description": "IDs de las vacantes a comparar"
                }
            },
            "required": ["job_ids"]
        }
    },
    {
        "name": "recomendar_aprendizaje",
        "description": "Sugiere recursos específicos para aprender una habilidad",
        "parameters": {
            "type": "object",
            "properties": {
                "habilidad": {
                    "type": "string",
                    "description": "Nombre de la habilidad (ej: 'python', 'inglés técnico')"
                },
                "nivel_actual": {
                    "type": "string",
                    "enum": ["principiante", "intermedio", "avanzado"],
                    "description": "Nivel actual del usuario"
                },
                "presupuesto": {
                    "type": "string",
                    "enum": ["gratis", "bajo", "medio"],
                    "default": "gratis",
                    "description": "Presupuesto disponible"
                }
            },
            "required": ["habilidad"]
        }
    },
    {
        "name": "analizar_mercado_sector",
        "description": "Proporciona análisis del mercado laboral para un sector específico",
        "parameters": {
            "type": "object",
            "properties": {
                "sector": {
                    "type": "string",
                    "description": "Sector a analizar"
                },
                "ciudad": {
                    "type": "string",
                    "description": "Ciudad específica (opcional)"
                }
            },
            "required": ["sector"]
        }
    },
    {
        "name": "obtener_plan_accion",
        "description": "Recupera el plan de acción personalizado del usuario",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    }
]
```

### 2.3 Implementación del Router

**Archivo: `coach/router.py`**

```python
async def procesar_mensaje(mensaje: str, session_id: str, perfil: dict) -> dict:
    """
    Decide si el mensaje requiere llamar a una función o respuesta directa.
    """
    # Prompt al router
    router_prompt = f"""
    Analiza este mensaje del usuario y decide si requiere llamar a una función del sistema.
    
    MENSAJE: "{mensaje}"
    
    CONTEXTO DEL USUARIO:
    - Perfil: {perfil['nombre']}, {perfil['ciudad']}
    - Habilidades: {', '.join(perfil.get('habilidades', []))}
    - Sectores de interés: {', '.join(perfil.get('sectores_interes', []))}
    
    FUNCIONES DISPONIBLES:
    1. buscar_vacantes_filtradas - Cuando pregunta por vacantes, trabajos, empleos
    2. explicar_score_match - Cuando pregunta "por qué esta vacante", "qué me falta"
    3. comparar_vacantes - Cuando pide comparar, decidir entre opciones
    4. recomendar_aprendizaje - Cuando pregunta qué aprender, cursos, habilidades
    5. analizar_mercado_sector - Cuando pregunta por el mercado, salarios, tendencias
    6. obtener_plan_accion - Cuando pregunta por su plan, próximos pasos
    
    Responde ÚNICAMENTE con JSON:
    {{
      "requiere_funcion": true|false,
      "funcion": "nombre_de_la_funcion",
      "parametros": {{...}},
      "razonamiento": "por qué elegiste esto"
    }}
    """
    
    # Llamar a Gemini para decidir
    decision = await gemini_decision(router_prompt)
    
    if decision["requiere_funcion"]:
        # Ejecutar función
        resultado = await ejecutar_funcion(decision["funcion"], decision["parametros"], session_id)
        
        # Construir respuesta final con el resultado
        return await generar_respuesta_con_resultado(mensaje, resultado, perfil)
    else:
        # Respuesta directa (flujo actual)
        return await responder_directo(mensaje, perfil)
```

### 2.4 Prompt Mejorado del Coach

**Nuevo prompt: `CAREER_COACH_WITH_TOOLS`** (v2.0)

```
Eres DulIA, coach de carrera con IA para jóvenes colombianos (18-28 años) del Caribe.

Tu superpoder: tienes acceso a datos REALES del mercado laboral y el perfil del usuario.

PERFIL DEL USUARIO:
{perfil_json}

CONTEXTO ACTUAL:
- Hoy es {fecha_actual}
- Top sectores en su ciudad: {top_sectores}
- Tiene {num_vacantes_recomendadas} vacantes recomendadas esperando

HISTORIAL RECIENTE (últimos 3 mensajes):
{historial_json}

INSTRUCCIONES:
1. Tono: cercano, directo, sin paternalismo. Usa "tú", español colombiano.
2. Respuestas: máximo 3 párrafos cortos + bullet points si aplica.
3. SIEMPRE basa tus consejos en datos reales que tienes disponibles.
4. Si mencionas vacantes, cita el título y empresa específicos.
5. Si el usuario pregunta por algo que requiere datos del sistema, indica que puedes buscarlo.
6. Cierra con 2-3 sugerencias rápidas específicas (chips para el frontend).

FORMATO DE RESPUESTA (JSON):
{
  "respuesta": "Texto de tu respuesta",
  "sugerencias_rapidas": ["Acción específica 1", "Acción específica 2"],
  "contexto_utilizado": "qué datos usaste de los disponibles"
}
```

### 2.5 Actualizar Endpoint del Coach

**Mantener: `POST /api/coach/chat`**

**Mejoras:**
- Agregar `historial` opcional en el request
- Incluir `acciones_disponibles` en la respuesta (para que el front muestre botones)

**Request:**
```json
{
  "session_id": "...",
  "mensaje": "...",
  "historial": [  // Opcional, últimos 3-5 mensajes
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

**Response mejorado:**
```json
{
  "respuesta": "...",
  "sugerencias_rapidas": ["Ver vacantes de tecnología", "Comparar opciones"],
  "acciones_disponibles": ["buscar_vacantes", "recomendar_aprendizaje"],
  "funcion_ejecutada": "buscar_vacantes_filtradas",  // Si aplica
  "datos_adicionales": {...}  // Resultado de la función si se ejecutó
}
```

---

## FASE 3 — Datos para Gráficas

### 3.1 Gráfica 1: Radar de Perfil vs Mercado

**Nuevo endpoint: `GET /api/profile/{session_id}/radar-data`**

**Objetivo:** Datos para gráfica radar mostrando 5 dimensiones:
1. Habilidades técnicas
2. Experiencia laboral
3. Educación formal
4. Ubicación/Modalidad
5. Preparación/Madurez profesional

**Lógica de cálculo:**
```python
def calcular_dimensiones_radar(perfil, vacantes_recomendadas, market_data):
    """
    Calcula scores 0-100 para 5 dimensiones comparando perfil vs mercado.
    """
    
    # Dimensión 1: Habilidades Técnicas
    habilidades_usuario = set(perfil.get('habilidades', []))
    habilidades_demandadas = extraer_habilidades_top(vacantes_recomendadas)
    match_habilidades = len(habilidades_usuario & habilidades_demandadas)
    total_demandadas = len(habilidades_demandadas)
    score_habilidades = (match_habilidades / total_demandadas * 100) if total_demandadas > 0 else 50
    
    # Dimensión 2: Experiencia
    exp_usuario = perfil.get('experiencia_anios', 0)
    exp_requerida_promedio = calcular_exp_promedio_requerida(vacantes_recomendadas)
    score_experiencia = min(100, (exp_usuario / exp_requerida_promedio * 100)) if exp_requerida_promedio > 0 else 70
    
    # Dimensión 3: Educación
    niveles = {'bachiller': 25, 'tecnico': 50, 'tecnologo': 60, 'universitario': 80, 'posgrado': 100}
    nivel_usuario = niveles.get(perfil.get('nivel_educativo'), 50)
    nivel_requerido_promedio = calcular_nivel_educativo_promedio(vacantes_recomendadas)
    score_educacion = min(100, (nivel_usuario / nivel_requerido_promedio * 100)) if nivel_requerido_promedio > 0 else 60
    
    # Dimensión 4: Ubicación/Modalidad
    ciudad_match = perfil.get('ciudad') == market_data.get('ciudad_principal')
    modalidad_flexible = perfil.get('modalidad') in ['hibrido', 'remoto', 'indiferente']
    score_ubicacion = 90 if ciudad_match else (60 if modalidad_flexible else 40)
    
    # Dimensión 5: Preparación/Madurez (análisis de IA)
    if hasattr(perfil, 'analisis'):
        score_preparacion = perfil['analisis'].get('nivel_preparacion', {}).get('overall', 65)
    else:
        score_preparacion = 65  # Default
    
    return {
        "usuario": {
            "habilidades_tecnicas": round(score_habilidades),
            "experiencia": round(score_experiencia),
            "educacion": round(score_educacion),
            "ubicacion_modalidad": round(score_ubicacion),
            "preparacion": round(score_preparacion)
        },
        "mercado_promedio": {
            "habilidades_tecnicas": 70,
            "experiencia": 60,
            "educacion": 75,
            "ubicacion_modalidad": 80,
            "preparacion": 65
        },
        "descripcion_dimensiones": {
            "habilidades_tecnicas": "Alineación de tus skills con la demanda actual",
            "experiencia": "Tu experiencia vs lo requerido en el mercado",
            "educacion": "Nivel educativo vs estándares del sector",
            "ubicacion_modalidad": "Ventaja geográfica y flexibilidad laboral",
            "preparacion": "Madurez profesional basada en tu perfil completo"
        }
    }
```

**Response 200:**
```json
{
  "session_id": "...",
  "radar": {
    "usuario": {
      "habilidades_tecnicas": 75,
      "experiencia": 60,
      "educacion": 80,
      "ubicacion_modalidad": 90,
      "preparacion": 72
    },
    "mercado_promedio": {
      "habilidades_tecnicas": 70,
      "experiencia": 60,
      "educacion": 75,
      "ubicacion_modalidad": 80,
      "preparacion": 65
    },
    "descripcion_dimensiones": {...}
  }
}
```

### 3.2 Gráfica 4: Timeline de Evolución Esperada

**Nuevo endpoint: `GET /api/profile/{session_id}/timeline-data`**

**Objetivo:** Visualizar los milestones del plan de acción en una línea de tiempo.

**Response 200:**
```json
{
  "session_id": "...",
  "timeline": {
    "inicio": "2026-05-23",
    "fases": [
      {
        "dia": 0,
        "tipo": "inicio",
        "titulo": "Hoy",
        "descripcion": "Comienzas tu plan de acción",
        "metricas": {
          "score_promedio": 65,
          "vacantes_match": 3,
          "habilidades": 5
        }
      },
      {
        "dia": 30,
        "tipo": "milestone",
        "titulo": "Día 30: Fundamentos",
        "descripcion": "CV actualizado y habilidades base reforzadas",
        "metricas_esperadas": {
          "score_promedio": 72,
          "vacantes_match": 8,
          "habilidades": 7
        },
        "acciones_completadas": [
          "Curso de Excel avanzado completado",
          "Perfil de LinkedIn optimizado",
          "CV actualizado con proyecto personal"
        ]
      },
      {
        "dia": 60,
        "tipo": "milestone",
        "titulo": "Día 60: Aplicación",
        "descripcion": "Perfil optimizado y postulaciones activas",
        "metricas_esperadas": {
          "score_promedio": 78,
          "vacantes_match": 12,
          "habilidades": 9
        },
        "acciones_completadas": [
          "Portfolio/GitHub con 2 proyectos",
          "10 postulaciones enviadas",
          "Networking en 2 eventos"
        ]
      },
      {
        "dia": 90,
        "tipo": "milestone",
        "titulo": "Día 90: Consolidación",
        "descripcion": "Entrevistas programadas y habilidades consolidadas",
        "metricas_esperadas": {
          "score_promedio": 85,
          "vacantes_match": 15,
          "habilidades": 11
        },
        "acciones_completadas": [
          "Certificación en Python completada",
          "3 entrevistas técnicas realizadas",
          "Ofertas en negociación"
        ]
      }
    ],
    "proyeccion": {
      "descripcion": "Con este plan, esperamos aumentar tu score de compatibilidad de 65 a 85 en 90 días",
      "tasa_crecimiento_semanal": 2.3
    }
  }
}
```

**Nota:** Si no existe plan de acción, devolver 404 con mensaje "Genera un plan de acción primero".

---

## Checklist de Implementación

### FASE 1
- [ ] Crear tabla `profile_analysis` en Supabase
- [ ] Crear servicio `profile_analysis_service.py`
- [ ] Crear endpoint `POST /api/profile/{session_id}/analyze`
- [ ] Crear tabla `action_plans` en Supabase
- [ ] Crear servicio `action_plan_service.py`
- [ ] Crear endpoint `POST /api/profile/{session_id}/action-plan`
- [ ] Modificar `profile_service.py` para generar análisis+plan automáticamente
- [x] Actualizar `PROMPTS.md` con prompts `PROFILE_ANALYSIS` y `ACTION_PLAN_GENERATOR`
- [x] Actualizar `ENDPOINTS.md` con nuevos endpoints
- [ ] Tests: Verificar que el análisis es específico y no genérico

### FASE 2
- [ ] Crear estructura `app/services/coach/`
- [ ] Implementar `coach/functions.py` con las 6 funciones
- [ ] Implementar `coach/router.py` para decisión de función vs respuesta directa
- [ ] Implementar `coach/executor.py` para ejecutar funciones
- [ ] Crear prompt `CAREER_COACH_WITH_TOOLS` v2.0
- [ ] Actualizar `coach_service.py` para usar el router
- [ ] Actualizar endpoint `POST /api/coach/chat` con nuevos campos
- [ ] Actualizar `PROMPTS.md` con nuevo prompt del coach
- [ ] Actualizar `ENDPOINTS.md` con mejoras al endpoint
- [ ] Tests: Verificar que el coach puede buscar vacantes y explicar matches

### FASE 3
- [x] Crear endpoint `GET /api/profile/{session_id}/radar-data`
- [x] Implementar lógica de cálculo de 5 dimensiones (`charts_service.py`)
- [x] Crear endpoint `GET /api/profile/{session_id}/timeline-data`
- [x] Integrar con tabla `action_plans` para milestones
- [x] Actualizar `ENDPOINTS.md` con endpoints de gráficas
- [x] Crear `FRONTEND_INTEGRATION.md` (handoff frontend)
- [x] Router registrado en `main.py`
- [ ] Tests manuales en `/docs` con perfil distinto (verificar radar no siempre igual)

### Integración y Documentación
- [ ] Crear este archivo `PLAN2_BACKEND.md`
- [x] Actualizar `AI_CONTEXT.md` con nuevas capacidades
- [x] Actualizar `PROJECT_STATE.md` con estado del Plan 2
- [x] Coordinar con frontend — ver `FRONTEND_INTEGRATION.md`
- [ ] Deploy y pruebas end-to-end (pospuesto)

---

## Notas para el Frontend

### Datos para Gráfica Radar (recharts)
```javascript
const radarData = [
  { subject: 'Habilidades Técnicas', A: 75, B: 70, fullMark: 100 },
  { subject: 'Experiencia', A: 60, B: 60, fullMark: 100 },
  { subject: 'Educación', A: 80, B: 75, fullMark: 100 },
  { subject: 'Ubicación/Modalidad', A: 90, B: 80, fullMark: 100 },
  { subject: 'Preparación', A: 72, B: 65, fullMark: 100 },
];
// A = usuario, B = mercado promedio
```

### Datos para Timeline
Usar librería de timeline o implementar custom con divs posicionados.

---

## Estimación de Tiempo

| Fase | Tiempo Est. | Complejidad |
|------|-------------|-------------|
| FASE 1 — Análisis y Plan | 3-4h | Media |
| FASE 2 — Function Calling | 4-5h | Alta |
| FASE 3 — Datos Gráficas | 2h | Baja |
| Testing & Integración | 2h | Media |
| **Total** | **11-13h** | |

**Recomendación:** Si el tiempo es limitado, priorizar:
1. FASE 1 (impacto visual máximo)
2. FASE 3 (gráficas son impresionantes)
3. FASE 2 (mejora UX pero más complejo)
