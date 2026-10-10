import pytest
from apps.api.src.modules.sales.cbms_client import CBMSClient
from apps.api.src.modules.sales.tasks import sync_invoice_to_cbms_task

def test_cbms_payload_formatter():
    invoice = {
        "seller_pan": "609876543",
        "buyer_pan": "302918273",
        "fiscal_year": "2083/84",
        "invoice_no": "INV-2083-0099",
        "invoice_date": "2026-03-29",
        "subtotal_amount": 10000.0,
        "taxable_amount": 10000.0,
        "vat_amount": 1300.0
    }
    
    payload = CBMSClient.format_ird_payload(invoice)
    
    assert payload["seller_pan"] == "609876543"
    assert payload["buyer_pan"] == "302918273"
    assert payload["fiscal_year"] == "2083/84"
    assert payload["total_sales"] == 10000.0
    assert payload["vat"] == 1300.0
    assert payload["taxable_sales_hst"] == 10000.0

def test_async_cbms_sync_execution():
    invoice = {
        "seller_pan": "609876543",
        "buyer_pan": "302918273",
        "fiscal_year": "2083/84",
        "invoice_no": "INV-2083-0099",
        "invoice_date": "2026-03-29",
        "subtotal_amount": 50000.0,
        "taxable_amount": 50000.0,
        "vat_amount": 6500.0
    }
    
    res = sync_invoice_to_cbms_task(invoice)
    assert res["sync_status"] == "SYNCED"
    assert "CBMS-REC-INV-2083-0099" in res["ird_receipt"]
