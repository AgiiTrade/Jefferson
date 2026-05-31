#!/usr/bin/env bash
# install-cron.sh — idempotent cron installer for runner.py
# Appends a */30 * * * * entry to crontab (checks first to avoid duplicates)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNNER="$SCRIPT_DIR/runner.py"
LOG="$SCRIPT_DIR/runner.log"
PYTHON="${PYTHON:-python3}"
CRON_ENTRY="*/30 * * * * $PYTHON $RUNNER >> $LOG 2>&1"
MARKER="runner.py"

# Check if the entry already exists
if crontab -l 2>/dev/null | grep -qF "$MARKER"; then
    echo "[OK] Cron entry already installed — nothing changed."
    echo "     Current matching line:"
    crontab -l 2>/dev/null | grep "$MARKER"
    exit 0
fi

# Append to existing crontab
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

if crontab -l 2>/dev/null | grep -qF "$MARKER"; then
    echo "[OK] Cron entry installed successfully."
    echo "     $CRON_ENTRY"
    echo ""
    echo "     Runner will execute every 30 minutes."
    echo "     Logs: $LOG"
    echo ""
    echo "     Required env vars — set these in your shell profile (~/.zshrc or ~/.bashrc)"
    echo "     before the runner can post to any platform:"
    echo ""
    echo "     Pinterest:  PINTEREST_ACCESS_TOKEN  PINTEREST_BOARD_ID"
    echo "     Facebook:   FB_PAGE_TOKEN  FB_PAGE_ID"
    echo "     Instagram:  IG_USER_ID  IG_ACCESS_TOKEN  IG_IMAGE_BASE_URL"
    echo "     Twitter/X:  X_BEARER  X_API_KEY  X_API_SECRET  X_ACCESS_TOKEN  X_ACCESS_SECRET"
    echo ""
    echo "     TikTok: no API — upload manually (see marketing/cron/README.md)"
else
    echo "[ERROR] Failed to install cron entry. Try running manually:"
    echo "  crontab -e"
    echo "  Then add: $CRON_ENTRY"
    exit 1
fi
