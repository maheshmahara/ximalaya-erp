import pytest
from decimal import Decimal

def validate_roast_shrinkage(charged_kg: Decimal, dropped_kg: Decimal):
    if charged_kg <= Decimal("0"):
        raise ValueError("Charged weight must be positive.")
    shrinkage = ((charged_kg - dropped_kg) / charged_kg) * Decimal("100.00")
    # Valid corridor is 13.50% to 17.00%
    is_valid = Decimal("13.50") <= shrinkage <= Decimal("17.00")
    return shrinkage.quantize(Decimal("0.01")), is_valid

def test_roast_shrinkage_within_corridor():
    # 15.0 kg charged -> 12.75 kg dropped (15.00% shrinkage)
    shrinkage, is_valid = validate_roast_shrinkage(Decimal("15.0"), Decimal("12.75"))
    assert shrinkage == Decimal("15.00")
    assert is_valid is True

def test_roast_shrinkage_out_of_corridor():
    # 15.0 kg charged -> 12.0 kg dropped (20.00% shrinkage - overroasted/moisture loss)
    shrinkage, is_valid = validate_roast_shrinkage(Decimal("15.0"), Decimal("12.00"))
    assert shrinkage == Decimal("20.00")
    assert is_valid is False

def test_sca_cupping_grade_specialty():
    # Standard 10-attribute SCA 100-point cupping scale
    scores = {
        "fragrance_aroma": Decimal("8.50"),
        "flavor": Decimal("8.50"),
        "aftertaste": Decimal("8.25"),
        "acidity": Decimal("8.50"),
        "body": Decimal("8.25"),
        "balance": Decimal("8.50"),
        "uniformity": Decimal("10.00"),
        "clean_cup": Decimal("10.00"),
        "sweetness": Decimal("10.00"),
        "overall": Decimal("8.50")
    }
    total = sum(scores.values())
    assert total == Decimal("89.00")
    # 85-89.99 = Specialty Outstanding Grade
    assert total >= Decimal("84.00")
