from typing import Dict, Any, List

class ScaCuppingService:
    @staticmethod
    def calculate_score(
        fragrance_aroma: float,
        flavor: float,
        aftertaste: float,
        acidity: float,
        body: float,
        balance: float,
        overall: float,
        uniformity_cups: int = 5,
        clean_cup_cups: int = 5,
        sweetness_cups: int = 5,
        taints_count: int = 0,
        faults_count: int = 0
    ) -> Dict[str, Any]:
        """
        Calculates official SCA 100-point sensory score.
        Uniformity, Clean Cup, Sweetness: 2 points per cup (up to 5 cups each = 10 pts).
        Defects: Taints = count * 2, Faults = count * 4.
        """
        # Validate ranges
        for name, val in [
            ("Fragrance/Aroma", fragrance_aroma),
            ("Flavor", flavor),
            ("Aftertaste", aftertaste),
            ("Acidity", acidity),
            ("Body", body),
            ("Balance", balance),
            ("Overall", overall)
        ]:
            if not (6.0 <= val <= 10.0):
                raise ValueError(f"{name} must be between 6.00 and 10.00")

        uniformity_pts = min(10.0, uniformity_cups * 2.0)
        clean_cup_pts = min(10.0, clean_cup_cups * 2.0)
        sweetness_pts = min(10.0, sweetness_cups * 2.0)

        defect_deduction = (taints_count * 2.0) + (faults_count * 4.0)

        total_score = (
            fragrance_aroma +
            flavor +
            aftertaste +
            acidity +
            body +
            balance +
            overall +
            uniformity_pts +
            clean_cup_pts +
            sweetness_pts -
            defect_deduction
        )
        total_score = round(total_score, 2)

        if total_score >= 90.0:
            classification = "PRESIDENTIAL_SPECIALTY"
        elif total_score >= 85.0:
            classification = "EXCELLENT_SPECIALTY"
        elif total_score >= 80.0:
            classification = "VERY_GOOD_SPECIALTY"
        else:
            classification = "BELOW_SPECIALTY_COMMERCIAL"

        return {
            "total_score": total_score,
            "classification": classification,
            "is_specialty": total_score >= 80.0,
            "defect_deduction": defect_deduction,
            "breakdown": {
                "fragrance_aroma": fragrance_aroma,
                "flavor": flavor,
                "aftertaste": aftertaste,
                "acidity": acidity,
                "body": body,
                "balance": balance,
                "overall": overall,
                "uniformity": uniformity_pts,
                "clean_cup": clean_cup_pts,
                "sweetness": sweetness_pts
            }
        }
