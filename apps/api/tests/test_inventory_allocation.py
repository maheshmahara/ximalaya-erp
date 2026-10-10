import pytest
from fastapi.testclient import TestClient
from apps.api.src.main import app

def test_inventory_query_and_atp_calculation():
    client = TestClient(app)
    res = client.get("/logistics/inventory/SKU-DRIP-GUL-7X10G")
    assert res.status_code == 200
    data = res.json()
    assert data["sku"] == "SKU-DRIP-GUL-7X10G"
    # Initial on_hand: 140, allocated: 20 -> ATP = 120
    assert data["available_to_promise"] == 120

def test_inventory_allocation_success_and_breach():
    client = TestClient(app)
    # Successful allocation of 30 units
    alloc_res = client.post("/logistics/inventory/allocate", json={
        "sku": "SKU-DRIP-GUL-7X10G",
        "quantity": 30
    })
    assert alloc_res.status_code == 200
    alloc_data = alloc_res.json()
    assert alloc_data["allocated"] == 50
    assert alloc_data["available_to_promise"] == 90

    # Oversubscription breach attempt (allocating 500 units when ATP is 90)
    fail_res = client.post("/logistics/inventory/allocate", json={
        "sku": "SKU-DRIP-GUL-7X10G",
        "quantity": 500
    })
    assert fail_res.status_code == 400
    assert "Insufficient stock" in fail_res.json()["detail"]
