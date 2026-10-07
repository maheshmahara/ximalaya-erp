from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from apps.api.src.modules.roasting.shrinkage import RoastShrinkageService
from apps.api.src.modules.roasting.cupping_service import ScaCuppingService

router = APIRouter(prefix="/roasting", tags=["Roasting & Cupping Operations"])

class RoastBatchDropRequest(BaseModel):
    batch_id: str
    green_charge_weight_kg: float
    roasted_drop_weight_kg: float
    roast_profile_name: str
    roaster_model: str = "Electric Drum (ESP32 / Artisan)"

class ScaCuppingRequest(BaseModel):
    batch_id: str
    cupper_name: str
    fragrance_aroma: float = Field(..., ge=6.0, le=10.0)
    flavor: float = Field(..., ge=6.0, le=10.0)
    aftertaste: float = Field(..., ge=6.0, le=10.0)
    acidity: float = Field(..., ge=6.0, le=10.0)
    body: float = Field(..., ge=6.0, le=10.0)
    balance: float = Field(..., ge=6.0, le=10.0)
    overall: float = Field(..., ge=6.0, le=10.0)
    uniformity_cups: int = Field(5, ge=0, le=5)
    clean_cup_cups: int = Field(5, ge=0, le=5)
    sweetness_cups: int = Field(5, ge=0, le=5)
    taints_count: int = Field(0, ge=0)
    faults_count: int = Field(0, ge=0)
    flavor_notes: List[str] = ["Jasmine", "Bergamot", "Himalayan Honey"]

@router.post("/drop-settlement")
async def process_roast_drop(req: RoastBatchDropRequest):
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

@router.post("/cupping/evaluate")
async def evaluate_sca_cupping(req: ScaCuppingRequest):
    try:
        result = ScaCuppingService.calculate_score(
            fragrance_aroma=req.fragrance_aroma,
            flavor=req.flavor,
            aftertaste=req.aftertaste,
            acidity=req.acidity,
            body=req.body,
            balance=req.balance,
            overall=req.overall,
            uniformity_cups=req.uniformity_cups,
            clean_cup_cups=req.clean_cup_cups,
            sweetness_cups=req.sweetness_cups,
            taints_count=req.taints_count,
            faults_count=req.faults_count
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "batch_id": req.batch_id,
        "cupper_name": req.cupper_name,
        "flavor_notes": req.flavor_notes,
        "evaluation": result
    }
