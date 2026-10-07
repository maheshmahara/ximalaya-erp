from fastapi import APIRouter
from apps.api.src.modules.logistics.dispatch_service import LogisticsDispatchService

router = APIRouter(prefix="/logistics", tags=["Logistics & Warehouse Dispatch"])

@router.get("/manifests/sample")
async def get_sample_manifest():
    sample_allocations = [
        {
            "batch_code": "PK-2083-0459",
            "item_type": "Green Coffee Bean (Screen 16+ AA)",
            "quantity_kg": 600.0,
            "units": 10,  # 10 x 60kg GrainPro Jute Bags
            "eudr_plot_ref": "PLOT-GUL-042"
        },
        {
            "batch_code": "PK-2083-0460",
            "item_type": "Green Coffee Bean (Screen 16+ AA)",
            "quantity_kg": 300.0,
            "units": 5,   # 5 x 60kg GrainPro Jute Bags
            "eudr_plot_ref": "PLOT-PAL-101"
        }
    ]
    
    return LogisticsDispatchService.create_dispatch_manifest(
        dispatch_no="DSP-2083-0042",
        origin_facility="Butwal Central Dry Mill",
        destination_facility="Kathmandu Micro-Roastery",
        batch_allocations=sample_allocations,
        carrier_name="Himalayan Freight Logistics",
        vehicle_reg_no="BA 2 KHA 4921"
    )
