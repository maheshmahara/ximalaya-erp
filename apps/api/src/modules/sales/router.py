from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, Field
from typing import List, Optional
from apps.api.src.modules.sales.fiscal_service import NepalFiscalService
from apps.api.src.modules.sales.invoice_pdf import generate_ird_invoice_pdf
from apps.api.src.modules.logistics.inventory_service import WarehouseInventoryService

router = APIRouter(prefix="/sales", tags=["Sales & Nepal Fiscal Invoicing"])

class InvoiceItem(BaseModel):
    sku: Optional[str] = "SKU-DRIP-GUL-7X10G"
    description: str
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    is_tax_exempt: bool = False

class CreateInvoiceRequest(BaseModel):
    buyer_pan: Optional[str] = None
    buyer_name: str
    items: List[InvoiceItem]
    discount_amount: float = 0.0
    deduct_warehouse_stock: bool = True

@router.post("/invoices")
async def create_tax_invoice(req: CreateInvoiceRequest):
    """
    Computes Nepal 13% VAT, validates CBMS fiscal standards,
    and automatically deducts finished goods from warehouse inventory.
    """
    # 1. Stock availability validation
    if req.deduct_warehouse_stock:
        for item in req.items:
            if item.sku:
                try:
                    stock = WarehouseInventoryService.get_stock(item.sku)
                    if int(item.quantity) > stock["available_to_promise"]:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Stock breach for {item.sku}: requested {item.quantity}, but ATP is {stock['available_to_promise']}"
                        )
                except ValueError as e:
                    raise HTTPException(status_code=404, detail=str(e))

    # 2. Compute fiscal VAT
    items_dict = [it.model_dump() for it in req.items]
    fiscal_summary = NepalFiscalService.calculate_invoice_totals(
        items=items_dict,
        discount_amount=req.discount_amount
    )

    invoice_number = f"INV-2083-{hash(req.buyer_name) % 9000 + 1000}"

    # 3. Deduct stock upon successful invoice creation
    if req.deduct_warehouse_stock:
        for item in req.items:
            if item.sku:
                WarehouseInventoryService.allocate_stock_for_order(item.sku, int(item.quantity))
                WarehouseInventoryService.dispatch_and_deplete_stock(item.sku, int(item.quantity))

    return {
        "invoice_number": invoice_number,
        "buyer_pan": req.buyer_pan,
        "buyer_name": req.buyer_name,
        "fiscal_summary": fiscal_summary,
        "stock_depleted": req.deduct_warehouse_stock,
        "ird_sync_status": "PENDING_CBMS_PUSH"
    }

@router.get("/invoices/{invoice_number}/pdf")
async def download_invoice_pdf(invoice_number: str):
    dummy_invoice_data = {
        "invoice_number": invoice_number,
        "transaction_date_np": "2083-08-15",
        "buyer_name": "Shangri-La Speciality Coffee Roasters",
        "buyer_pan": "601928374",
        "items": [
            {
                "description": "Specialty Single-Serve Drip Box (7x10g)",
                "quantity": 100.0,
                "unit_price": 1250.0,
                "amount": 125000.0,
                "is_tax_exempt": False
            }
        ],
        "fiscal_summary": {
            "subtotal": 125000.0,
            "discount_amount": 5000.0,
            "taxable_amount": 120000.0,
            "vat_amount": 15600.0,
            "grand_total": 135600.0
        }
    }
    pdf_bytes = generate_ird_invoice_pdf(dummy_invoice_data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={invoice_number}.pdf"}
    )
