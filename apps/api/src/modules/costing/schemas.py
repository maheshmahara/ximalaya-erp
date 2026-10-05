from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, Field

class PackagingRunRequest(BaseModel):
    roast_batch_id: UUID
    fiscal_year: int = Field(default=2083)
    sku_type: str = Field(..., pattern="^(DRIP_BOX_7PCS|WHOLE_BEAN_1KG|WHOLE_BEAN_5KG|GROUND_250G)$")
    units_to_pack: int = Field(..., gt=0)
    best_before_months: int = Field(default=6, ge=1, le=24)
    packaging_line_operator: str

class ChannelQuoteEvaluation(BaseModel):
    channel: str
    target_margin_pct: Decimal
    commission_pct: Decimal
    delivery_per_box_npr: Decimal
    full_cost_npr: Decimal
    suggested_mrp_incl_vat: Decimal
    net_price_ex_vat: Decimal
    vat_13_pct: Decimal
    profit_per_box: Decimal

class PackagingRunResponse(BaseModel):
    id: UUID
    pack_lot_code: str
    sku_type: str
    units_produced: int
    bulk_coffee_consumed_kg: Decimal
    landed_cost_per_unit_npr: Decimal
    total_run_cost_npr: Decimal
    best_before_date: date
    qr_digital_link_url: str
    channel_pricing: List[ChannelQuoteEvaluation]
    created_at: datetime
