from dotenv import load_dotenv
load_dotenv()  # debe ir antes de importar módulos que lean os.getenv

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.utils.logger import get_logger
from app.utils.limiter import limiter
from app.utils.cors import get_cors_config
from app.routes import health, profile, jobs, market, coach, charts, auth

logger = get_logger("dulia.main")

app = FastAPI(
    title="DulIA API",
    description="Coach de carrera con IA para jóvenes colombianos — Barranqui-IA 2026",
    version="0.1.0",
)

# Rate limiting (slowapi) — ver @limiter.limit en profile y coach
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS: dev abierto o localhost; producción solo CORS_ORIGINS del .env
cors = get_cors_config()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors["allow_origins"],
    allow_credentials=cors["allow_credentials"],
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info(
    f"CORS activo — env={os.getenv('APP_ENV', 'development')}, "
    f"origins={cors['allow_origins']}, credentials={cors['allow_credentials']}"
)

app.include_router(health.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(market.router, prefix="/api")
app.include_router(coach.router, prefix="/api")
app.include_router(charts.router, prefix="/api")
app.include_router(auth.router, prefix="/api")


@app.on_event("startup")
async def startup():
    logger.info("DulIA API iniciada — visita /docs para la documentación interactiva")
