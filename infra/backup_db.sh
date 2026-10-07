#!/bin/bash
set -eo pipefail

BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/ximalaya_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting PostGIS database backup..."
pg_dump -h postgres -U postgres -d ximalaya_db | gzip > "${BACKUP_FILE}"
echo "[$(date)] Backup completed successfully: ${BACKUP_FILE} ($(du -sh "${BACKUP_FILE}" | cut -f1))"

# Retention policy: Remove backups older than 14 days
find "${BACKUP_DIR}" -type f -name "ximalaya_db_*.sql.gz" -mtime +14 -delete
echo "[$(date)] Rotational cleanup executed (14-day retention)."
