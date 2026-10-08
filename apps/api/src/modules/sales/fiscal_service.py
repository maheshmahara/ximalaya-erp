from typing import List, Dict, Any

class NepalFiscalService:
    VAT_RATE: float = 0.13  # Nepal Standard 13% VAT

    @classmethod
    def calculate_invoice_totals(
        cls,
        items: List[Dict[str, Any]],
        discount_amount: float = 0.0
    ) -> Dict[str, Any]:
        """
        Calculates subtotal, taxable amount, 13% VAT, and grand total in accordance
        with Inland Revenue Department (IRD) Nepal standards.
        """
        subtotal = 0.0
        taxable_subtotal = 0.0
        non_taxable_subtotal = 0.0

        for it in items:
            line_total = round(it["quantity"] * it["unit_price"], 2)
            subtotal += line_total
            if it.get("is_tax_exempt", False):
                non_taxable_subtotal += line_total
            else:
                taxable_subtotal += line_total

        subtotal = round(subtotal, 2)
        taxable_subtotal = round(taxable_subtotal, 2)
        non_taxable_subtotal = round(non_taxable_subtotal, 2)

        # Pro-rate discount against taxable amount
        taxable_after_discount = max(0.0, round(taxable_subtotal - discount_amount, 2))
        vat_amount = round(taxable_after_discount * cls.VAT_RATE, 2)
        grand_total = round(taxable_after_discount + non_taxable_subtotal + vat_amount, 2)

        return {
            "subtotal": subtotal,
            "discount_amount": discount_amount,
            "taxable_amount": taxable_after_discount,
            "non_taxable_amount": non_taxable_subtotal,
            "vat_rate": cls.VAT_RATE,
            "vat_amount": vat_amount,
            "grand_total": grand_total
        }
