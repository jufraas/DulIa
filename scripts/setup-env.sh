#!/usr/bin/env bash
# Copia *.env.example → *.env si no existen y avisa qué falta llenar.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

copy_if_missing() {
  local example="$1"
  local target="$2"
  if [[ -f "$target" ]]; then
    echo "✓ Ya existe: $target"
  elif [[ -f "$example" ]]; then
    cp "$example" "$target"
    echo "→ Creado $target desde $(basename "$example") — revisa y completa valores"
  else
    echo "⚠ No se encontró $example"
  fi
}

copy_if_missing "$ROOT/backend/.env.example" "$ROOT/backend/.env"
copy_if_missing "$ROOT/frontend/.env.example" "$ROOT/frontend/.env"

echo ""
echo "Variables a completar:"
echo "  backend/.env  → SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY"
echo "  frontend/.env → VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY"
echo ""
echo "Nota: usa la misma anon key en backend y frontend. NUNCA expongas service_role en el front."
