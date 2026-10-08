from typing import Dict, Any

class PackagingService:
    # Industry benchmark for nitrogen-flushed ultrasonic single-serve drip bags
    MAX_ALLOWABLE_RESIDUAL_O2_PCT: float = 0.50
    GRAMS_PER_BOX: float = 70.0  # 7 drip bags x 10g
    MAX_ACCEPTABLE_DEFECT_RATE_PCT: float = 1.50

    @classmethod
    def process_packaging_run(
        cls,
        packaging_batch_id: str,
        parent_roast_batch_id: str,
        roasted_coffee_input_kg: float,
        finished_boxes_produced: int,
        residual_o2_reading_pct: float,
        damaged_sachets_count: int = 0
    ) -> Dict[str, Any]:
        """
        Validates mass reconciliation, packaging yields, and nitrogen flush integrity.
        """
        if roasted_coffee_input_kg <= 0:
            raise ValueError("Roasted coffee input must be strictly positive")
        if finished_boxes_produced <= 0:
            raise ValueError("Boxes produced must be strictly positive")

        finished_product_kg = round((finished_boxes_produced * cls.GRAMS_PER_BOX) / 1000.0, 2)
        if finished_product_kg > roasted_coffee_input_kg:
            raise ValueError(
                f"Finished product weight ({finished_product_kg} kg) cannot exceed roasted input ({roasted_coffee_input_kg} kg)"
            )

        total_sachets_attempted = (finished_boxes_produced * 7) + damaged_sachets_count
        reject_rate_pct = round((damaged_sachets_count / total_sachets_attempted) * 100.0, 2) if total_sachets_attempted > 0 else 0.0

        is_o2_compliant = residual_o2_reading_pct <= cls.MAX_ALLOWABLE_RESIDUAL_O2_PCT
        is_yield_compliant = reject_rate_pct <= cls.MAX_ACCEPTABLE_DEFECT_RATE_PCT

        o2_status = "OPTIMAL_FRESHNESS" if is_o2_compliant else "O2_BREACH_QUARANTINE"

        return {
            "packaging_batch_id": packaging_batch_id,
            "parent_roast_batch_id": parent_roast_batch_id,
            "roasted_coffee_input_kg": roasted_coffee_input_kg,
            "finished_boxes_produced": finished_boxes_produced,
            "finished_product_kg": finished_product_kg,
            "residual_o2_reading_pct": residual_o2_reading_pct,
            "is_o2_compliant": is_o2_compliant,
            "o2_status": o2_status,
            "reject_rate_pct": reject_rate_pct,
            "is_yield_compliant": is_yield_compliant,
            "status": "APPROVED_FOR_DISPATCH" if (is_o2_compliant and is_yield_compliant) else "QA_HOLD"
        }
