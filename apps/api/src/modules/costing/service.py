from decimal import Decimal
from typing import Dict, Any, List
from uuid import UUID
from datetime import datetime, date, timezone, timedelta
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from apps.api.src.modules.costing.schemas import PackagingRunRequest, ChannelQuoteEvaluation
from apps.api.src.modules.costing.engine import DripBoxBOM

class PackagingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.bom_engine = DripBoxBOM()

    async def execute_packaging_run(self, req: PackagingRunRequest) -> Dict[str, Any]:
        # 1. Fetch Roast Batch & Verify Rest/Degassing Status
        batch_query = text("""
            SELECT id, roast_batch_code, qa_hold, degassing_released_at, roasted_dropped_weight_kg
            FROM roast_batches
            WHERE id = :batch_id
        """)
        batch_res = await self.db.execute(batch_query, {"batch_id": req.roast_batch_id})
        batch = batch_res.mappings().first()

        if not batch:
            raise HTTPException(status_code=404, detail="Roast batch not found.")

        if batch["qa_hold"]:
            raise HTTPException(status_code=400, detail="Cannot pack: Roast batch is on QA Hold.")

        # 2. Compute Raw Materials & Bulk Coffee Consumption
        if req.sku_type == "DRIP_BOX_7PCS":
            # 7 bags * 12g = 84g (0.084 kg) per box
            coffee_consumed_kg = (Decimal(req.units_to_pack) * Decimal("0.084")).quantize(Decimal("0.001"))
            unit_cp = self.bom_engine.get_unit_cost_price()["cp_per_box"]
        elif req.sku_type == "WHOLE_BEAN_1KG":
            coffee_consumed_kg = Decimal(req.units_to_pack) * Decimal("1.000")
            unit_cp = Decimal("2450.00")
        else:
            coffee_consumed_kg = Decimal(req.units_to_pack) * Decimal("0.250")
            unit_cp = Decimal("680.00")

        total_run_cost = (Decimal(req.units_to_pack) * unit_cp).quantize(Decimal("0.01"))

        # 3. Generate Sequential GS1 Pack Lot Code
        count_query = text("SELECT COUNT(*) FROM pack_lots WHERE pack_lot_code LIKE :pattern")
        seq = (await self.db.execute(count_query, {"pattern": f"PK-{req.fiscal_year}-%"} )).scalar() or 0
        pack_lot_code = f"PK-{req.fiscal_year}-{(seq + 1):04d}"
        qr_url = f"https://ximalayacoffee.com/t/{pack_lot_code}"

        # Best Before Date Calculation
        best_before = date.today() + timedelta(days=req.best_before_months * 30)

        # 4. Insert Pack Lot Record
        insert_query = text("""
            INSERT INTO pack_lots (
                pack_lot_code, roast_batch_id, sku_type, units_produced,
                bulk_coffee_consumed_kg, landed_cost_per_unit_npr, best_before_date, qr_digital_link_url
            ) VALUES (
                :code, :roast_id, :sku, :units,
                :coffee_kg, :cp_unit, :bbd, :qr
            ) RETURNING id;
        """)

        res = await self.db.execute(insert_query, {
            "code": pack_lot_code,
            "roast_id": batch["id"],
            "sku": req.sku_type,
            "units": req.units_to_pack,
            "coffee_kg": coffee_consumed_kg,
            "cp_unit": unit_cp,
            "bbd": best_before,
            "qr": qr_url
        })
        pack_id = res.scalar()

        # Connect lot lineage edge
        await self.db.execute(text("""
            INSERT INTO lot_edges (parent_lot_id, child_lot_id, parent_type, child_type, input_quantity_kg, output_quantity_kg)
            VALUES (:p_id, :c_id, 'ROAST', 'PACK', :qty, :qty);
        """), {
            "p_id": batch["id"],
            "c_id": pack_id,
            "qty": coffee_consumed_kg
        })

        await self.db.commit()

        # 5. Dynamic Channel Price Breakdown
        channels = [
            {"name": "Wholesale / Distributor", "margin": Decimal("0.20"), "comm": Decimal("0.00"), "deliv": Decimal("20.00")},
            {"name": "Retail Supermarket (MRP)", "margin": Decimal("0.35"), "comm": Decimal("0.00"), "deliv": Decimal("0.00")},
            {"name": "Online Marketplace", "margin": Decimal("0.30"), "comm": Decimal("0.10"), "deliv": Decimal("100.00")},
            {"name": "Corporate / Gift Orders", "margin": Decimal("0.25"), "comm": Decimal("0.00"), "deliv": Decimal("50.00")},
        ]

        quotes = []
        for ch in channels:
            q = self.bom_engine.compute_channel_quote(ch["margin"], ch["comm"], ch["deliv"])
            quotes.append(ChannelQuoteEvaluation(
                channel=ch["name"],
                target_margin_pct=ch["margin"] * Decimal("100"),
                commission_pct=ch["comm"] * Decimal("100"),
                delivery_per_box_npr=ch["deliv"],
                full_cost_npr=q["full_cost_npr"],
                suggested_mrp_incl_vat=q["final_mrp_incl_vat"],
                net_price_ex_vat=q["net_price_ex_vat"],
                vat_13_pct=q["vat_13_pct"],
                profit_per_box=q["profit_per_box"]
            ))

        return {
            "id": pack_id,
            "pack_lot_code": pack_lot_code,
            "sku_type": req.sku_type,
            "units_produced": req.units_to_pack,
            "bulk_coffee_consumed_kg": coffee_consumed_kg,
            "landed_cost_per_unit_npr": unit_cp,
            "total_run_cost_npr": total_run_cost,
            "best_before_date": best_before,
            "qr_digital_link_url": qr_url,
            "channel_pricing": quotes,
            "created_at": datetime.now(timezone.utc)
        }
