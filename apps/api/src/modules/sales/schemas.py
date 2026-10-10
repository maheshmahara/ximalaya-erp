from pydantic import BaseModel, Field
from typing import List

class SalesLineItem(BaseModel):
    description: str
    quantity_kg: float = Field(gt=0)
    unit_price_npr: float = Field(gt=0)
    is_taxable: bool = True

    @property
    def line_total(self) -> float:
        return round(self.quantity_kg * self.unit_price_npr, 2)

class SalesInvoiceCreate(BaseModel):
    buyer_pan: str
    buyer_name: str
    fiscal_year: str = "2083/84"
    items: List[SalesLineItem]
    discount_amount: float = 0.0

    @property
    def subtotal_amount(self) -> float:
        return round(sum(item.line_total for item in self.items), 2)

    @property
    def taxable_amount(self) -> float:
        taxable_subtotal = sum(item.line_total for item in self.items if item.is_taxable)
        return max(0.0, round(taxable_subtotal - self.discount_amount, 2))

    @property
    def vat_amount(self) -> float:
        # Nepal Standard Value Added Tax: 13%
        return round(self.taxable_amount * 0.13, 2)

    @property
    def grand_total(self) -> float:
        non_taxable = sum(item.line_total for item in self.items if not item.is_taxable)
        return round(self.taxable_amount + self.vat_amount + non_taxable, 2)
