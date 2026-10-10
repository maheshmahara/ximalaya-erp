from typing import Dict, Any

class RoastShrinkageService:
    # Specialty Arabica standard corridor: 13.5% to 17.0% weight loss
    MIN_CORRIDOR_PCT: float = 13.5
    MAX_CORRIDOR_PCT: float = 17.0

    @classmethod
    def evaluate_shrinkage(cls, green_weight_kg: float, roasted_weight_kg: float) -> Dict[str, Any]:
        """
        Calculates roast weight shrinkage and validates corridor adherence.
        Formula: ((Green Weight - Roasted Weight) / Green Weight) * 100
        """
        if green_weight_kg <= 0:
            raise ValueError("Green charge weight must be strictly positive")
        if roasted_weight_kg > green_weight_kg:
            raise ValueError("Roasted drop weight cannot exceed green charge weight")

        weight_loss = green_weight_kg - roasted_weight_kg
        shrinkage_pct = round((weight_loss / green_weight_kg) * 100, 2)

        is_compliant = cls.MIN_CORRIDOR_PCT <= shrinkage_pct <= cls.MAX_CORRIDOR_PCT

        if shrinkage_pct < cls.MIN_CORRIDOR_PCT:
            status = "CORRIDOR_BREACH_UNDER_DEVELOPED"
        elif shrinkage_pct > cls.MAX_CORRIDOR_PCT:
            status = "CORRIDOR_BREACH_OVER_DEVELOPED"
        else:
            status = "OPTIMAL"

        return {
            "green_weight_kg": green_weight_kg,
            "roasted_weight_kg": roasted_weight_kg,
            "weight_loss_kg": round(weight_loss, 2),
            "shrinkage_pct": shrinkage_pct,
            "is_compliant": is_compliant,
            "status": status
        }
