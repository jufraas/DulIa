from dotenv import load_dotenv
load_dotenv()  # debe ir antes de importar módulos que lean os.getenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.utils.logger import get_logger
from app.routes import health, profile, jobs

logger = get_logger("dulia.main")

app = FastAPI(
    title="DulIA API",
    description="Coach de carrera con IA para jóvenes colombianos — Barranqui-IA 2026",
    version="0.1.0",
)

# CORS: en dev abrimos todo; en producción restringir al dominio del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")

@app.on_event("startup")
async def startup():
    logger.info("DulIA API iniciada — visita /docs para la documentación interactiva")
