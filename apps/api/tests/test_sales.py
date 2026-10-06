import pytest
from decimal import Decimal

def compute_nepal_ird_invoice(subtotal: Decimal, discount_pct: Decimal = Decimal("0")):
    discount_amount = (subtotal * (discount_pct / Decimal("100.00"))).quantize(Decimal("0.01"))
    taxable_amount = subtotal - discount_amount
    vat_13_pct = (taxable_amount * Decimal("0.13")).quantize(Decimal("0.01"))
    grand_total = (taxable_amount + vat_13_pct).quantize(Decimal("0.01"))
    return {
        "subtotal": subtotal,
        "discount": discount_amount,
        "taxable": taxable_amount,
        "vat_13": vat_13_pct,
        "grand_total": grand_total
    }

def test_ird_fiscal_vat_standard():
    # 10 Drip Boxes @ Rs 750.00 = Rs 7,500.00
    calc = compute_nepal_ird_invoice(Decimal("7500.00"))
    assert calc["taxable"] == Decimal("7500.00")
    assert calc["vat_13"] == Decimal("975.00")
    assert calc["grand_total"] == Decimal("8475.00")

def test_ird_fiscal_vat_with_discount():
    # Subtotal Rs 10,000.00 with 10% commercial volume discount
    calc = compute_nepal_ird_invoice(Decimal("10000.00"), discount_pct=Decimal("10.00"))
    assert calc["discount"] == Decimal("1000.00")
    assert calc["taxable"] == Decimal("9000.00")
    assert calc["vat_13"] == Decimal("1170.00")
    assert calc["grand_total"] == Decimal("10170.00")
