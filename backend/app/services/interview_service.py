"""Simulador de entrevistas: pool con fuentes reales + personalización Gemini."""

from __future__ import annotations

import json
import os
import random
import uuid
from collections import Counter
from datetime import datetime, timezone
from typing import Any

from app.db.gemini import get_gemini_model
from app.db.supabase import get_supabase
from app.models.interview_models import (
    InterviewAnswerResponse,
    InterviewFinishResponse,
    InterviewHistoryItem,
    InterviewQuestion,
    InterviewStartResponse,
)
from app.utils.llm_json import parse_json_from_llm
from app.utils.logger import get_logger
from app.utils.prompts import get_prompt

logger = get_logger(__name__)

USE_MOCK = os.getenv("USE_MOCK_DATA", "false").lower() == "true"

VALID_SECTORS = {
    "tecnologia",
    "marketing",
    "ventas",
    "contabilidad",
    "servicio_cliente",
    "operaciones",
    "administracion",
    "salud",
    "educacion",
    "general",
}

SECTOR_ALIASES = {
    "tech": "tecnologia",
    "tecnología": "tecnologia",
    "technology": "tecnologia",
    "it": "tecnologia",
    "software": "tecnologia",
    "atencion al cliente": "servicio_cliente",
    "atención al cliente": "servicio_cliente",
    "servicio al cliente": "servicio_cliente",
    "customer service": "servicio_cliente",
    "contable": "contabilidad",
    "accounting": "contabilidad",
    "sales": "ventas",
    "administración": "administracion",
    "admin": "administracion",
    "health": "salud",
    "education": "educacion",
    "educación": "educacion",
}

ROLE_SECTOR_HINTS = {
    "desarrollador": "tecnologia",
    "programador": "tecnologia",
    "analista de datos": "tecnologia",
    "contador": "contabilidad",
    "auxiliar contable": "contabilidad",
    "vendedor": "ventas",
    "asesor comercial": "ventas",
    "community manager": "marketing",
    "cajero": "servicio_cliente",
    "call center": "servicio_cliente",
    "enfermer": "salud",
    "docente": "educacion",
}

# Entrevistas pre-generadas para demo sin Gemini (B4.5)
MOCK_INTERVIEW_CACHE: dict[str, list[dict[str, Any]]] = {
    "python": [
        {
            "texto": "Cuéntame sobre un proyecto donde hayas usado Python. ¿Qué problema resolviste y qué aprendiste?",
            "tipo": "tecnica",
            "skill": "Python",
            "keywords_esperadas": ["proyecto", "código", "resultado", "aprendizaje"],
            "rubrica": {
                "keywords_clave": ["proyecto", "python", "resultado"],
                "puntos_fuertes_esperados": ["Ejemplo concreto", "Menciona desafío y solución"],
                "red_flags": ["Respuesta muy vaga", "No menciona código propio"],
            },
        },
        {
            "texto": "¿Cómo explicarías qué es una lista versus un diccionario en Python a alguien que no programa?",
            "tipo": "tecnica",
            "skill": "Python",
            "keywords_esperadas": ["lista", "diccionario", "clave", "ejemplo"],
            "rubrica": {
                "keywords_clave": ["lista", "diccionario", "estructura"],
                "puntos_fuertes_esperados": ["Analogía clara", "Ejemplo simple"],
                "red_flags": ["Solo define sin ejemplo"],
            },
        },
        {
            "texto": "Si encuentras un error en tu script de Python a medianoche antes de una entrega, ¿qué pasos seguirías?",
            "tipo": "situacional",
            "skill": "Python",
            "keywords_esperadas": ["error", "debug", "documentación", "pedir ayuda"],
            "rubrica": {
                "keywords_clave": ["leer error", "probar", "documentación"],
                "puntos_fuertes_esperados": ["Proceso ordenado", "Menciona no paniquear"],
                "red_flags": ["Entregar sin revisar"],
            },
        },
        {
            "texto": "Descríbeme una situación donde trabajaste en equipo para cumplir una fecha límite.",
            "tipo": "behavioral",
            "skill": "trabajo en equipo",
            "keywords_esperadas": ["equipo", "fecha", "rol", "resultado"],
            "rubrica": {
                "keywords_clave": ["colaboración", "plazo", "comunicación"],
                "puntos_fuertes_esperados": ["Rol propio claro", "Resultado medible"],
                "red_flags": ["Culpa solo al equipo"],
            },
        },
        {
            "texto": "¿Por qué quieres trabajar en un rol donde uses Python y qué harías en tus primeros 30 días?",
            "tipo": "behavioral",
            "skill": "Python",
            "keywords_esperadas": ["motivación", "aprendizaje", "plan", "30 días"],
            "rubrica": {
                "keywords_clave": ["motivación", "plan", "aprendizaje"],
                "puntos_fuertes_esperados": ["Motivación genuina", "Plan concreto"],
                "red_flags": ["Solo menciona el salario"],
            },
        },
    ],
    "excel": [
        {
            "texto": "¿Cómo usarías Excel para organizar ventas mensuales de una tienda en Barranquilla?",
            "tipo": "tecnica",
            "skill": "Excel",
            "keywords_esperadas": ["tabla", "filtro", "suma", "gráfico"],
            "rubrica": {
                "keywords_clave": ["tabla", "SUMA", "filtro"],
                "puntos_fuertes_esperados": ["Menciona tablas o filtros", "Resultado visual"],
                "red_flags": ["No da pasos concretos"],
            },
        },
        {
            "texto": "Explícame para qué sirve BUSCARV (VLOOKUP) y pon un ejemplo del mundo real.",
            "tipo": "tecnica",
            "skill": "Excel",
            "keywords_esperadas": ["buscar", "tabla", "referencia", "ejemplo"],
            "rubrica": {
                "keywords_clave": ["BUSCARV", "VLOOKUP", "referencia"],
                "puntos_fuertes_esperados": ["Ejemplo práctico", "Explica cuándo usarlo"],
                "red_flags": ["Confunde con SUMA"],
            },
        },
        {
            "texto": "Tu jefe te pide un reporte en Excel para mañana y los datos están desordenados. ¿Qué haces?",
            "tipo": "situacional",
            "skill": "Excel",
            "keywords_esperadas": ["limpiar", "priorizar", "validar", "entregar"],
            "rubrica": {
                "keywords_clave": ["limpieza", "prioridad", "validación"],
                "puntos_fuertes_esperados": ["Prioriza tareas", "Valida datos"],
                "red_flags": ["Entrega sin revisar"],
            },
        },
        {
            "texto": "Cuéntame de una vez que tuviste que explicar números o un reporte a alguien sin conocimiento técnico.",
            "tipo": "behavioral",
            "skill": "comunicación",
            "keywords_esperadas": ["explicar", "simple", "audiencia", "resultado"],
            "rubrica": {
                "keywords_clave": ["claridad", "audiencia", "resultado"],
                "puntos_fuertes_esperados": ["Adapta el lenguaje", "Verifica comprensión"],
                "red_flags": ["Usa solo jerga"],
            },
        },
        {
            "texto": "¿Qué harías si descubres un error en una fórmula que ya compartiste con tu equipo?",
            "tipo": "behavioral",
            "skill": "Excel",
            "keywords_esperadas": ["error", "comunicar", "corregir", "responsabilidad"],
            "rubrica": {
                "keywords_clave": ["transparencia", "corrección", "comunicación"],
                "puntos_fuertes_esperados": ["Asume responsabilidad", "Corrige rápido"],
                "red_flags": ["Oculta el error"],
            },
        },
    ],
    "atencion_al_cliente": [
        {
            "texto": "¿Cómo manejarías a un cliente molesto porque su pedido llegó tarde?",
            "tipo": "situacional",
            "skill": "Atención al cliente",
            "keywords_esperadas": ["escuchar", "empatía", "solución", "calma"],
            "rubrica": {
                "keywords_clave": ["empatía", "escucha", "solución"],
                "puntos_fuertes_esperados": ["No interrumpe", "Ofrece acción concreta"],
                "red_flags": ["Discute con el cliente"],
            },
        },
        {
            "texto": "Describe los pasos que sigues para atender a un cliente desde que llega hasta que se va satisfecho.",
            "tipo": "tecnica",
            "skill": "Atención al cliente",
            "keywords_esperadas": ["saludo", "necesidad", "solución", "despedida"],
            "rubrica": {
                "keywords_clave": ["saludo", "escucha", "cierre"],
                "puntos_fuertes_esperados": ["Proceso ordenado", "Enfoque en satisfacción"],
                "red_flags": ["Salta pasos clave"],
            },
        },
        {
            "texto": "Si no sabes la respuesta a una pregunta del cliente, ¿qué haces en ese momento?",
            "tipo": "situacional",
            "skill": "Atención al cliente",
            "keywords_esperadas": ["honestidad", "consultar", "seguimiento", "tiempo"],
            "rubrica": {
                "keywords_clave": ["no inventar", "consultar", "seguimiento"],
                "puntos_fuertes_esperados": ["Admite que no sabe", "Compromiso de respuesta"],
                "red_flags": ["Inventa información"],
            },
        },
        {
            "texto": "Cuéntame de una situación difícil con un cliente y cómo la resolviste.",
            "tipo": "behavioral",
            "skill": "Atención al cliente",
            "keywords_esperadas": ["conflicto", "calma", "solución", "aprendizaje"],
            "rubrica": {
                "keywords_clave": ["conflicto", "resolución", "aprendizaje"],
                "puntos_fuertes_esperados": ["Historia STAR", "Resultado positivo"],
                "red_flags": ["Culpa al cliente"],
            },
        },
        {
            "texto": "¿Por qué te interesa trabajar en atención al cliente y qué fortalezas personales aportas?",
            "tipo": "behavioral",
            "skill": "Atención al cliente",
            "keywords_esperadas": ["motivación", "paciencia", "comunicación", "actitud"],
            "rubrica": {
                "keywords_clave": ["motivación", "fortalezas", "servicio"],
                "puntos_fuertes_esperados": ["Motivación clara", "Fortalezas relevantes"],
                "red_flags": ["Respuesta genérica"],
            },
        },
    ],
}

_mock_interviews: dict[str, dict[str, Any]] = {}


def reset_interview_store() -> None:
    """Solo tests — limpia entrevistas mock en memoria."""
    _mock_interviews.clear()


class ProfileNotFoundError(Exception):
    """No hay profiles para el session_id."""


class InterviewNotFoundError(Exception):
    pass


class InterviewNotInProgressError(Exception):
    pass


class QuestionAlreadyAnsweredError(Exception):
    pass


class InterviewNoAnswersError(Exception):
    pass


class InterviewAlreadyCompletedError(Exception):
    pass


def _parse_json_list(raw: Any) -> list:
    if raw is None:
        return []
    if isinstance(raw, str):
        return json.loads(raw)
    return list(raw)


def _question_from_dict(data: dict) -> InterviewQuestion:
    return InterviewQuestion(
        idx=int(data.get("idx", 0)),
        texto=data.get("texto", ""),
        tipo=data.get("tipo", "tecnica"),
        skill=data.get("skill"),
        keywords_esperadas=list(data.get("keywords_esperadas") or []),
        rubrica=dict(data.get("rubrica") or {}),
    )


def _questions_from_row(row: dict) -> list[InterviewQuestion]:
    raw = _parse_json_list(row.get("questions"))
    return [_question_from_dict(q) for q in raw]


def _answers_from_row(row: dict) -> list[dict]:
    return _parse_json_list(row.get("answers"))


def _parse_datetime(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    return datetime.now(timezone.utc)


async def iniciar_entrevista(
    session_id: str,
    target_skill: str | None,
    target_role: str | None,
) -> InterviewStartResponse:
    """Genera preguntas, persiste fila mock_interviews y devuelve interview_id."""
    perfil = await cargar_perfil_por_session(session_id)
    if not perfil:
        raise ProfileNotFoundError(session_id)

    preguntas = await generar_preguntas(perfil, target_skill, target_role)
    now = datetime.now(timezone.utc)
    interview_id = str(uuid.uuid4())
    perfil_resumen = _perfil_resumen(perfil)

    row = {
        "id": interview_id,
        "profile_id": str(perfil["id"]),
        "user_id": perfil.get("user_id"),
        "session_id": session_id,
        "target_skill": target_skill,
        "target_role": target_role,
        "questions": [q.model_dump() for q in preguntas],
        "answers": [],
        "status": "in_progress",
        "created_at": now.isoformat(),
        "_perfil_resumen": perfil_resumen,
    }

    if USE_MOCK:
        _mock_interviews[interview_id] = row
        logger.info(f"[MOCK] entrevista iniciada id={interview_id}")
    else:
        supabase = get_supabase()
        insert_row = {k: v for k, v in row.items() if not k.startswith("_")}
        res = supabase.table("mock_interviews").insert(insert_row).execute()
        interview_id = str(res.data[0]["id"])
        logger.info(f"Entrevista iniciada id={interview_id} session={session_id}")

    return InterviewStartResponse(
        interview_id=interview_id,
        questions=preguntas,
        created_at=now,
    )


async def responder_pregunta_entrevista(
    interview_id: str,
    question_idx: int,
    answer: str,
) -> InterviewAnswerResponse:
    """Evalúa respuesta y hace append en answers jsonb (read-modify-write)."""
    row = await _load_interview(interview_id)
    if not row:
        raise InterviewNotFoundError(interview_id)

    if row.get("status") != "in_progress":
        raise InterviewNotInProgressError("Entrevista ya finalizada o abandonada")

    preguntas = _questions_from_row(row)
    if question_idx < 0 or question_idx >= len(preguntas):
        raise ValueError(f"question_idx fuera de rango: {question_idx}")

    answers = _answers_from_row(row)
    if any(int(a.get("question_idx", -1)) == question_idx for a in answers):
        raise QuestionAlreadyAnsweredError(f"Pregunta {question_idx} ya respondida")

    pregunta = preguntas[question_idx]
    evaluacion = await evaluar_respuesta(pregunta, answer)

    entry = {
        "question_idx": question_idx,
        "answer": answer,
        "score": evaluacion["score"],
        "feedback": evaluacion["feedback"],
        "fortalezas": evaluacion.get("fortalezas") or [],
        "areas_mejora": evaluacion.get("areas_mejora") or [],
    }
    answers.append(entry)
    now = datetime.now(timezone.utc).isoformat()

    if USE_MOCK:
        row["answers"] = answers
        _mock_interviews[interview_id] = row
    else:
        supabase = get_supabase()
        supabase.table("mock_interviews").update({"answers": answers}).eq("id", interview_id).execute()
        row["answers"] = answers

    logger.info(f"Respuesta guardada interview_id={interview_id} idx={question_idx}")
    return InterviewAnswerResponse(
        question_idx=question_idx,
        score=entry["score"],
        feedback=entry["feedback"],
        fortalezas=entry["fortalezas"],
        areas_mejora=entry["areas_mejora"],
    )


async def cerrar_entrevista(interview_id: str) -> InterviewFinishResponse:
    """Valida estado y delega en finalizar_entrevista."""
    row = await _load_interview(interview_id)
    if not row:
        raise InterviewNotFoundError(interview_id)

    if row.get("status") == "completed":
        raise InterviewAlreadyCompletedError("Entrevista ya finalizada")

    answers = _answers_from_row(row)
    if not answers:
        raise InterviewNoAnswersError("Sin respuestas para evaluar")

    return await finalizar_entrevista(interview_id)


async def historial_entrevistas(session_id: str) -> list[InterviewHistoryItem]:
    """Últimas 10 entrevistas del session_id, más recientes primero."""
    if USE_MOCK:
        rows = [
            r for r in _mock_interviews.values()
            if r.get("session_id") == session_id
        ]
        rows.sort(key=lambda r: r.get("created_at", ""), reverse=True)
        rows = rows[:10]
    else:
        supabase = get_supabase()
        res = (
            supabase.table("mock_interviews")
            .select("id, target_skill, target_role, global_score, created_at, status")
            .eq("session_id", session_id)
            .order("created_at", desc=True)
            .limit(10)
            .execute()
        )
        rows = res.data or []

    items: list[InterviewHistoryItem] = []
    for row in rows:
        items.append(
            InterviewHistoryItem(
                id=str(row["id"]),
                target_skill=row.get("target_skill"),
                target_role=row.get("target_role"),
                global_score=row.get("global_score"),
                created_at=_parse_datetime(row.get("created_at")),
                status=row.get("status", "in_progress"),
            )
        )
    return items


def _perfil_resumen(perfil: dict) -> str:
    return (
        f"Nombre: {perfil.get('nombre')}, Edad: {perfil.get('edad')}, "
        f"Ciudad: {perfil.get('ciudad')}, Carrera: {perfil.get('carrera')}, "
        f"Experiencia: {perfil.get('experiencia_anios')} años, "
        f"Habilidades: {', '.join(perfil.get('habilidades') or [])}"
    )


def normalizar_sector(valor: str | None) -> str:
    if not valor:
        return "general"
    key = valor.strip().lower()
    if key in VALID_SECTORS:
        return key
    return SECTOR_ALIASES.get(key, "general")


def determinar_sector(perfil: dict, target_role: str | None) -> str:
    sectores = perfil.get("sectores_interes") or []
    if sectores:
        return normalizar_sector(str(sectores[0]))

    if target_role:
        role_lower = target_role.lower()
        for hint, sector in ROLE_SECTOR_HINTS.items():
            if hint in role_lower:
                return sector
        return normalizar_sector(target_role)

    return "general"


def _mock_skill_key(target_skill: str | None) -> str | None:
    if not target_skill:
        return None
    s = target_skill.lower()
    if "python" in s:
        return "python"
    if "excel" in s:
        return "excel"
    if "atencion" in s or "cliente" in s or "servicio" in s:
        return "atencion_al_cliente"
    return None


def _rows_to_dicts(rows: list[dict]) -> list[dict]:
    out = []
    for row in rows:
        rubrica = row.get("rubrica")
        if isinstance(rubrica, str):
            rubrica = json.loads(rubrica)
        out.append(
            {
                "sector": row.get("sector"),
                "skill": row.get("skill"),
                "tipo": row.get("tipo"),
                "pregunta": row.get("pregunta"),
                "rubrica": rubrica or {},
            }
        )
    return out


async def seleccionar_preguntas_pool(
    sector: str,
    skill: str | None,
    nivel: str = "junior",
    limit: int = 8,
) -> list[dict]:
    """
    Consulta interview_questions_seed.
    Con skill: prioriza filas donde skill ILIKE %skill% (ej. React, JavaScript).
    Completa con más del sector y fallback a sector='general' si faltan.
    """
    sector = normalizar_sector(sector)
    # Si piden skill tech pero el sector cayó en general, usar tecnologia
    if skill and sector == "general":
        tech_hints = ("react", "javascript", "python", "java", "sql", "git", "node", "backend")
        if any(h in skill.lower() for h in tech_hints):
            sector = "tecnologia"

    if USE_MOCK:
        pool: list[dict] = []
        for key, preguntas in MOCK_INTERVIEW_CACHE.items():
            for p in preguntas:
                pool.append(
                    {
                        "sector": sector,
                        "skill": p.get("skill"),
                        "tipo": p.get("tipo"),
                        "pregunta": p["texto"],
                        "rubrica": p.get("rubrica", {}),
                    }
                )
        random.shuffle(pool)
        return pool[:limit]

    supabase = get_supabase()
    selected: list[dict] = []
    seen: set[str] = set()

    def add_rows(rows: list[dict]) -> None:
        for row in _rows_to_dicts(rows):
            pid = row.get("pregunta", "")
            if pid in seen:
                continue
            seen.add(pid)
            selected.append(row)

    if skill:
        skill_pattern = f"%{skill.strip()}%"
        res_skill = (
            supabase.table("interview_questions_seed")
            .select("*")
            .eq("sector", sector)
            .eq("nivel", nivel)
            .ilike("skill", skill_pattern)
            .limit(limit * 3)
            .execute()
        )
        skill_rows = res_skill.data or []
        random.shuffle(skill_rows)
        add_rows(skill_rows)
        logger.info(
            "Pool skill match sector=%s skill~%s → %s candidatas",
            sector,
            skill,
            len(skill_rows),
        )

    if len(selected) < limit:
        res = (
            supabase.table("interview_questions_seed")
            .select("*")
            .eq("sector", sector)
            .eq("nivel", nivel)
            .limit(limit * 4)
            .execute()
        )
        rows = res.data or []
        random.shuffle(rows)
        add_rows(rows)

    if len(selected) < limit:
        general = (
            supabase.table("interview_questions_seed")
            .select("*")
            .eq("sector", "general")
            .eq("nivel", nivel)
            .limit(limit * 2)
            .execute()
        )
        add_rows(general.data or [])

    return selected[:limit]


def _preguntas_desde_pool(candidatas: list[dict], count: int = 5) -> list[InterviewQuestion]:
    """Fallback: 5 preguntas del pool (3 técnicas + 2 behavioral si es posible)."""
    tecnicas = [c for c in candidatas if c.get("tipo") == "tecnica"]
    behavioral = [c for c in candidatas if c.get("tipo") == "behavioral"]
    situacionales = [c for c in candidatas if c.get("tipo") == "situacional"]
    otros = [c for c in candidatas if c not in tecnicas + behavioral + situacionales]

    elegidas: list[dict] = []
    elegidas.extend(tecnicas[:3])
    elegidas.extend(behavioral[:2])
    for grupo in (situacionales, otros, candidatas):
        for item in grupo:
            if len(elegidas) >= count:
                break
            if item not in elegidas:
                elegidas.append(item)
        if len(elegidas) >= count:
            break

    preguntas: list[InterviewQuestion] = []
    for i, raw in enumerate(elegidas[:count]):
        rubrica = raw.get("rubrica") or {}
        keywords = rubrica.get("keywords_clave") or []
        preguntas.append(
            InterviewQuestion(
                idx=i,
                texto=raw.get("pregunta") or raw.get("texto", ""),
                tipo=raw.get("tipo", "tecnica"),
                skill=raw.get("skill"),
                keywords_esperadas=list(keywords),
                rubrica=rubrica,
            )
        )
    return preguntas


async def generar_preguntas(
    perfil: dict,
    target_skill: str | None,
    target_role: str | None,
) -> list[InterviewQuestion]:
    """
    Pool de 8 candidatas → Gemini selecciona/adapta 5 (3 técnicas + 2 behavioral).
    Fallback: 5 del pool sin personalizar.
    """
    sector = determinar_sector(perfil, target_role)
    candidatas = await seleccionar_preguntas_pool(sector, target_skill, limit=8)

    cache_key = _mock_skill_key(target_skill)
    if USE_MOCK and cache_key and cache_key in MOCK_INTERVIEW_CACHE:
        logger.info(f"[MOCK] generar_preguntas desde caché skill={cache_key}")
        return _preguntas_desde_cache(MOCK_INTERVIEW_CACHE[cache_key])

    if USE_MOCK or not candidatas:
        logger.info(f"[MOCK/fallback] generar_preguntas desde pool sector={sector}")
        return _preguntas_desde_pool(candidatas or _flatten_mock_pool())

    try:
        prompt_tpl = get_prompt("INTERVIEW_QUESTION_GENERATOR")
        pool_json = json.dumps(
            [
                {
                    "texto": c.get("pregunta"),
                    "tipo": c.get("tipo"),
                    "skill": c.get("skill"),
                    "rubrica": c.get("rubrica"),
                }
                for c in candidatas
            ],
            ensure_ascii=False,
            indent=2,
        )

        prompt = (
            prompt_tpl.replace("{sector}", sector)
            .replace("{edad}", str(perfil.get("edad") or "N/A"))
            .replace("{ciudad}", str(perfil.get("ciudad") or "Colombia"))
            .replace("{nivel_educativo}", str(perfil.get("nivel_educativo") or "N/A"))
            .replace("{carrera}", str(perfil.get("carrera") or "N/A"))
            .replace("{experiencia_anios}", str(perfil.get("experiencia_anios") or 0))
            .replace("{habilidades}", ", ".join(perfil.get("habilidades") or []))
            .replace("{target_role}", str(target_role or perfil.get("carrera") or "rol junior"))
            .replace("{target_skill}", str(target_skill or "habilidades del perfil"))
            .replace("{pool_de_8_preguntas}", pool_json)
        )

        model = get_gemini_model()
        response = model.generate_content(prompt)
        raw = (response.text or "").strip()
        data = parse_json_from_llm(raw)
        items = data.get("preguntas") or []

        preguntas: list[InterviewQuestion] = []
        for i, item in enumerate(items[:5]):
            rubrica = item.get("rubrica") or {}
            keywords = item.get("keywords_esperadas") or rubrica.get("keywords_clave") or []
            preguntas.append(
                InterviewQuestion(
                    idx=i,
                    texto=item.get("texto", ""),
                    tipo=item.get("tipo", "tecnica"),
                    skill=item.get("skill"),
                    keywords_esperadas=list(keywords),
                    rubrica=rubrica,
                )
            )

        if len(preguntas) >= 3:
            logger.info(f"Gemini generó {len(preguntas)} preguntas para sector={sector}")
            return preguntas

        logger.warning("Gemini devolvió pocas preguntas — fallback al pool")
    except Exception as e:
        logger.error(f"Error generar_preguntas Gemini: {e}")

    return _preguntas_desde_pool(candidatas)


def _preguntas_desde_cache(raw_list: list[dict]) -> list[InterviewQuestion]:
    preguntas: list[InterviewQuestion] = []
    for i, item in enumerate(raw_list[:5]):
        rubrica = item.get("rubrica") or {}
        preguntas.append(
            InterviewQuestion(
                idx=i,
                texto=item["texto"],
                tipo=item.get("tipo", "tecnica"),
                skill=item.get("skill"),
                keywords_esperadas=item.get("keywords_esperadas") or rubrica.get("keywords_clave", []),
                rubrica=rubrica,
            )
        )
    return preguntas


def _flatten_mock_pool() -> list[dict]:
    out: list[dict] = []
    for preguntas in MOCK_INTERVIEW_CACHE.values():
        for p in preguntas:
            out.append(
                {
                    "pregunta": p["texto"],
                    "tipo": p.get("tipo"),
                    "skill": p.get("skill"),
                    "rubrica": p.get("rubrica", {}),
                }
            )
    return out


async def evaluar_respuesta(pregunta: InterviewQuestion, respuesta_usuario: str) -> dict:
    """
    Evalúa con Gemini. Fallback: score=60 y feedback genérico.
    """
    if USE_MOCK:
        return _mock_evaluar_respuesta(pregunta, respuesta_usuario)

    raw = ""
    try:
        prompt_tpl = get_prompt("INTERVIEW_ANSWER_EVALUATOR")
        rubrica_json = json.dumps(pregunta.rubrica, ensure_ascii=False)
        prompt = (
            prompt_tpl.replace("{pregunta_texto}", pregunta.texto)
            .replace("{tipo}", pregunta.tipo)
            .replace("{rubrica_json}", rubrica_json)
            .replace("{respuesta_usuario}", respuesta_usuario)
        )

        model = get_gemini_model()
        response = model.generate_content(prompt)
        raw = (response.text or "").strip()
        data = parse_json_from_llm(raw)

        score = int(data.get("score", 60))
        score = max(0, min(100, score))
        return {
            "score": score,
            "feedback": str(data.get("feedback", "")),
            "fortalezas": list(data.get("fortalezas") or []),
            "areas_mejora": list(data.get("areas_mejora") or []),
        }
    except Exception as e:
        logger.error(f"Error evaluar_respuesta Gemini: {e}")
        if raw:
            logger.error(f"JSON crudo fallido evaluar_respuesta: {raw[:500]}")

    return {
        "score": 60,
        "feedback": (
            "Tu respuesta muestra interés en el tema. Intenta incluir un ejemplo concreto "
            "de tu experiencia y mencionar el resultado que obtuviste."
        ),
        "fortalezas": ["Participación activa"],
        "areas_mejora": [pregunta.skill or "Profundizar en ejemplos concretos"],
    }


def _mock_evaluar_respuesta(pregunta: InterviewQuestion, respuesta_usuario: str) -> dict:
    """Scores fijos pero realistas para demo."""
    length = len(respuesta_usuario.strip())
    base = 55 if length < 80 else 68 if length < 200 else 78
    if any(kw.lower() in respuesta_usuario.lower() for kw in pregunta.keywords_esperadas[:3]):
        base += 10
    base = min(92, base)

    return {
        "score": base,
        "feedback": (
            f"Mencionaste puntos relevantes sobre {pregunta.skill or 'el tema'}. "
            "Para mejorar, estructura tu respuesta con situación, acción y resultado."
        ),
        "fortalezas": ["Claridad en la idea principal", "Tono profesional"],
        "areas_mejora": [
            pregunta.skill or "Comunicación verbal",
            "Ejemplos con métricas o resultados",
        ],
    }


def _aggregate_weak_skills(answers: list[dict]) -> list[str]:
    counter: Counter[str] = Counter()
    for ans in answers:
        for area in ans.get("areas_mejora") or []:
            if area:
                counter[str(area).strip()] += 1
    return [skill for skill, _ in counter.most_common(5)]


async def finalizar_entrevista(interview_id: str) -> InterviewFinishResponse:
    """
    Promedia scores, detecta weak_skills y genera feedback final con Gemini.
    """
    row = await _load_interview(interview_id)
    if not row:
        raise ValueError(f"Entrevista no encontrada: {interview_id}")

    answers = row.get("answers") or []
    if isinstance(answers, str):
        answers = json.loads(answers)

    scores = [int(a.get("score", 0)) for a in answers if a.get("score") is not None]
    global_score = int(round(sum(scores) / len(scores))) if scores else 0
    weak_skills = _aggregate_weak_skills(answers)

    perfil_resumen = row.get("_perfil_resumen")
    if not perfil_resumen and row.get("session_id"):
        perfil = await cargar_perfil_por_session(row["session_id"])
        if perfil:
            perfil_resumen = _perfil_resumen(perfil)
    perfil_resumen = perfil_resumen or "Candidato joven en Colombia"
    feedback_general, recomendacion = await _generar_feedback_final(
        perfil_resumen, global_score, weak_skills
    )

    now = datetime.now(timezone.utc).isoformat()
    update = {
        "global_score": global_score,
        "weak_skills": weak_skills,
        "status": "completed",
        "completed_at": now,
    }

    if USE_MOCK:
        row.update(update)
        row["feedback_general"] = feedback_general
        row["recomendacion_siguiente_paso"] = recomendacion
        _mock_interviews[interview_id] = row
    else:
        supabase = get_supabase()
        supabase.table("mock_interviews").update(update).eq("id", interview_id).execute()

    logger.info(f"Entrevista finalizada id={interview_id} score={global_score}")
    return InterviewFinishResponse(
        interview_id=interview_id,
        global_score=global_score,
        weak_skills=weak_skills,
        feedback_general=feedback_general,
        recomendacion_siguiente_paso=recomendacion,
    )


async def _generar_feedback_final(
    perfil_resumen: str, global_score: int, weak_skills: list[str]
) -> tuple[str, str]:
    if USE_MOCK:
        return (
            f"Completaste la simulación con {global_score}/100. "
            "Vas por buen camino: se nota preparación y actitud de aprendizaje. "
            "Refuerza las áreas señaladas con práctica guiada esta semana.",
            "Elige una skill débil y dedica 30 minutos diarios durante 7 días a un micro-ejercicio "
            "(video + práctica + autoevaluación).",
        )

    try:
        prompt_tpl = get_prompt("INTERVIEW_FINAL_FEEDBACK")
        prompt = (
            prompt_tpl.replace("{perfil_resumen}", perfil_resumen)
            .replace("{global_score}", str(global_score))
            .replace("{weak_skills}", ", ".join(weak_skills) or "ninguna crítica")
        )
        model = get_gemini_model()
        response = model.generate_content(prompt)
        raw = (response.text or "").strip()
        data = parse_json_from_llm(raw)
        return (
            str(data.get("feedback_general", "")),
            str(data.get("recomendacion_siguiente_paso", "")),
        )
    except Exception as e:
        logger.error(f"Error feedback final Gemini: {e}")

    return (
        f"Tu desempeño global fue {global_score}/100. Sigue practicando con ejemplos concretos.",
        "Repite una entrevista simulada enfocada en tu skill más débil esta semana.",
    )


async def _load_interview(interview_id: str) -> dict | None:
    if USE_MOCK:
        return _mock_interviews.get(interview_id)

    supabase = get_supabase()
    res = supabase.table("mock_interviews").select("*").eq("id", interview_id).execute()
    return res.data[0] if res.data else None


# --- Helpers para B5 / tests ---

def mock_store_interview(interview_id: str, row: dict) -> None:
    """Registra entrevista en memoria (modo mock / tests)."""
    _mock_interviews[interview_id] = row


async def ultima_entrevista_completada(session_id: str) -> dict | None:
    """Última entrevista con status=completed (para contexto del coach)."""
    if USE_MOCK:
        rows = [
            r for r in _mock_interviews.values()
            if r.get("session_id") == session_id and r.get("status") == "completed"
        ]
        rows.sort(key=lambda r: r.get("completed_at") or r.get("created_at", ""), reverse=True)
        return rows[0] if rows else None

    supabase = get_supabase()
    res = (
        supabase.table("mock_interviews")
        .select("*")
        .eq("session_id", session_id)
        .eq("status", "completed")
        .order("completed_at", desc=True)
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


async def cargar_perfil_por_session(session_id: str) -> dict | None:
    if USE_MOCK:
        return {
            "id": "mock-profile-interview",
            "session_id": session_id,
            "nombre": "Laura Méndez",
            "edad": 22,
            "ciudad": "Barranquilla",
            "departamento": "Atlántico",
            "nivel_educativo": "universitario",
            "carrera": "Ingeniería de sistemas",
            "experiencia_anios": 0.5,
            "habilidades": ["python", "excel", "comunicacion"],
            "sectores_interes": ["tecnologia"],
        }

    supabase = get_supabase()
    res = supabase.table("profiles").select("*").eq("session_id", session_id).execute()
    return res.data[0] if res.data else None
