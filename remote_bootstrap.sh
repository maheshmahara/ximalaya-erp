#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/ximalaya-erp"
REPO_URL="https://github.com/maheshmahara/ximalaya-erp.git"
BRANCH="main"
CURRENT_USER="${SUDO_USER:-$USER}"

echo "=== [1/5] Updating packages and installing Docker ==="
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release git ufw gzip jq

if ! command -v docker &> /dev/null; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
fi

# Add the standard user to the docker group so sudo is not required for daily commands
usermod -aG docker "${CURRENT_USER}" || true

echo "=== [2/5] Synchronizing repository in ${APP_DIR} ==="
if [ ! -d "${APP_DIR}" ]; then
    git clone -b "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
else
    cd "${APP_DIR}"
    git fetch origin "${BRANCH}"
    git checkout "${BRANCH}"
    git pull origin "${BRANCH}"
fi

chown -R "${CURRENT_USER}:${CURRENT_USER}" "${APP_DIR}"
cd "${APP_DIR}"

echo "=== [3/5] Configuring environment for LAN IP (192.168.5.109) ==="
cat << 'ENV' > .env
ENVIRONMENT=production
DOMAIN=192.168.5.109
POSTGRES_USER=xcc_admin
POSTGRES_PASSWORD=xcc_dev_pass_2083
POSTGRES_DB=ximalaya_erp
DATABASE_URL=postgresql+asyncpg://xcc_admin:xcc_dev_pass_2083@postgres:5432/ximalaya_erp
REDIS_URL=redis://redis:6379/0
SECRET_KEY=9f823a812b9102c8901f4e190283c7482a9381726a8d7162e091273918237192
NEXT_PUBLIC_API_URL=http://192.168.5.109/api
ENV

echo "=== [4/5] Launching Docker Compose stack ==="
docker compose -f infra/docker-compose.prod.yml down --remove-orphans || true
docker compose -f infra/docker-compose.prod.yml up -d --build

echo "=== [5/5] Waiting for services to initialize... ==="
sleep 10

echo "🌱 Seeding demo fixtures on remote instance..."
docker compose -f infra/docker-compose.prod.yml exec -T api python -m apps.api.src.scripts.seed_demo_data

echo "🧪 Running compliance test battery on remote instance..."
docker compose -f infra/docker-compose.prod.yml exec -T api pytest apps/api/tests -v

echo "================================================================="
echo "✅ Ximalaya ERP is live on the LAN at http://192.168.5.109"
echo "================================================================="
