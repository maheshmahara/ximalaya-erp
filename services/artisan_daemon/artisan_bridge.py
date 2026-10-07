#!/usr/bin/env python3
"""
Artisan-Scope to Ximalaya Coffee ERP Hardware Bridge Daemon.
Reads real-time BT, ET, and RoR from Artisan or ESP32 and posts directly
to the FastAPI Roasting module.
"""

import sys
import time
import json
import urllib.request
import urllib.error

ERP_WEBHOOK_URL = "http://localhost:8000/roasting/artisan/hook"

def post_telemetry_to_erp(batch_id: str, bt: float, et: float, ror: float, heater: float = 0.0, fan: float = 50.0, event: str = None):
    payload = {
        "batch_id": batch_id,
        "bt": bt,
        "et": et,
        "ror": ror,
        "heater_duty": heater,
        "fan_pct": fan,
        "elapsed": int(time.time()),
        "event": event
    }
    
    req = urllib.request.Request(
        ERP_WEBHOOK_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=1.5) as response:
            return response.status == 200
    except urllib.error.URLError as e:
        print(f"[DAEMON WARNING] Failed to connect to ERP API: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    print("[DAEMON ONLINE] Artisan/ESP32 Forwarder Daemon initialized.")
    print(f"Target ERP Webhook: {ERP_WEBHOOK_URL}")
    print("Simulating test packet relay...")
    
    success = post_telemetry_to_erp(
        batch_id="BATCH-ESP32-001",
        bt=198.5,
        et=214.2,
        ror=6.5,
        heater=45.0,
        fan=80.0,
        event="FC_START"
    )
    print(f"Test transmission status: {'SUCCESS' if success else 'FAILED'}")
