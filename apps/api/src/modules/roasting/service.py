from decimal import Decimal
from typing import Dict, Any
from uuid import UUID
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from apps.api.src.modules.roasting.schemas import CuppingScoresheetSubmission

class RoastingCuppingEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def submit_cupping_scoresheet(self, payload: CuppingScoresheetSubmission) -> Dict[str, Any]:
        # Fetch Roast Batch
        batch_query = text("""
            SELECT id, roast_batch_code, qa_hold, degassing_released_at
            FROM roast_batches
            WHERE id = :batch_id
        """)
        batch_res = await self.db.execute(batch_query, {"batch_id": payload.roast_batch_id})
        batch = batch_res.mappings().first()

        if not batch:
            raise HTTPException(status_code=404, detail="Roast batch not found.")

        # Compute 100-Point SCA Total
        total_score = (
            payload.fragrance_aroma + payload.flavor + payload.aftertaste +
            payload.acidity + payload.body + payload.balance +
            payload.uniformity + payload.clean_cup + payload.sweetness +
            payload.overall_score - payload.defects_deduction
        ).quantize(Decimal("0.01"))

        # Dynamic Catalog Routing Rule
        if total_score >= Decimal("84.00"):
            catalog_routing = "SINGLE_ORIGIN_SPECIALTY"
            is_specialty = True
        elif total_score >= Decimal("80.00"):
            catalog_routing = "ESTATE_GRADE_1"
            is_specialty = True
        else:
            catalog_routing = "COMMERCIAL_BLEND"
            is_specialty = False

        # Persist Cupping Record
        insert_query = text("""
            INSERT INTO cupping_scoresheets (
                roast_batch_id, q_grader_name, session_date,
                fragrance_aroma, flavor, aftertaste, acidity, body, balance,
                uniformity, clean_cup, sweetness, defects_deduction, overall_score
            ) VALUES (
                :batch_id, :q_grader, :session_date,
                :fragrance, :flavor, :aftertaste, :acidity, :body, :balance,
                :uniformity, :clean_cup, :sweetness, :defects, :overall
            ) RETURNING id;
        """)

        res = await self.db.execute(insert_query, {
            "batch_id": payload.roast_batch_id,
            "q_grader": payload.q_grader_name,
            "session_date": payload.session_date,
            "fragrance": payload.fragrance_aroma,
            "flavor": payload.flavor,
            "aftertaste": payload.aftertaste,
            "acidity": payload.acidity,
            "body": payload.body,
            "balance": payload.balance,
            "uniformity": payload.uniformity,
            "clean_cup": payload.clean_cup,
            "sweetness": payload.sweetness,
            "defects": payload.defects_deduction,
            "overall": payload.overall_score
        })
        cupping_id = res.scalar()
        await self.db.commit()

        # Degassing Check
        now = datetime.now(timezone.utc)
        is_degassed = batch["degassing_released_at"] is not None and batch["degassing_released_at"] <= now
        degassing_status = "RESTED_READY_FOR_PACKING" if is_degassed else "DEGASSING_STAGED"

        return {
            "id": cupping_id,
            "roast_batch_code": batch["roast_batch_code"],
            "total_score": total_score,
            "catalog_routing": catalog_routing,
            "is_specialty": is_specialty,
            "degassing_status": degassing_status,
            "created_at": now
        }
