import hmac
import hashlib
import json
from decimal import Decimal
from typing import Dict, Any
from fastapi import APIRouter, Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from apps.api.src.core.database import get_db_session
from apps.api.src.modules.roasting.schemas import CuppingScoresheetSubmission, CuppingResultResponse
from apps.api.src.modules.roasting.service import RoastingCuppingEngine

router = APIRouter(prefix="/integrations/xros", tags=["XROS Roaster Integration"])

XROS_WEBHOOK_SECRET = "xros_live_secret_nepal_2083"

@router.post("/roast-drop", status_code=status.HTTP_200_OK)
async def handle_xros_roast_drop(
    payload: Dict[str, Any],
    x_xros_signature: str = Header(None, alias="X-XROS-Signature"),
    db: AsyncSession = Depends(get_db_session)
):
    if not x_xros_signature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing HMAC signature header X-XROS-Signature."
        )

    raw_body = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    expected_sig = hmac.new(
        XROS_WEBHOOK_SECRET.encode('utf-8'),
        raw_body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(f"sha256={expected_sig}", x_xros_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid cryptographic HMAC signature."
        )

    # 13.5% - 17.0% Shrinkage Corridor Validation
    charged_weight = Decimal(str(payload.get("green_charged_weight_kg", 0)))
    dropped_weight = Decimal(str(payload.get("roasted_dropped_weight_kg", 0)))

    if charged_weight <= 0:
        raise HTTPException(status_code=400, detail="Invalid charged weight.")

    shrinkage_pct = ((charged_weight - dropped_weight) / charged_weight) * Decimal("100.00")
    qa_hold = not (Decimal("13.50") <= shrinkage_pct <= Decimal("17.00"))

    # Update or flag batch
    return {
        "status": "ACCEPTED",
        "batch_code": payload.get("roast_batch_code"),
        "shrinkage_pct": float(shrinkage_pct.quantize(Decimal("0.01"))),
        "qa_hold": qa_hold,
    }

@router.post("/cupping", response_model=CuppingResultResponse, status_code=status.HTTP_201_CREATED)
async def submit_cupping_scoresheet(
    payload: CuppingScoresheetSubmission,
    db: AsyncSession = Depends(get_db_session)
):
    """
    SCA Digital Cupping Evaluation:
    Evaluates 10-metric scoresheet and routes batch to Specialty (>=84),
    Estate Grade 1 (80-83.75), or Commercial Blend (<80).
    """
    engine = RoastingCuppingEngine(db)
    return await engine.submit_cupping_scoresheet(payload)
