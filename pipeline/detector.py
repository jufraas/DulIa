import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def clasificar(vacante: dict) -> str:
    # ─── ROJA ──────────────────────────────────────────────────
    if vacante.get("repost_count", 0) >= 5:
        return "red"

    posted_at = vacante.get("posted_at")
    if posted_at:
        fecha = datetime.fromisoformat(posted_at.replace("Z", "+00:00"))
        dias = (datetime.now(timezone.utc) - fecha).days
    else:
        dias = 0

    if dias > 90:
        return "red"

    # ─── AMARILLA ──────────────────────────────────────────────
    if vacante.get("repost_count", 0) >= 2:
        return "yellow"

    if dias > 60:
        return "yellow"

    desc = (vacante.get("description") or "").lower()
    palabras_sospechosas = ["urgente", "cupos limitados", "salario a convenir", "escribir al whatsapp"]
    if any(p in desc for p in palabras_sospechosas):
        return "yellow"

    # ─── VERDE ─────────────────────────────────────────────────
    return "green"

def run():
    res = sb.table("jobs").select("*").execute()
    vacantes = res.data

    actualizadas = {"green": 0, "yellow": 0, "red": 0}

    for v in vacantes:
        nuevo_status = clasificar(v)
        if nuevo_status != v.get("status"):
            sb.table("jobs").update({"status": nuevo_status}).eq("id", v["id"]).execute()
            print(f"  Actualizado: [{nuevo_status.upper()}] {v['title']} – {v['company']}")
        actualizadas[nuevo_status] += 1

    print(f"\nResumen:")
    print(f"  Verdes:    {actualizadas['green']}")
    print(f"  Amarillas: {actualizadas['yellow']}")
    print(f"  Rojas:     {actualizadas['red']}")

if __name__ == "__main__":
    print("Ejecutando detector de fantasmas...\n")
    run()