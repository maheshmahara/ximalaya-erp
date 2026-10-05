from datetime import datetime, timezone
from decimal import Decimal
from typing import Dict, Any
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from apps.api.src.modules.procurement.schemas import IntakeCreateRequest, QCInspectionSubmission
from apps.workers.tasks import send_intake_receipt_sms

class ProcurementEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register_cherry_intake(self, req: IntakeCreateRequest, operator_username: str) -> Dict[str, Any]:
        supp_query = text("SELECT id, entity_id, supplier_code, full_name, phone_number FROM suppliers WHERE id = :supp_id")
        supp_row = (await self.db.execute(supp_query, {"supp_id": req.supplier_id})).mappings().first()
        if not supp_row:
            raise HTTPException(status_code=404, detail="Registered Supplier ID not found.")

        now_utc = datetime.now(timezone.utc)
        elapsed_hours = (now_utc - req.harvest_timestamp).total_seconds() / 3600.0
        is_transit_overdue = elapsed_hours > 8.0

        if not is_transit_overdue and req.brix_reading >= Decimal("18.0") and req.floaters_pct <= Decimal("5.0") and req.defect_pct <= Decimal("3.0"):
            assigned_grade = "GRADE_A"
            final_rate = req.base_rate_npr + Decimal("8.00")
            status_tag = "WET_MILL_SPECIALTY_ELIGIBLE"
        elif req.brix_reading >= Decimal("15.0") and req.floaters_pct <= Decimal("12.0"):
            assigned_grade = "GRADE_B"
            final_rate = (req.base_rate_npr * Decimal("0.90")).quantize(Decimal("0.01"))
            status_tag = "STANDARD_COMMERCIAL"
        else:
            assigned_grade = "GRADE_C"
            final_rate = (req.base_rate_npr * Decimal("0.75")).quantize(Decimal("0.01"))
            status_tag = "REJECT_BULK_ONLY"

        if is_transit_overdue:
            status_tag = "DELAYED_TRANSIT_COMMERCIAL"

        net_kg = (req.gross_weight_kg - req.tare_weight_kg).quantize(Decimal("0.001"))
        total_payout_npr = (net_kg * final_rate).quantize(Decimal("0.01"))

        count_query = text("SELECT COUNT(*) FROM intake_lots WHERE master_lot_code LIKE :pattern")
        seq_num = (await self.db.execute(count_query, {"pattern": f"LOT-{req.fiscal_year}-NPL-%"})).scalar() or 0
        master_lot_code = f"LOT-{req.fiscal_year}-NPL-{(seq_num + 1):06d}"

        insert_query = text("""
            INSERT INTO intake_lots (
                master_lot_code, entity_id, supplier_id, plot_id, raw_variety,
                harvest_timestamp, intake_timestamp, gross_weight_kg, tare_weight_kg,
                brix_reading, floaters_pct, defect_pct, assigned_grade, rate_per_kg_npr, status
            ) VALUES (
                :lot_code, :entity_id, :supp_id, :plot_id, :raw_variety,
                :harvest_ts, :intake_ts, :gross_kg, :tare_kg,
                :brix, :floaters, :defects, :grade, :rate, :status
            ) RETURNING id;
        """)

        result = await self.db.execute(insert_query, {
            "lot_code": master_lot_code, "entity_id": supp_row["entity_id"], "supp_id": supp_row["id"],
            "plot_id": req.plot_id, "raw_variety": req.raw_variety, "harvest_ts": req.harvest_timestamp,
            "intake_ts": now_utc, "gross_kg": req.gross_weight_kg, "tare_kg": req.tare_weight_kg,
            "brix": req.brix_reading, "floaters": req.floaters_pct, "defects": req.defect_pct,
            "grade": assigned_grade, "rate": final_rate, "status": status_tag
        })
        lot_id = result.scalar()
        await self.db.commit()

        try:
            send_intake_receipt_sms.delay(
                phone_number=supp_row["phone_number"],
                farmer_name=supp_row["full_name"],
                lot_code=master_lot_code,
                net_kg=str(net_kg),
                amount_npr=str(total_payout_npr)
            )
        except Exception:
            pass

        return {
            "id": lot_id,
            "master_lot_code": master_lot_code,
            "supplier_code": supp_row["supplier_code"],
            "farmer_name": supp_row["full_name"],
            "net_weight_kg": net_kg,
            "assigned_grade": assigned_grade,
            "rate_per_kg_npr": final_rate,
            "total_payout_npr": total_payout_npr,
            "status": status_tag,
            "qr_tag_content": f"https://ximalayacoffee.com/lot/{master_lot_code}"
        }
