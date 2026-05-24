# Handoff Frontend — Termómetro personalizado + cache de vacantes

> **Estado:** ✅ Implementado (2026-05-24) — `MarketThermometer`, `VacanciesPage`, `useResultsData`, `api.js` · commit `7a18bc1`

> **Para:** Migue (frontend)  
> **De:** Carlos (backend)  
> **Fecha:** 2026-05-24  
> **Prioridad:** Pre-pitch  
> **Estimación:** ~45–60 min

## Contexto

El termómetro debe reflejar el **mercado relevante al usuario**, no el global. El backend expone:

- **Global (fallback):** `GET /api/market/dashboard?city=...` — alcance accesible desde una ciudad.
- **Personalizado (preferido):** `GET /api/market/dashboard/{session_id}` — pool filtrado por ciudad + sectores del perfil, con skills demandadas en su campo.

Además, `/vacantes` sufre cache stale en `localStorage` si no refetch al montar.

---

## 1. Endpoint a usar en UI

**Archivo:** `frontend/src/services/api.js`

Agregar o actualizar `getMarketDashboard`:

```js
export async function getMarketDashboard(filters = {}, profile = null, sessionId = null) {
  try {
    if (sessionId) {
      const { data } = await api.get(`/market/dashboard/${sessionId}`)
      return data
    }
    const { data } = await api.get('/market/dashboard', { params: filters })
    return data
  } catch (err) {
    logOfflineFallback('getMarketDashboard', err)
    return buildMockMarketFromProfile({ ...profile, ciudad: filters.city ?? profile?.ciudad })
  }
}
```

**Llamadas desde pantallas con perfil:**

```js
// VacanciesPage, ResultsPage, loadResultsBundle
await getMarketDashboard(
  { city: savedProfile?.ciudad },
  savedProfile,
  getOrCreateSessionId(),  // ← preferir endpoint personalizado
)
```

Reservar el endpoint global solo para landing/anónimo sin perfil.

---

## 2. Termómetro del mercado (`MarketThermometer.jsx`)

### Contrato API — `GET /api/market/dashboard/{session_id}`

```json
{
  "total_vacantes_activas": 375,
  "vacantes_locales": 3,
  "vacantes_remotas": 350,
  "vacantes_nacionales": 22,
  "sectores_filtro": ["technology", "user experience", "innovation"],
  "top_skills_demandadas": [
    { "skill": "Python", "count": 87, "tienes": false },
    { "skill": "SQL", "count": 76, "tienes": false },
    { "skill": "TypeScript", "count": 71, "tienes": true }
  ],
  "top_sectores": [
    { "sector": "Programming", "count": 198 }
  ],
  "salario_promedio": 33190495,
  "crecimiento_semanal_pct": 100.0,
  "ciudad_filtro": "Barranquilla",
  "top_empresas_verdes": ["Coderslab.io", "BC Tecnología"],
  "por_modalidad": { "remoto": 350, "presencial": 23, "hibrido": 0 },
  "por_fuente": { "getonbrd": 346, "remotive": 18, "mock": 11 }
}
```

| Campo | Significado |
|-------|-------------|
| `total_vacantes_activas` | Vacantes **en tu campo** (ciudad + sectores), no global |
| `sectores_filtro` | Sectores del perfil usados en el filtro |
| `top_skills_demandadas` | Top 8 skills más pedidas en tu pool; `tienes` = ya la tienes |
| `salario_promedio` | Promedio del pool personalizado |
| `crecimiento_semanal_pct` | Crecimiento en tu scope; `null` → `—` |
| `vacantes_locales/remotas/nacionales` | Desglose geográfico del pool personalizado |

### Qué implementar en UI

**Archivo:** `frontend/src/components/results/MarketThermometer.jsx`

1. **Subtítulo contextual** (reemplaza mensaje global):
   ```
   Vacantes en tu campo · Barranquilla
   technology · user experience · innovation
   ```
   Usar `ciudad_filtro` + `sectores_filtro.slice(0, 3)`.

2. **Desglose geográfico** (si hay datos):
   ```
   3 en Barranquilla · 350 remoto · 22 en otras ciudades CO
   ```
   Desde `vacantes_locales`, `vacantes_remotas`, `vacantes_nacionales`.

3. **Bloque nuevo: Skills más demandadas en tu campo**
   ```
   Python · 87 vacantes
   TypeScript · 71 vacantes ✓
   ```
   Mapear `top_skills_demandadas`:
   - Mostrar `skill`, `count`
   - Si `tienes === true` → check verde o badge "Ya la tienes"
   - Si `tienes === false` → texto neutro o sugerencia sutil ("Oportunidad de aprender")

4. **Chips modalidad** — `por_modalidad` (Remoto / Presencial / Híbrido).

5. **Fuentes** — `por_fuente`: `getonbrd` → "Get on Board", `remotive` → "Remotive", `mock` → "Demo".

6. **Hint crecimiento:** *"Nuevas vacantes indexadas esta semana en tu campo"*.

**Archivo:** `frontend/src/store/useProfileStore.js` — typedef `MarketDashboard`:

```js
 * @property {number} [vacantes_locales]
 * @property {number} [vacantes_remotas]
 * @property {number} [vacantes_nacionales]
 * @property {string[]} [sectores_filtro]
 * @property {{ skill: string, count: number, tienes: boolean }[]} [top_skills_demandadas]
 * @property {Record<string, number>} [por_modalidad]
 * @property {Record<string, number>} [por_fuente]
```

---

## 3. Cache stale en `/vacantes` (`VacanciesPage.jsx`)

Quitar guards que impiden refetch:

```js
// ELIMINAR: if (market) return undefined
// ELIMINAR: if (jobs.length) return undefined
```

Refetch al montar con endpoint personalizado:

```js
useEffect(() => {
  let cancelled = false
  ;(async () => {
    const data = await getMarketDashboard(
      { city: savedProfile?.ciudad },
      savedProfile,
      getOrCreateSessionId(),
    )
    if (!cancelled) setMarket(data)
  })()
  return () => { cancelled = true }
}, [savedProfile, setMarket])
```

Igual para `getRecommendedJobs` en el otro `useEffect`.

---

## 4. Vacantes recomendadas (sin cambio de contrato)

`GET /api/jobs/recommended/{session_id}` — mismos campos; backend devuelve pool completo compatible por seniority, scores variados.

El termómetro personalizado **no aplica seniority** (muestra mercado en tu campo). La lista de vacantes sí lo aplica — es normal que la lista sea más corta que `total_vacantes_activas` del termómetro.

---

## Verificación

```bash
# Termómetro personalizado (Orlando)
curl -s "http://localhost:8000/api/market/dashboard/b58ddc86-9717-45dd-9b02-6e5d12c15ae3" | python -m json.tool

# Global (solo fallback)
curl -s "http://localhost:8000/api/market/dashboard?city=Barranquilla" | python -m json.tool

# Vacantes del perfil
curl -s "http://localhost:8000/api/jobs/recommended/b58ddc86-9717-45dd-9b02-6e5d12c15ae3" | python -c "import sys,json; print(len(json.load(sys.stdin)))"
```

En UI:
1. Borrar `dulia_session_data` o incógnito.
2. `/resultados` → sección Mercado: termómetro con skills demandadas + sectores del perfil.
3. `/vacantes` → semáforo + lista; refetch jobs sin quedarse en 1 job viejo (sin termómetro).

---

## Archivos a tocar (resumen)

| Archivo | Acción |
|---------|--------|
| `services/api.js` | `getMarketDashboard` con `sessionId` → endpoint personalizado |
| `components/results/MarketThermometer.jsx` | Scope perfil, skills demandadas, desglose geo |
| `store/useProfileStore.js` | Typedef ampliado |
| `pages/VacanciesPage.jsx` | Refetch jobs al montar (sin termómetro) |
| `pages/ResultsPage.jsx` / `loadResultsBundle` | Pasar `sessionId` al fetch de market |

---

## Commit sugerido

```
feat(ui): termómetro personalizado por perfil y refetch vacantes

Usa GET /market/dashboard/{sessionId} con top_skills_demandadas y sectores_filtro.
Refetch market/jobs en VacanciesPage; muestra skills con flag tienes.
```

---

## Referencias backend

- `backend/app/services/market_service.py` — `obtener_dashboard_para_perfil()`
- `backend/app/routes/market.py` — ruta nueva
- `docs/ENDPOINTS.md` — contrato completo
