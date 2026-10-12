#!/usr/bin/env bash
set -uo pipefail

LOGFILE="/var/log/ximalaya_health.log"
COMPOSE_FILE="/opt/ximalaya-erp/infra/docker-compose.prod.yml"

send_alert() {
    local msg="$1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [CRITICAL ALERT] $msg" | tee -a "$LOGFILE"
}

# 1. Probe HTTP Healthz via Caddy
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/healthz || echo "000")
if [ "$HTTP_STATUS" != "200" ]; then
    send_alert "API Health Check Failed! HTTP code returned: $HTTP_STATUS"
fi

# 2. Check Container Runtime States
CONTAINERS=("api" "web" "caddy" "postgres" "redis")
for svc in "${CONTAINERS[@]}"; do
    STATE=$(docker compose -f "$COMPOSE_FILE" ps -q "$svc" 2>/dev/null | xargs -r docker inspect -f '{{.State.Status}}' 2>/dev/null || echo "missing")
    if [ "$STATE" != "running" ]; then
        send_alert "Container service [$svc] is NOT running! Current state: $STATE"
    fi
done

# 3. Check Root Disk Capacity
DISK_PCT=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_PCT" -ge 85 ]; then
    send_alert "High Disk Usage Warning! Root filesystem is at ${DISK_PCT}% capacity."
fi
