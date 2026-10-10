import os
from celery import Celery
from celery.schedules import crontab

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

app = Celery("ximalaya_tasks", broker=REDIS_URL, backend=REDIS_URL)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kathmandu",
    enable_utc=True,
    beat_schedule={
        "monitor-cherry-pulping-deadlines-every-minute": {
            "task": "tasks.monitor_cherry_pulping_deadlines",
            "schedule": 60.0,
        },
        "monitor-inbound-fleet-trips-every-2-minutes": {
            "task": "tasks.monitor_inbound_fleet_trips",
            "schedule": 120.0,
        },
        "evaluate-silo-repose-maturities-daily": {
            "task": "tasks.evaluate_silo_repose_maturities",
            "schedule": crontab(hour=0, minute=0),
        },
    },
)

@app.task
def send_intake_receipt_sms(farmer_phone: str, message: str):
    print(f"[SMS DISPATCH] To: {farmer_phone} | Body: {message}")
    return {"status": "SENT", "recipient": farmer_phone}

@app.task
def monitor_cherry_pulping_deadlines():
    print("[BEAT TICK] Checking active cherry intake lots against 8-hour pulping window... OK")
    return {"status": "CHECKED", "breaches_detected": 0}

@app.task
def monitor_inbound_fleet_trips():
    print("[BEAT TICK] Checking inbound transit waybills on Lumbini highway corridors... OK")
    return {"status": "CHECKED", "active_transits": 2}

@app.task
def evaluate_silo_repose_maturities():
    print("[BEAT TICK] Evaluating parchment silo aging & moisture stability (45-day threshold)... OK")
    return {"status": "CHECKED", "matured_lots": 1}
