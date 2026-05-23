import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

res = sb.table("jobs").select("id").limit(1).execute()
print("Conexion OK:", res)

res = sb.table("jobs").insert({
    "title":   "Desarrollador Python",
    "company": "Empresa Test",
    "source":  "manual",
    "status":  "green",
    "url":     "https://test.com/vacante-1"
}).execute()
print("Insertado:", res.data)