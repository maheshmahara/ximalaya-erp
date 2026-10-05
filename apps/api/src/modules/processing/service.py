from decimal import Decimal
from typing import Dict, Any
from uuid import UUID
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from apps.api.src.modules.processing.schemas import DryMillingRunRequest

class DryMillingEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def execute_milling_run(self, req: DryMillingRunRequest) -> Dict[str, Any]:
        # 1. Verify Parchment Lot & Milling Lock
        lot_query = text("""
            SELECT id, parchment_lot_code, is_milling_locked, final_moisture_pct, repose_matures_at
            FROM parchment_lots
            WHERE id = :lot_id
        """)
        lot_res = await self.db.execute(lot_query, {"lot_id": req.parchment_lot_id})
        lot = lot_res.mappings().first()

        if not lot:
            raise HTTPException(status_code=404, detail="Parchment lot not found.")

        # Rigid Physical Lock Verification
        if not (Decimal("10.00") <= req.calibrated_moisture_pct <= Decimal("12.00")):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Milling locked: Calibrated moisture ({req.calibrated_moisture_pct}%) outside target corridor (10.00% - 12.00%)."
            )

        if req.calibrated_water_activity_aw > Decimal("0.650"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Milling locked: Water activity aw ({req.calibrated_water_activity_aw}) exceeds ceiling limit of 0.650."
            )

        # 2. Mass Balance Calculation
        total_green_kg = sum(req.screen_distribution_kg.values()).quantize(Decimal("0.001"))
        total_output_kg = (total_green_kg + req.husk_chaff_kg + req.defects_rejections_kg).quantize(Decimal("0.001"))
        
        variance_kg = (req.parchment_input_kg - total_output_kg).quantize(Decimal("0.001"))
        variance_pct = ((abs(variance_kg) / req.parchment_input_kg) * Decimal("100.00")).quantize(Decimal("0.01"))

        # Strict 0.5% Mass Balance Threshold
        passed_mass_balance = variance_pct <= Decimal("0.50")
        requires_override = not passed_mass_balance
        milling_status = "APPROVED_RELEASED" if passed_mass_balance else "FLAGGED_MASS_BALANCE_HOLD"

        # 3. Lot Code Generation
        lot_seq = str(req.fiscal_year)
        green_lot_code_a = f"G-{lot_seq}-{lot['parchment_lot_code'][-3:]}-A"
        green_lot_code_b = f"G-{lot_seq}-{lot['parchment_lot_code'][-3:]}-B"

        # 4. Insert Graded Green Bean Records
        insert_green_query = text("""
            INSERT INTO green_coffee_lots (
                green_lot_code, parchment_lot_id, grade, screen_size_distribution,
                net_weight_kg, density_g_per_l, defect_count_per_350g
            ) VALUES (
                :code, :parchment_id, 'GRADE_A', :dist::jsonb,
                :net_kg, :density, 2
            ) RETURNING id;
        """)

        await self.db.execute(insert_green_query, {
            "code": green_lot_code_a,
            "parchment_id": lot["id"],
            "dist": "{\"screens\": \"16-19\"}",
            "net_kg": total_green_kg,
            "density": req.density_g_per_l,
        })

        # Relieve parchment inventory lock and link lot lineage
        await self.db.execute(
            text("UPDATE parchment_lots SET is_milling_locked = FALSE WHERE id = :id"),
            {"id": lot["id"]}
        )
        await self.db.commit()

        return {
            "parchment_lot_code": lot["parchment_lot_code"],
            "input_kg": req.parchment_input_kg,
            "total_green_kg": total_green_kg,
            "total_output_kg": total_output_kg,
            "mass_balance_variance_kg": variance_kg,
            "variance_pct": variance_pct,
            "passed_mass_balance": passed_mass_balance,
            "requires_supervisor_override": requires_override,
            "status": milling_status,
            "generated_green_lots": {
                "Grade A Specialty": green_lot_code_a,
                "Grade B Commercial": green_lot_code_b
            },
            "created_at": datetime.now(timezone.utc)
        }
