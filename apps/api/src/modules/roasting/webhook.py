import hmac
import hashlib
from decimal import Decimal
from uuid import UUID
from fastapi import APIRouter, Header, HTTPException, Request, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/integrations/xros", tags=["Roaster Integrations"])

class XrosRoastDropPayload(BaseModel):
    roast_batch_code: str
    green_lot_id: UUID
    green_charged_weight_kg: Decimal = Field(..., gt=0)
    roasted_dropped_weight_kg: Decimal = Field(..., gt=0)
    charge_temp_celsius: Decimal
    drop_temp_celsius: Decimal
    roast_duration_seconds: int
    agtron_color_score: Decimal

def verify_hmac(raw_body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

@router.post("/roast")
async def ingest_xros_roast(request: Request, payload: XrosRoastDropPayload, x_xros_signature: str = Header(..., alias="X-XROS-Signature")):
    raw_body = await request.body()
    ROASTER_SECRET = "XIMALAYA_XROS_WEBHOOK_SECRET_KEY_PROD"
    if not verify_hmac(raw_body, x_xros_signature, ROASTER_SECRET):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid HMAC Signature")

    shrinkage = ((payload.green_charged_weight_kg - payload.roasted_dropped_weight_kg) / payload.green_charged_weight_kg) * Decimal("100.00")
    qa_hold = not (Decimal("13.50") <= shrinkage <= Decimal("17.00"))
    return {
        "roast_batch_code": payload.roast_batch_code,
        "shrinkage_pct": f"{shrinkage:.2f}%",
        "qa_hold": qa_hold,
        "status": "HOLD_PENDING_REVIEW" if qa_hold else "STAGED_FOR_DEGASSING"
    }
