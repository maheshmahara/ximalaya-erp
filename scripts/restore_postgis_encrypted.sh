#!/usr/bin/env bash
# ==============================================================================
# Ximalaya Coffee ERP - Decryption & Restore Utility
# Usage: ./restore_postgis_encrypted.sh <path_to_file.dump.enc>
# ==============================================================================

set -eo pipefail

if [ -z "$1" ]; then
    echo "Usage: $0 /var/backups/ximalaya-erp/ximalaya_erp_YYYYMMDD_HHMMSS.dump.enc"
    exit 1
fi

ENC_FILE="$1"
PASSPHRASE_FILE="/opt/ximalaya-erp/.backup_passphrase"
OUT_DUMP="${ENC_FILE%.enc}"

if [ ! -f "${ENC_FILE}" ]; then
    echo "[!] Encrypted file not found: ${ENC_FILE}"
    exit 1
fi

echo "[*] Decrypting ${ENC_FILE}..."
openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 \
  -in "${ENC_FILE}" \
  -out "${OUT_DUMP}" \
  -pass file:"${PASSPHRASE_FILE}"

echo "[✓] Decryption successful: ${OUT_DUMP}"
echo "[*] Verifying TOC with pg_restore list..."
docker compose -f /opt/ximalaya-erp/infra/docker-compose.prod.yml exec -T postgres \
  pg_restore -l < "${OUT_DUMP}" | head -n 25

echo ""
echo "[i] To perform a full database restore into postgres:"
echo "    cat ${OUT_DUMP} | docker compose -f /opt/ximalaya-erp/infra/docker-compose.prod.yml exec -T postgres pg_restore -U xcc_admin -d ximalaya_erp --clean --if-exists"
