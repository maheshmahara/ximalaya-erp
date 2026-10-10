import pytest
from fastapi.testclient import TestClient
from apps.api.src.main import app

def test_roast_drop_settlement_compliant():
    client = TestClient(app)
    payload = {
        "batch_id": "BATCH-ESP32-001",
        "green_charge_weight_kg": 10.0,
        "roasted_drop_weight_kg": 8.5, # 15.0% shrinkage -> Within 13.5% - 17.0%
        "roast_profile_name": "Nordic Light Roast #45",
        "roaster_model": "Electric Drum (ESP32 / Artisan)"
    }
    res = client.post("/roasting/drop-settlement", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SETTLED"
    assert data["shrinkage_pct"] == 15.0
    assert data["is_compliant"] is True
    assert data["corridor_status"] == "OPTIMAL"

def test_roast_drop_settlement_breach():
    client = TestClient(app)
    payload = {
        "batch_id": "BATCH-ESP32-002",
        "green_charge_weight_kg": 10.0,
        "roasted_drop_weight_kg": 8.0, # 20.0% shrinkage -> Out of corridor
        "roast_profile_name": "Over-developed Dark",
        "roaster_model": "Electric Drum (ESP32 / Artisan)"
    }
    res = client.post("/roasting/drop-settlement", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["shrinkage_pct"] == 20.0
    assert data["is_compliant"] is False
    assert "CORRIDOR_BREACH" in data["corridor_status"]
