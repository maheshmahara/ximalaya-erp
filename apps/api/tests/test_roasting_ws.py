import pytest
from fastapi.testclient import TestClient
from apps.api.src.main import app
from apps.api.src.modules.roasting.telemetry_service import RoastingTelemetryService

def test_esp32_artisan_packet_parsing():
    raw_packet = {
        "bt": 165.4,
        "et": 182.1,
        "ror": 11.2,
        "heater_duty": 75.0,
        "fan_pct": 60.0,
        "elapsed": 310,
        "event": None
    }
    parsed = RoastingTelemetryService.parse_artisan_esp32_packet(raw_packet)
    assert parsed["source"] == "ESP32_ARTISAN"
    assert parsed["bean_temp_c"] == 165.4
    assert parsed["phase"] == "MAILLARD"
    assert parsed["heater_duty_pct"] == 75.0

def test_artisan_http_webhook_ingestion():
    client = TestClient(app)
    payload = {
        "batch_id": "BATCH-ESP32-001",
        "bt": 198.5,
        "et": 215.0,
        "ror": 6.5,
        "heater_duty": 45.0,
        "fan_pct": 80.0,
        "elapsed": 510,
        "event": "FC_START"
    }
    response = client.post("/roasting/artisan/hook", json=payload)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["status"] == "recorded"
    assert res_json["data"]["phase"] == "DEVELOPMENT"

def test_roasting_websocket_esp32_stream():
    client = TestClient(app)
    with client.websocket_connect("/roasting/ws/BATCH-ESP32-001") as websocket:
        data = websocket.receive_json()
        assert data["batch_id"] == "BATCH-ESP32-001"
        assert data["source"] == "ESP32_ARTISAN"
        assert "heater_duty_pct" in data
        assert "bean_temp_c" in data
