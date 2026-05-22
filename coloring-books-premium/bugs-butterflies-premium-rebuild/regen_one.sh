#!/usr/bin/env bash
set -uo pipefail
BOOK_ROOT="$(dirname "$(realpath "$0")")"
export BOOK_ROOT
exec bash "/Users/assistant/.openclaw/workspace/active/deploy/coloring-books-premium/hyperframes-pipeline/regen_one.sh" "$@"
