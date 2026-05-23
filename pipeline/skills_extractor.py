import os, json, time, requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={GEMINI_KEY}"

def extraer_skills(descripcion: str) -> list:
    body = {
        "contents": [{
            "parts": [{
                "text": f"""Analiza esta descripción de vacante y extrae las habilidades técnicas requeridas.
Devuelve SOLO un array JSON con las skills en minúsculas, sin explicación, sin markdown.
Ejemplo: ["python", "django", "postgresql", "git"]

Descripción:
{descripcion}"""
            }]
        }]
    }
    try:
        resp = requests.post(URL, json=body, timeout=15)
        texto = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        texto = texto.replace("```json", "").replace("```", "").strip()
        return json.loads(texto)
    except Exception as e:
        print(f"  Error: {e}")
        return []

def run():
    res = sb.table("jobs").select("id, title, company, description").execute()
    for v in res.data:
        print(f"\nProcesando: {v['title']} – {v['company']}")
        desc = v.get("description") or ""
        if not desc:
            print("  Sin descripción, saltando...")
            continue
        skills = extraer_skills(desc)
        print(f"  Skills: {skills}")
        sb.table("jobs").update({"skills_required": skills}).eq("id", v["id"]).execute()
        time.sleep(3)
    print("\nExtracción completa.")

if __name__ == "__main__":
    run()