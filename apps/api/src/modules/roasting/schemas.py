from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field

class CuppingScoresheetSubmission(BaseModel):
    roast_batch_id: UUID
    q_grader_name: str = Field(..., min_length=2)
    session_date: date
    fragrance_aroma: Decimal = Field(..., ge=6.0, le=10.0)
    flavor: Decimal = Field(..., ge=6.0, le=10.0)
    aftertaste: Decimal = Field(..., ge=6.0, le=10.0)
    acidity: Decimal = Field(..., ge=6.0, le=10.0)
    body: Decimal = Field(..., ge=6.0, le=10.0)
    balance: Decimal = Field(..., ge=6.0, le=10.0)
    uniformity: Decimal = Field(default=Decimal("10.00"), ge=0.0, le=10.0)
    clean_cup: Decimal = Field(default=Decimal("10.00"), ge=0.0, le=10.0)
    sweetness: Decimal = Field(default=Decimal("10.00"), ge=0.0, le=10.0)
    defects_deduction: Decimal = Field(default=Decimal("0.00"), ge=0.0)
    overall_score: Decimal = Field(..., ge=6.0, le=10.0)
    tasting_notes: Optional[str] = None

class CuppingResultResponse(BaseModel):
    id: UUID
    roast_batch_code: str
    total_score: Decimal
    catalog_routing: str
    is_specialty: bool
    degassing_status: str
    created_at: datetime
