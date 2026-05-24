import os
from dotenv import load_dotenv
from supabase import create_client
from mock_data import get_mock_vacantes

_HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_HERE, "..", "backend", ".env"))
sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

vacantes = get_mock_vacantes()
res = sb.table("jobs").upsert(vacantes, on_conflict="url").execute()
print(f"Cargadas {len(res.data)} vacantes en Supabase")
for v in res.data:
    print(f"  [{v['status'].upper()}] {v['title']} – {v['company']}")