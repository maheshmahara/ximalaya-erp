#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_FILE="${PROJECT_ROOT}/backups/ximalaya_erp_$(date +%Y_m%d+HDMMSS).sql.gz"

mkdir -p "${PROJECT_ROOT}/backups"

PG_USER=$(docker compose -f "${PROJECT_ROOT}/infra/docker-compose.prod.yml" exec -T postgres sh -c 'echo "${POSTGRES_USER:-postgres}"' | tr -d '\r')
PG_DB=$(docker compose -f "${PROJECT_ROOT}/infra/docker-compose.prod.yml" exec -T postgres sh -c 'echo "${POSTGRES_DB:-ximalaya_erp}"' | tr -d '\r')

echo "📦 Creating PostGIS database backup (User: ${PG_USER}, DB: ${PG_DB})..."
docker compose -f "${PROJECT_ROOT}/infra/docker-compose.prod.yml" exec -T postgres pg_dump -U "${PG_USER}" -d "${PG_DB}" | gzip > "${BACKUP_FILE}"

echo "✅ Backup successfully saved to: ${BACKUP_FILE}"
ls -lh "${BACKUP_FILE}"
