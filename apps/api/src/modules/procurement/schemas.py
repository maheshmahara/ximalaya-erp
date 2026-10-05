from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict
from uuid import UUID
from pydantic import BaseModel, Field

class SupplierResponse(BaseModel):
    id: UUID
    supplier_code: str
    full_name: str
    supplier_type: str
    district: str
    altitude_masl: int
    payment_method_pref: str
    name_on_bag_consent: bool

class IntakeCreateRequest(BaseModel):
    idempotency_key: str
    supplier_id: UUID
    plot_id: Optional[UUID] = None
    fiscal_year: int = Field(default=2083)
    raw_variety: str = Field(..., pattern="^(RED_CHERRY|DRY_CHERRY|PARCHMENT|GREEN_BEANS|COMMERCIAL_BEANS)$")
    harvest_timestamp: datetime
    gross_weight_kg: Decimal = Field(..., max_digits=12, decimal_places=3, gt=0)
    tare_weight_kg: Decimal = Field(default=Decimal("0.000"), max_digits=12, decimal_places=3, ge=0)
    brix_reading: Decimal = Field(..., max_digits=4, decimal_places=1, ge=0)
    floaters_pct: Decimal = Field(..., max_digits=5, decimal_places=2, ge=0)
    defect_pct: Decimal = Field(..., max_digits=5, decimal_places=2, ge=0)
    base_rate_npr: Decimal = Field(..., max_digits=14, decimal_places=2, ge=0)

class IntakeRecordResponse(BaseModel):
    id: UUID
    master_lot_code: str
    supplier_code: str
    farmer_name: str
    net_weight_kg: Decimal
    assigned_grade: str
    rate_per_kg_npr: Decimal
    total_payout_npr: Decimal
    status: str
    qr_tag_content: str

class QCInspectionSubmission(BaseModel):
    moisture_pct: Decimal = Field(..., max_digits=4, decimal_places=2, ge=8.0, le=25.0)
    water_activity_aw: Decimal = Field(..., max_digits=4, decimal_places=3, ge=0.300, le=0.900)
    defect_count_per_350g: int = Field(..., ge=0)
    category_1_defects: int = Field(default=0, ge=0)
    category_2_defects: int = Field(default=0, ge=0)
    density_g_per_l: Decimal = Field(..., max_digits=6, decimal_places=2, gt=0)
