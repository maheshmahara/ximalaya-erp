from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, Optional
from uuid import UUID
from pydantic import BaseModel, Field

class DryMillingRunRequest(BaseModel):
    parchment_lot_id: UUID
    fiscal_year: int = Field(default=2083)
    parchment_input_kg: Decimal = Field(..., max_digits=12, decimal_places=3, gt=0)
    screen_distribution_kg: Dict[str, Decimal] = Field(
        ...,
        description="Weights for screen_19, screen_18, screen_17, screen_16, screen_15, screen_14, peaberry"
    )
    husk_chaff_kg: Decimal = Field(..., max_digits=12, decimal_places=3, ge=0)
    defects_rejections_kg: Decimal = Field(..., max_digits=12, decimal_places=3, ge=0)
    calibrated_moisture_pct: Decimal = Field(..., max_digits=4, decimal_places=2)
    calibrated_water_activity_aw: Decimal = Field(..., max_digits=4, decimal_places=3)
    density_g_per_l: Decimal = Field(..., max_digits=6, decimal_places=2, gt=0)
    operator_notes: Optional[str] = None

class DryMillingAuditResponse(BaseModel):
    parchment_lot_code: str
    input_kg: Decimal
    total_green_kg: Decimal
    total_output_kg: Decimal
    mass_balance_variance_kg: Decimal
    variance_pct: Decimal
    passed_mass_balance: bool
    requires_supervisor_override: bool
    status: str
    generated_green_lots: Dict[str, str]
    created_at: datetime
