#!/usr/bin/env bash
# ==============================================================================
# Ximalaya Coffee ERP - Production PostGIS Automated Encrypted Backup
# Performs atomic pg_dump (-Fc), OpenSSL AES-256-CBC encryption, local retention
# pruning, and generates checksum verification manifests.
# ==============================================================================

set -eo pipefail

BACKUP_DIR="/var/backups/ximalaya-erp"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TEMP_DUMP="/tmp/ximalaya_erp_${TIMESTAMP}.dump"
ENC_TARGET="${BACKUP_DIR}/ximalaya_erp_${TIMESTAMP}.dump.enc"
SHA_TARGET="${BACKUP_DIR}/ximalaya_erp_${TIMESTAMP}.sha256"

# Load secret encryption passphrase from environment or secure vault file
PASSPHRASE_FILE="/opt/ximalaya-erp/.backup_passphrase"

if [ ! -f "${PASSPHRASE_FILE}" ]; then
    echo "[!] Error: Passphrase file ${PASSPHRASE_FILE} not found."
    exit 1
fi

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

echo "[*] [${TIMESTAMP}] Starting PostGIS dump from postgres container..."
docker compose -f /opt/ximalaya-erp/infra/docker-compose.prod.yml exec -T postgres \
  pg_dump -U xcc_admin -d ximalaya_erp -Fc -Z 6 > "${TEMP_DUMP}"

DUMP_SIZE=$(du -h "${TEMP_DUMP}" | cut -f1)
echo "[✓] Database dump complete (${DUMP_SIZE}). Encrypting with AES-256-CBC..."

# Encrypt dump using OpenSSL PBKDF2 key derivation
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
  -in "${TEMP_DUMP}" \
  -out "${ENC_TARGET}" \
  -pass file:"${PASSPHRASE_FILE}"

# Remove raw unencrypted dump immediately
rm -f "${TEMP_DUMP}"

# Generate SHA256 checksum for audit and integrity verification
sha256sum "${ENC_TARGET}" > "${SHA_TARGET}"
chmod 600 "${ENC_TARGET}" "${SHA_TARGET}"

echo "[✓] Encrypted snapshot generated:"
echo "    File:     ${ENC_TARGET}"
echo "    Checksum: $(cat "${SHA_TARGET}")"

# Local retention policy: purge backup archives older than 14 days
echo "[*] Enforcing 14-day local retention policy..."
find "${BACKUP_DIR}" -name "ximalaya_erp_*.dump.enc" -type f -mtime +14 -delete
find "${BACKUP_DIR}" -name "ximalaya_erp_*.sha256" -type f -mtime +14 -delete

echo "[✓] Backup cycle finished successfully."
