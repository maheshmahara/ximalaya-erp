import pytest
from fastapi.testclient import TestClient
from apps.api.src.main import app

def test_packaging_run_compliant():
    client = TestClient(app)
    # 10.0 kg roasted input -> 140 boxes (140 * 70g = 9.8 kg) with 0.35% residual O2
    payload = {
        "packaging_batch_id": "PKG-2083-0459-D1",
        "parent_roast_batch_id": "BATCH-ESP32-001",
        "roasted_coffee_input_kg": 10.0,
        "finished_boxes_produced": 140,
        "residual_o2_reading_pct": 0.35,
        "damaged_sachets_count": 4
    }
    res = client.post("/packaging/runs", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "APPROVED_FOR_DISPATCH"
    assert data["is_o2_compliant"] is True
    assert data["finished_product_kg"] == 9.8
    assert data["reject_rate_pct"] < 1.0

def test_packaging_run_residual_o2_breach():
    client = TestClient(app)
    # Oxygen analyzer reading 0.85% (exceeds 0.50% ceiling) -> Triggers QA hold
    payload = {
        "packaging_batch_id": "PKG-2083-0459-D2",
        "parent_roast_batch_id": "BATCH-ESP32-002",
        "roasted_coffee_input_kg": 10.0,
        "finished_boxes_produced": 140,
        "residual_o2_reading_pct": 0.85,
        "damaged_sachets_count": 2
    }
    res = client.post("/packaging/runs", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "QA_HOLD"
    assert data["is_o2_compliant"] is False
    assert data["o2_status"] == "O2_BREACH_QUARANTINE"
