import pytest
from fastapi.testclient import TestClient
from apps.api.src.main import app

def test_eudr_dds_generation_compliant():
    client = TestClient(app)
    payload = {
        "reference_number": "DDS-2026-NPL-0042",
        "importer_eori": "DE123456789012345",
        "exporter_name": "Ximalaya Coffee Pvt Ltd",
        "hs_code": "0901.21",
        "net_mass_kg": 500.0,
        "cadastral_plot_ids": ["PLOT-GUL-042", "PLOT-GUL-043"]
    }
    res = client.post("/logistics/export/dds", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["dds_reference"] == "DDS-2026-NPL-0042"
    assert data["commodity"]["net_mass_kg"] == 500.0
    assert data["commodity"]["segregation_model"] == "IDENTITY_PRESERVED"
    assert len(data["geolocation_parcels"]) == 2
    assert data["verification_status"] == "VALIDATED_DEFORESTATION_FREE"

def test_eudr_dds_generation_invalid_reference():
    client = TestClient(app)
    payload = {
        "reference_number": "INVALID-REF-999",
        "importer_eori": "DE123456789012345",
        "net_mass_kg": 100.0,
        "cadastral_plot_ids": ["PLOT-GUL-042"]
    }
    res = client.post("/logistics/export/dds", json=payload)
    assert res.status_code == 400
    assert "Reference number must follow standard format" in res.json()["detail"]
