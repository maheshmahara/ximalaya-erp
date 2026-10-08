import pytest
from fastapi.testclient import TestClient
from apps.api.src.main import app
from apps.api.src.modules.logistics.inventory_service import WarehouseInventoryService

def test_invoice_creation_deducts_warehouse_stock():
    client = TestClient(app)
    
    # 1. Reset mock stock baseline
    WarehouseInventoryService.INVENTORY["SKU-DRIP-GUL-7X10G"] = {
        "sku": "SKU-DRIP-GUL-7X10G",
        "name": "Single-Serve Drip Box (7 x 10g) - Gulmi Honey",
        "gtin": "08901234567890",
        "on_hand": 100,
        "allocated": 0,
        "bin_location": "BIN-KTM-WH1-R04",
        "cost_npr_per_unit": 650.0,
        "retail_npr_per_unit": 1250.0
    }
    
    initial_stock = WarehouseInventoryService.get_stock("SKU-DRIP-GUL-7X10G")
    assert initial_stock["on_hand"] == 100
    assert initial_stock["available_to_promise"] == 100

    # 2. Issue tax invoice for 25 units
    invoice_payload = {
        "buyer_pan": "601928374",
        "buyer_name": "Himalayan Java Pvt Ltd",
        "items": [
            {
                "sku": "SKU-DRIP-GUL-7X10G",
                "description": "Gulmi Specialty Drip Box (7x10g)",
                "quantity": 25.0,
                "unit_price": 1250.0
            }
        ],
        "discount_amount": 0.0,
        "deduct_warehouse_stock": True
    }
    res = client.post("/sales/invoices", json=invoice_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["stock_depleted"] is True
    assert data["fiscal_summary"]["vat_amount"] > 0

    # 3. Check inventory was automatically decremented by 25
    updated_stock = WarehouseInventoryService.get_stock("SKU-DRIP-GUL-7X10G")
    assert updated_stock["on_hand"] == 75
    assert updated_stock["available_to_promise"] == 75

def test_invoice_creation_rejects_stock_over_allocation():
    client = TestClient(app)

    # Attempt to bill for 500 units when only 75 remain
    invoice_payload = {
        "buyer_pan": "601928374",
        "buyer_name": "Kathmandu Coffee Co",
        "items": [
            {
                "sku": "SKU-DRIP-GUL-7X10G",
                "description": "Gulmi Specialty Drip Box (7x10g)",
                "quantity": 500.0,
                "unit_price": 1250.0
            }
        ],
        "deduct_warehouse_stock": True
    }
    res = client.post("/sales/invoices", json=invoice_payload)
    assert res.status_code == 400
    assert "Stock breach" in res.json()["detail"]
