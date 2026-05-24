# Prompts empaquetados para deploy (Railway)

Railway despliega solo la carpeta `backend/`. El loader en `app/utils/prompts.py` busca prompts en este orden:

1. `PROMPTS_FILE` (env var, opcional)
2. `backend/prompts/PROMPTS.md` ← este archivo (producción)
3. `docs/PROMPTS.md` en la raíz del monorepo (desarrollo local)

## Sincronizar tras editar prompts

Cuando cambies `docs/PROMPTS.md` en la raíz del repo, copiá el archivo aquí antes de pushear:

```bash
cp docs/PROMPTS.md backend/prompts/PROMPTS.md
```

El coach, entrevistas y CV parser dependen de estos prompts en producción.
