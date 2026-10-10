import pytest
import os
from apps.api.src.modules.sales.schemas import SalesInvoiceCreate, SalesLineItem

def test_ird_fiscal_vat_standard():
    item1 = SalesLineItem(
        description="Green Bean Specialty Micro-lot",
        quantity_kg=100.0,
        unit_price_npr=1200.0,
        is_taxable=True
    )
    invoice = SalesInvoiceCreate(
        buyer_pan="302918273",
        buyer_name="Himalayan Java Pvt. Ltd.",
        fiscal_year="2083/84",
        items=[item1],
        discount_amount=0.0
    )
    
    assert invoice.subtotal_amount == 120000.0
    assert invoice.taxable_amount == 120000.0
    assert invoice.vat_amount == 15600.0 # Standard 13% Nepal VAT
    assert invoice.grand_total == 135600.0

def test_ird_fiscal_vat_with_discount():
    item1 = SalesLineItem(
        description="Roasted Specialty Bourbon",
        quantity_kg=10.0,
        unit_price_npr=2500.0,
        is_taxable=True
    )
    invoice = SalesInvoiceCreate(
        buyer_pan="999888777",
        buyer_name="Third Wave Roasters",
        fiscal_year="2083/84",
        items=[item1],
        discount_amount=1000.0 # NPR 1,000 cash discount
    )
    
    assert invoice.subtotal_amount == 25000.0
    assert invoice.taxable_amount == 24000.0 # 25000 - 1000
    assert invoice.vat_amount == 3120.0     # 13% of 24000
    assert invoice.grand_total == 27120.0

def test_generate_ird_tax_invoice_pdf(tmp_path):
    from apps.api.src.modules.sales.invoice_generator import generate_ird_tax_invoice

    test_pdf = str(tmp_path / "test_tax_invoice.pdf")
    items = [
        {"desc": "Roasted Coffee", "qty": 10.0, "rate": 2000.0}
    ]

    output = generate_ird_tax_invoice(
        invoice_no="INV-2083-0001",
        fiscal_year="2083/84",
        buyer_name="Test Buyer",
        buyer_pan="123456789",
        buyer_address="Kathmandu",
        items=items,
        output_pdf_path=test_pdf
    )

    assert os.path.exists(output)
    assert os.path.getsize(output) > 1000  # ReportLab PDF binary successfully generated
