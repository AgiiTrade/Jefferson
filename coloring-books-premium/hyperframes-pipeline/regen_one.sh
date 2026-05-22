#!/usr/bin/env bash
set -uo pipefail

PAGE_NUM="$1"
THEME="$2"
ROOT="${BOOK_ROOT:-$(dirname "$(realpath "$0")")}"

GEN="${ROOT}/generated"
mkdir -p "$GEN"

PADDED=$(printf "%02d" "$PAGE_NUM")
FINAL_OUT="${GEN}/page-${PADDED}.png"

if [ -s "$FINAL_OUT" ]; then
  echo "[skip] page ${PADDED} already exists"
  exit 0
fi

PIPELINE_DIR="$(realpath "$(dirname "$0")")"
VENV="${PIPELINE_DIR}/.venv"
TEMPLATE_DIR="${PIPELINE_DIR}/page-template"
TMP_RAW="/tmp/coloring_raw_${PADDED}_$$.png"

ATTEMPTS=0
MAX_ATTEMPTS=3

while [ "$ATTEMPTS" -lt "$MAX_ATTEMPTS" ]; do
  ATTEMPTS=$((ATTEMPTS+1))
  echo "[gen] page ${PADDED} attempt ${ATTEMPTS}: ${THEME:0:80}"

  # Step 1: Generate line art via MLX
  if "${VENV}/bin/python" "${PIPELINE_DIR}/gen_lineart.py" \
        --theme "$THEME" \
        --out "$TMP_RAW"; then
    if [ -s "$TMP_RAW" ]; then
      # Step 2: Compose via HTML page template → final PNG
      echo "[compose] page ${PADDED}"
      if node "${TEMPLATE_DIR}/render.mjs" \
            --image "$TMP_RAW" \
            --out "$FINAL_OUT"; then
        rm -f "$TMP_RAW"
        if [ -s "$FINAL_OUT" ]; then
          echo "[ok] page ${PADDED} done"
          exit 0
        fi
      fi
    fi
  fi

  echo "[retry] page ${PADDED} failed attempt ${ATTEMPTS}"
  rm -f "$TMP_RAW"
  [ "$ATTEMPTS" -lt "$MAX_ATTEMPTS" ] && sleep 15
done

echo "[FAIL] page ${PADDED} after ${MAX_ATTEMPTS} attempts"
exit 1
