from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from apps.api.src.modules.packaging.service import PackagingService

router = APIRouter(prefix="/packaging", tags=["Packaging & Finished Goods"])

class PackagingRunRequest(BaseModel):
    packaging_batch_id: str
    parent_roast_batch_id: str
    roasted_coffee_input_kg: float = Field(..., gt=0)
    finished_boxes_produced: int = Field(..., gt=0)
    residual_o2_reading_pct: float = Field(..., ge=0.0)
    damaged_sachets_count: int = Field(0, ge=0)

@router.post("/runs")
async def record_packaging_run(req: PackagingRunRequest):
    try:
        result = PackagingService.process_packaging_run(
            packaging_batch_id=req.packaging_batch_id,
            parent_roast_batch_id=req.parent_roast_batch_id,
            roasted_coffee_input_kg=req.roasted_coffee_input_kg,
            finished_boxes_produced=req.finished_boxes_produced,
            residual_o2_reading_pct=req.residual_o2_reading_pct,
            damaged_sachets_count=req.damaged_sachets_count
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return result
