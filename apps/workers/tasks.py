import os
import json
import logging
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta
from celery import Celery
from celery.schedules import crontab
import psycopg2
from psycopg2.extras import RealDictCursor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("XimalayaWorkers")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://xcc_admin:xcc_dev_pass_2083@localhost:5432/ximalaya_erp")
SMS_GATEWAY_URL = os.getenv("SMS_GATEWAY_URL", "https://api.sparrowsms.com/v2/sms/")
SMS_TOKEN = os.getenv("SMS_TOKEN", "mock_nepal_sms_token")

app = Celery("ximalaya_tasks", broker=REDIS_URL, backend=REDIS_URL)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kathmandu",
    enable_utc=True,
    beat_schedule={
        "check-eight-hour-pulping-deadlines-every-2-min": {
            "task": "tasks.monitor_cherry_pulping_deadlines",
            "schedule": 120.0,
        },
        "track-inbound-fleet-trips-every-5-min": {
            "task": "tasks.monitor_inbound_fleet_trips",
            "schedule": 300.0,
        },
        "evaluate-silo-repose-countdown-daily": {
            "task": "tasks.evaluate_silo_repose_maturities",
            "schedule": crontab(hour=1, minute=0),
        },
    },
)

def get_db():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

@app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_intake_receipt_sms(self, phone_number: str, farmer_name: str, lot_code: str, net_kg: str, amount_npr: str):
    message = (
        f"Ximalaya Coffee: Namaste {farmer_name}, tapai ko {net_kg} kg cherry "
        f"(Lot: {lot_code}) intake bhayo. Kul bhuktani: Rs {amount_npr}. Dhanyabad!"
    )
    logger.info(f"Dispatching SMS to {phone_number}: {message}")
    if SMS_TOKEN == "mock_nepal_sms_token":
        return {"status": "DELIVERED", "simulated": True}
    try:
        payload = urllib.parse.urlencode({
            "token": SMS_TOKEN, "from": "XIMALAYA", "to": phone_number, "text": message
        }).encode("utf-8")
        req = urllib.request.Request(SMS_GATEWAY_URL, data=payload, method="POST")
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        logger.error(f"Failed to send SMS: {exc}")
        raise self.retry(exc=exc)

@app.task
def monitor_cherry_pulping_deadlines():
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc)
    query = """
        SELECT id, master_lot_code, harvest_timestamp, pulp_by_deadline
        FROM intake_lots
        WHERE raw_variety = 'RED_CHERRY'
          AND status = 'WET_MILL_SPECIALTY_ELIGIBLE'
          AND pulp_by_deadline < %s;
    """
    cursor.execute(query, (now,))
    overdue_lots = cursor.fetchall()
    for lot in overdue_lots:
        cursor.execute("UPDATE intake_lots SET status = 'DELAYED_TRANSIT_COMMERCIAL' WHERE id = %s;", (lot["id"],))
    conn.commit()
    cursor.close()
    conn.close()
    return f"Evaluated 8-hour pulping. Diverted {len(overdue_lots)} lots."

@app.task
def monitor_inbound_fleet_trips():
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc)
    query = """
        SELECT id, trip_code, vehicle_plate, driver_name, dispatch_timestamp
        FROM transport_trips
        WHERE trip_status = 'DISPATCHED' AND arrival_timestamp IS NULL AND dispatch_timestamp < %s;
    """
    cursor.execute(query, (now - timedelta(hours=5),))
    flagged = cursor.fetchall()
    cursor.close()
    conn.close()
    return f"Fleet check complete. {len(flagged)} trips flagged."

@app.task
def evaluate_silo_repose_maturities():
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc)
    query = """
        SELECT id, parchment_lot_code FROM parchment_lots
        WHERE is_milling_locked = TRUE
          AND final_moisture_pct BETWEEN 10.00 AND 12.00
          AND repose_matures_at IS NOT NULL AND repose_matures_at <= %s;
    """
    cursor.execute(query, (now,))
    matured = cursor.fetchall()
    for lot in matured:
        cursor.execute("UPDATE parchment_lots SET is_milling_locked = FALSE WHERE id = %s;", (lot["id"],))
    conn.commit()
    cursor.close()
    conn.close()
    return f"Repose evaluation complete. {len(matured)} lots unlocked."
