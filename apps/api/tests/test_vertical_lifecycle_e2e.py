import pytest
from fastapi.testclient import TestClient
from apps.api.src.main import app
from apps.api.src.modules.logistics.inventory_service import WarehouseInventoryService

def test_complete_vertical_lifecycle_journey():
    client = TestClient(app)

    # 1. SYSTEM HEALTH CHECK
    health_res = client.get("/healthz")
    assert health_res.status_code == 200

    # 2. ROASTING TELEMETRY & CORRIDOR CHECK
    drop_payload = {
        "batch_id": "BATCH-E2E-LIFECYCLE-001",
        "green_charge_weight_kg": 10.0,
        "roasted_drop_weight_kg": 8.5,
        "roast_profile_name": "Nordic Light Roast #45",
        "roaster_model": "Electric Drum (ESP32 / Artisan)"
    }
    roast_res = client.post("/roasting/drop-settlement", json=drop_payload)
    assert roast_res.status_code == 200
    roast_data = roast_res.json()
    assert roast_data["status"] == "SETTLED"
    assert roast_data["shrinkage_pct"] == 15.0
    assert roast_data["is_compliant"] is True
    assert roast_data["corridor_status"] == "OPTIMAL"

    # 3. SCA SENSORY CUPPING CERTIFICATION
    cupping_payload = {
        "batch_id": "BATCH-E2E-LIFECYCLE-001",
        "cupper_name": "Q-Grader Mahesh Mahara",
        "fragrance_aroma": 8.75,
        "flavor": 8.75,
        "aftertaste": 8.50,
        "acidity": 8.75,
        "body": 8.25,
        "balance": 8.50,
        "overall": 8.75,
        "uniformity_cups": 5,
        "clean_cup_cups": 5,
        "sweetness_cups": 5,
        "flavor_notes": ["Apricot", "Orange Blossom", "Raw Cane Sugar"]
    }
    cup_res = client.post("/roasting/cupping/evaluate", json=cupping_payload)
    assert cup_res.status_code == 200
    cup_data = cup_res.json()
    eval_res = cup_data["evaluation"]
    assert eval_res["total_score"] >= 85.0
    assert eval_res["is_specialty"] is True

    # 4. NITROGEN-FLUSHED PACKAGING
    pkg_payload = {
        "packaging_batch_id": "PKG-E2E-2083-D1",
        "parent_roast_batch_id": "BATCH-E2E-LIFECYCLE-001",
        "roasted_coffee_input_kg": 8.5,
        "finished_boxes_produced": 120,
        "residual_o2_reading_pct": 0.28,
        "damaged_sachets_count": 2
    }
    pkg_res = client.post("/packaging/runs", json=pkg_payload)
    assert pkg_res.status_code == 200
    pkg_data = pkg_res.json()
    assert pkg_data["status"] == "APPROVED_FOR_DISPATCH"
    assert pkg_data["is_o2_compliant"] is True

    # 5. WHOLESALE POS INVOICING & INVENTORY DEDUCTION
    WarehouseInventoryService.INVENTORY["SKU-DRIP-GUL-7X10G"] = {
        "sku": "SKU-DRIP-GUL-7X10G",
        "name": "Single-Serve Drip Box (7 x 10g) - Gulmi Honey",
        "gtin": "08901234567890",
        "on_hand": 120,
        "allocated": 0,
        "bin_location": "BIN-KTM-WH1-R04",
        "cost_npr_per_unit": 650.0,
        "retail_npr_per_unit": 1250.0
    }

    invoice_payload = {
        "buyer_pan": "601928374",
        "buyer_name": "Shangri-La Speciality Coffee",
        "items": [
            {
                "sku": "SKU-DRIP-GUL-7X10G",
                "description": "Gulmi Single-Origin Drip Box (7x10g)",
                "quantity": 20.0,
                "unit_price": 1250.0
            }
        ],
        "discount_amount": 500.0,
        "deduct_warehouse_stock": True
    }
    inv_res = client.post("/sales/invoices", json=invoice_payload)
    assert inv_res.status_code == 200
    inv_data = inv_res.json()
    assert inv_data["fiscal_summary"]["vat_amount"] > 0
    assert inv_data["stock_depleted"] is True

    # Check inventory decremented from 120 to 100
    stock_res = client.get("/logistics/inventory/SKU-DRIP-GUL-7X10G")
    assert stock_res.status_code == 200
    assert stock_res.json()["on_hand"] == 100
    assert stock_res.json()["available_to_promise"] == 100

    # 6. EUDR DDS STATEMENT & DISPATCH MANIFEST GENERATION
    dds_payload = {
        "reference_number": "DDS-2026-NPL-0042",
        "importer_eori": "DE987654321012345",
        "exporter_name": "Ximalaya Coffee Pvt Ltd",
        "hs_code": "0901.21",
        "net_mass_kg": 7.0,
        "cadastral_plot_ids": ["PLOT-GUL-042"]
    }
    dds_res = client.post("/logistics/export/dds", json=dds_payload)
    assert dds_res.status_code == 200
    assert dds_res.json()["verification_status"] == "VALIDATED_DEFORESTATION_FREE"

    # 7. MANIFEST PDF GENERATION
    pdf_res = client.get("/logistics/dispatch/DSP-2083-0042/manifest.pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert b"%PDF" in pdf_res.content
