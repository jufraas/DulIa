# DulIA — Coach de Carrera con IA para Jóvenes Colombianos

> Hackathon Barranqui-IA 2026 · 48 horas

DulIA es una plataforma web que usa inteligencia artificial para orientar a jóvenes colombianos en su desarrollo profesional: sugiere rutas de carrera, conecta con oportunidades laborales reales y entrega feedback personalizado sobre su perfil.

**Flujo MVP:** landing → wizard (con subida opcional de CV PDF) → resultados con score y vacantes → panel semáforo → PDF descargable. Sesión anónima por `session_id` con persistencia al refresh.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend API | Python 3.14 · FastAPI · Uvicorn |
| Frontend | React 19 · Vite · Tailwind CSS |
| Data Pipeline | Python · scrapers async / Adzuna |
| IA | Google Gemini API |
| Base de datos | PostgreSQL 17 · Supabase (ver [SCHEMA.md](docs/SCHEMA.md)) |

---

## Estructura del repositorio

```
DulIa/
├── backend/     → API REST (FastAPI), lógica de negocio e integración con Gemini
├── frontend/    → SPA en React+Vite, UI y consumo de la API
├── pipeline/    → Scrapers de ofertas laborales y procesamiento de datos
├── docs/        → Documentación compartida del proyecto
└── LICENSE
```

---

## Clonar y arrancar

```bash
# 1. Clonar
git clone <URL-del-repo>
cd DulIa

# 2. Backend
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # USE_MOCK_DATA=true para dev sin credenciales
uvicorn main:app --reload
# Swagger: http://localhost:8000/docs · Contrato: docs/ENDPOINTS.md

# 3. Frontend (en otra terminal — debe ser desde frontend/)
cd frontend
npm install
npm run dev    # http://localhost:5173
# Opcional: frontend/.env.local → VITE_API_URL=http://localhost:8000/api

# 4. Pipeline (en otra terminal)
cd pipeline
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

---

## Equipo

| Nombre | Rol |
|--------|-----|
| Carlos (krl0s) | Backend — FastAPI, integración IA |
| Migue | Frontend — Sobre DulIA (`/sobre`), onboarding/API |
| Joufra | Frontend — Landing, resultados, vacantes · IA + pitch |
| Jose | Data Pipeline — scrapers Python |

---

## Documentación

| Archivo | Contenido |
|---------|-----------|
| [AI_CONTEXT.md](docs/AI_CONTEXT.md) | Resumen rápido del proyecto para contexto de IA |
| [PROJECT_STATE.md](docs/PROJECT_STATE.md) | Estado actual del proyecto |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitectura y conexión entre módulos |
| [SCHEMA.md](docs/SCHEMA.md) | Esquema de la base de datos |
| [ENDPOINTS.md](docs/ENDPOINTS.md) | Contrato de endpoints de la API |
| [DECISIONS.md](docs/DECISIONS.md) | Log de decisiones técnicas |
| [PROMPTS.md](docs/PROMPTS.md) | System prompts de Gemini |
| [frontend/COMPONENT_OWNERS.md](frontend/COMPONENT_OWNERS.md) | División de trabajo frontend |
| [EXTRA_IDEAS/README.md](docs/EXTRA_IDEAS/README.md) | Ideas post-MVP e índice |
| [EXTRA_IDEAS/post-mvp-roadmap.md](docs/EXTRA_IDEAS/post-mvp-roadmap.md) | Roadmap fase 2 (login, timeline, pitch) |
| [EXTRA_IDEAS/ideallamativamacondo.md](docs/EXTRA_IDEAS/ideallamativamacondo.md) | Spinoff Startup Analyzer |
