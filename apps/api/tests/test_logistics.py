import pytest
from apps.api.src.modules.logistics.dispatch_service import LogisticsDispatchService

def test_warehouse_dispatch_manifest_generation():
    allocations = [
        {"batch_code": "LOT-A", "quantity_kg": 500.0, "units": 8, "eudr_plot_ref": "PLOT-GUL-042"},
        {"batch_code": "LOT-B", "quantity_kg": 250.0, "units": 4, "eudr_plot_ref": "PLOT-PAL-101"}
    ]

    manifest = LogisticsDispatchService.create_dispatch_manifest(
        dispatch_no="DSP-2083-0099",
        origin_facility="Butwal Mill",
        destination_facility="Kathmandu Hub",
        batch_allocations=allocations,
        carrier_name="Gorkha Express",
        vehicle_reg_no="LU 1 KHA 8822"
    )

    assert manifest["dispatch_no"] == "DSP-2083-0099"
    assert "DDS-NP-" in manifest["eudr_dds_reference"]
    assert manifest["total_weight_kg"] == 750.0
    assert manifest["total_units"] == 12
    assert manifest["dispatch_status"] == "SEALED_FOR_TRANSIT"
    assert len(manifest["allocations"]) == 2
