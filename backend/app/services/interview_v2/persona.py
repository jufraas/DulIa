"""Persona del entrevistador IA por sector (B8.2)."""

from __future__ import annotations

from app.models.interview_v2_models import InterviewPersona

PERSONA_BANK: dict[str, dict[str, str]] = {
    "tecnologia": {
        "nombre": "Andrea Restrepo",
        "rol_entrevistador": "Lead de ingeniería",
        "estilo": "cercana, exigente con ejemplos concretos y código real",
    },
    "marketing": {
        "nombre": "Camila Torres",
        "rol_entrevistador": "Directora de marketing digital",
        "estilo": "creativa, enfocada en resultados medibles y campañas reales",
    },
    "ventas": {
        "nombre": "Diego Salazar",
        "rol_entrevistador": "Gerente comercial",
        "estilo": "directo, evalúa actitud comercial y cierre de ventas",
    },
    "contabilidad": {
        "nombre": "Patricia Gómez",
        "rol_entrevistador": "Contadora senior",
        "estilo": "precisa, valora orden, normativa y atención al detalle",
    },
    "servicio_cliente": {
        "nombre": "Laura Muñoz",
        "rol_entrevistador": "Supervisora de servicio al cliente",
        "estilo": "empática, observa calma bajo presión y resolución de conflictos",
    },
    "operaciones": {
        "nombre": "Ricardo Peña",
        "rol_entrevistador": "Jefe de operaciones",
        "estilo": "pragmático, busca eficiencia y mejora de procesos",
    },
    "salud": {
        "nombre": "Daniela Ortiz",
        "rol_entrevistador": "Coordinadora de enfermería",
        "estilo": "humana, valora protocolos, empatía y trabajo bajo presión",
    },
    "educacion": {
        "nombre": "Fernando Castro",
        "rol_entrevistador": "Coordinador académico",
        "estilo": "pedagógico, evalúa comunicación clara y vocación de enseñar",
    },
    "general": {
        "nombre": "Valentina Herrera",
        "rol_entrevistador": "Reclutadora de talento junior",
        "estilo": "cálida, estructurada, busca potencial y actitud de aprendizaje",
    },
}


def _candidato_nombre(perfil: dict) -> str:
    return str(perfil.get("nombre") or "candidato").strip() or "candidato"


def _rol_display(target_role: str | None, perfil: dict) -> str:
    if target_role and target_role.strip():
        return target_role.strip()
    return str(perfil.get("carrera") or "el rol al que aplicas")


def build_saludo_inicial(
    persona_data: dict[str, str],
    perfil: dict,
    target_role: str | None,
    target_skill: str | None,
) -> str:
    nombre_candidato = _candidato_nombre(perfil)
    rol = _rol_display(target_role, perfil)
    entrevistador = persona_data["nombre"]
    rol_ent = persona_data["rol_entrevistador"]
    skill_hint = f" con foco en {target_skill}" if target_skill else ""

    return (
        f"Hola {nombre_candidato}, soy {entrevistador}, {rol_ent}. "
        f"Gracias por tomarte este tiempo — vamos a conversar como en una entrevista real "
        f"para {rol}{skill_hint}. Antes de entrar al detalle, cuéntame un poco de ti: "
        f"¿qué te motivó a postular y qué esperas de este proceso?"
    )


def build_persona(
    sector: str,
    target_role: str | None,
    perfil: dict,
    target_skill: str | None = None,
) -> InterviewPersona:
    """Construye la persona del entrevistador para el sector dado."""
    sector_key = sector if sector in PERSONA_BANK else "general"
    data = PERSONA_BANK[sector_key]
    saludo = build_saludo_inicial(data, perfil, target_role, target_skill)

    return InterviewPersona(
        nombre=data["nombre"],
        rol_entrevistador=data["rol_entrevistador"],
        sector=sector_key,
        estilo=data["estilo"],
        saludo_inicial=saludo,
    )
