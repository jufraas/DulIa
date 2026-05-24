# Fuentes de vacantes: Get on Board + Remotive (Adzuna/Jooble descartadas)

- **Fecha:** 2026-05-23
- **Área:** pipeline + backend
- **Estado:** activa
- **Autor/es:** Equipo DulIA (Jose pipeline, Carlos backend)

## Contexto

El MVP necesitaba poblar `jobs` con vacantes reales para scoring, termómetro y demo del hackathon. Se evaluaron Adzuna, Jooble, Get on Board y Remotive.

## Decisión

**Fuentes finales del pipeline:**

| Fuente | Script | Rol |
|--------|--------|-----|
| **Get on Board** | `pipeline/getonbrd_fetcher.py` | Oportunidades **locales** (Colombia / LATAM en la plataforma) |
| **Remotive** | `pipeline/remotive_fetcher.py` | Oportunidades **remoto internacional** (cap 50/run, filtro LATAM/Worldwide) |
| **mock** | `pipeline/cargar_mock.py` | Demo / desarrollo sin API |

**Descartadas:** Adzuna (sin endpoint Colombia `co`), Jooble (free tier sin filtro LATAM fiable).

**Reframe producto:** *"oportunidades locales + remoto internacional"* — el termómetro expone `por_fuente` y `por_modalidad` en `GET /api/market/dashboard`.

## Por qué

- Get on Board: vacantes relevantes para jóvenes colombianos, sin auth compleja.
- Remotive: API pública, tags como skills, salary USD→COP, 100% remoto.
- Adzuna/Jooble: no cubren bien el mercado objetivo en 48h de hackathon.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Adzuna | No hay endpoint para Colombia |
| Jooble | Free tier no filtra LATAM de forma confiable |
| Scrapers propios | Riesgo legal y tiempo en hackathon |

## Consecuencias

- `jobs.source` valores esperados: `getonbrd`, `remotive`, `mock` (legacy: `adzuna`, `jooble` en scripts deprecados).
- Termómetro: `por_fuente` y `por_modalidad` agregados en Fase D del plan pipeline.
- Scripts `adzuna_fetcher.py` y `jooble_fetcher.py` permanecen en repo como referencia pero **no se ejecutan** en el flujo operativo.
