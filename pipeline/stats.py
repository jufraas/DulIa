import os
from collections import Counter
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def calcular_stats():
    res = sb.table("jobs").select("*").neq("source", "manual").execute()
    vacantes = res.data

    # ─── Salarios ──────────────────────────────────────────────
    salarios = [v["salary_min"] for v in vacantes if v.get("salary_min")]
    salario_promedio = int(sum(salarios) / len(salarios)) if salarios else 0
    salario_min = min(salarios) if salarios else 0
    salario_max = max(salarios) if salarios else 0

    # ─── Skills trending ───────────────────────────────────────
    todas_skills = []
    for v in vacantes:
        todas_skills.extend(v.get("skills_req") or [])
    skills_trending = Counter(todas_skills).most_common(10)

    # ─── Por status ────────────────────────────────────────────
    por_status = Counter(v["status"] for v in vacantes)

    # ─── Por ciudad ────────────────────────────────────────────
    por_ciudad = Counter()
    for v in vacantes:
        loc = v.get("location") or ""
        if "Barranquilla" in loc: por_ciudad["Barranquilla"] += 1
        elif "Bogotá" in loc:     por_ciudad["Bogotá"] += 1
        elif "Medellín" in loc:   por_ciudad["Medellín"] += 1
        else:                     por_ciudad["Otra"] += 1

    # ─── Resultado ─────────────────────────────────────────────
    stats = {
        "total_vacantes": len(vacantes),
        "salario_promedio_cop": salario_promedio,
        "salario_min_cop": salario_min,
        "salario_max_cop": salario_max,
        "skills_trending": [{"skill": s, "count": c} for s, c in skills_trending],
        "por_status": dict(por_status),
        "por_ciudad": dict(por_ciudad),
    }

    print("\n===== STATS DEL MERCADO =====")
    print(f"Total vacantes:     {stats['total_vacantes']}")
    print(f"Salario promedio:   ${stats['salario_promedio_cop']:,} COP")
    print(f"Rango salarial:     ${stats['salario_min_cop']:,} – ${stats['salario_max_cop']:,} COP")
    print(f"\nVacantes por status: {stats['por_status']}")
    print(f"Vacantes por ciudad: {stats['por_ciudad']}")
    print(f"\nTop skills:")
    for s in stats["skills_trending"]:
        print(f"  {s['skill']:<20} {s['count']} vacantes")

    return stats

if __name__ == "__main__":
    calcular_stats()