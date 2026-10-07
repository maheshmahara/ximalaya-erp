from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from apps.api.src.modules.roasting.shrinkage import RoastShrinkageService

router = APIRouter(prefix="/roasting", tags=["Roasting Operations"])

class RoastBatchDropRequest(BaseModel):
    batch_id: str
    green_charge_weight_kg: float
    roasted_drop_weight_kg: float
    roast_profile_name: str
    roaster_model: str = "Electric Drum (ESP32 / Artisan)"

@router.post("/drop-settlement")
async def process_roast_drop(req: RoastBatchDropRequest):
    """
    Finalizes a roast batch, computes exact physical shrinkage,
    and validates compliance against the 13.5% - 17.0% corridor.
    """
    try:
        shrinkage_eval = RoastShrinkageService.evaluate_shrinkage(
            green_weight_kg=req.green_charge_weight_kg,
            roasted_weight_kg=req.roasted_drop_weight_kg
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "status": "SETTLED",
        "batch_id": req.batch_id,
        "roaster_model": req.roaster_model,
        "profile": req.roast_profile_name,
        "charge_kg": req.green_charge_weight_kg,
        "drop_kg": req.roasted_drop_weight_kg,
        "shrinkage_pct": shrinkage_eval["shrinkage_pct"],
        "corridor_status": shrinkage_eval["status"],
        "is_compliant": shrinkage_eval["is_compliant"]
    }
