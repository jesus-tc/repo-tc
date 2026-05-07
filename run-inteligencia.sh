#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPT_FILE="$REPO_DIR/inteligencia-semanal.md"
OUTPUT_DIR="$REPO_DIR/outputs"
DATE=$(date +%Y-%m-%d)

mkdir -p "$OUTPUT_DIR"

echo "[$(date)] Iniciando Bloque de Inteligencia Semanal Trichter — $DATE"

claude --print \
  "$(cat "$PROMPT_FILE")

Fecha del reporte: $DATE
Guarda el resultado en outputs/inteligencia-$DATE.md" \
  > "$OUTPUT_DIR/inteligencia-$DATE.md"

echo "[$(date)] Reporte guardado en outputs/inteligencia-$DATE.md"
