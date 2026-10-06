from fastapi import APIRouter, Response, HTTPException
from apps.api.src.modules.sales.invoice_generator import generate_ird_tax_invoice
import tempfile
import os

router = APIRouter(prefix="/sales", tags=["Fiscal Sales & Invoicing"])

@router.get("/invoices/{invoice_no}/pdf")
async def download_tax_invoice_pdf(invoice_no: str):
    # Mock / Seeded Transaction data for specialty coffee batch
    sample_items = [
        {
            "desc": "Single Origin Roasted Coffee (Lot PK-2083-0459)",
            "hs_code": "0901.21.00",
            "qty": 50.0,
            "unit": "Kg",
            "rate": 2400.00
        },
        {
            "desc": "Specialty Himalayan Drip Boxes (7 Bags/Box)",
            "hs_code": "0901.21.00",
            "qty": 100.0,
            "unit": "Box",
            "rate": 850.00
        }
    ]

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        pdf_path = tmp.name

    try:
        generate_ird_tax_invoice(
            invoice_no=invoice_no,
            fiscal_year="2083/84",
            buyer_name="Himalayan Java Pvt. Ltd.",
            buyer_pan="302918273",
            buyer_address="Thamel, Kathmandu, Nepal",
            items=sample_items,
            output_pdf_path=pdf_path
        )

        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Invoice-{invoice_no}.pdf"}
        )
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
