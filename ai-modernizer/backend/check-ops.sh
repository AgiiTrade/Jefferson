#!/bin/zsh
set -e
cd "$(dirname "$0")"

PORT=3114 \
NODE_ENV=development \
ACCESS_LOG_ENABLED=true \
SLOW_REQUEST_MS=50 \
HEALTHCHECK_TIMEOUT_MS=1000 \
node server.js >/tmp/ai-modernizer-3114.log 2>&1 &
pid=$!
trap 'kill $pid 2>/dev/null || true; wait $pid 2>/dev/null || true' EXIT
sleep 2

echo "HEALTH"
curl -s http://127.0.0.1:3114/api/health
printf '\n---\n'

echo "READY"
curl -s http://127.0.0.1:3114/api/ready
printf '\n---\n'

echo "OPS"
curl -s http://127.0.0.1:3114/api/ops
printf '\n---\n'

echo "ACCESS LOG TAIL"
tail -n 20 /tmp/ai-modernizer-3114.log
