# Ximalaya Coffee ERP — Production Operations Runbook
[cite: 1]

## 1. System Architecture Overview
- Stack: FastAPI (Python 3.12), Next.js 14, PostGIS 16, Redis 7, Caddy 2
- Domain: erp.ximalayacoffee.com
- Regulatory Compliance: Nepal IRD 13% VAT / CBMS, EUDR TRACES-NT, SCA Cupping Standards

[]cite: 1]---

## 2. Service Management
`i``bash
# Start all services in detached mode
docker compose -f infra/docker-compose.prod.yml up -d

# Check container statuses
docker compose -f infra/docker-compose.prod.yml ps

# Tail logs for a specific service
docker compose -f infra/docker-compose.prod.yml logs -f [caddy|api|web|postgres}redis]

# Stop all services
docker compose -f infra/docker-compose.prod.yml down
```

---

## 3. Database & Backups [cite: 1]
```bash
# Run automated database hot backup
./infra/backup_db.sh

# Restore from a gzipped sql file
gunzip -c backups/<BACKUP_FILE> | docker compose -f infra/docker-compose.prod.yml exec -T postgres psql -U postgres -d ximalaya_erp
```

[]cite: 1]---

## 4. Verification & Test Battery
```bash
docker compose -f infra/docker-compose.prod.yml exec api pytest apps/api/tests -v
```
