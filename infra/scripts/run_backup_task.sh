#!/bin/sh
set -eu

BACKUP_DIR="/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
TMP_DUMP="/tmp/dump_${TIMESTAMP}.sql"
BACKUP_FILE="${BACKUP_DIR}/ximalaya_erp_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Starting automated PostGIS hot dump..."
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
  -h "${POSTGRES_HOST:-postgres}" \
  -U "${POSTGRES_USER:-xcc_admin}" \
  -d "${POSTGRES_DB:-ximalaya_erp}" \
  -f "${TMP_DUMP}"

gzip -c "${TMP_DUMP}" > "${BACKUP_FILE}"
rm -f "${TMP_DUMP}"

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Backup created successfully: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# Retention: Remove backups older than 14 days and zero-byte archives
find "${BACKUP_DIR}" -name "ximalaya_erp_*.sql.gz" -size -100c -delete
find "${BACKUP_DIR}" -name "ximalaya_erp_*.sql.gz" -type f -mtime +14 -delete
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Retention check complete."
