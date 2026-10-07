import asyncio
from apps.api.src.modules.sales.cbms_client import CBMSClient

def sync_invoice_to_cbms_task(invoice_dict: dict):
    """
    Celery task dispatched to execute the IRD CBMS sync in the background.
    """
    payload = CBMSClient.format_ird_payload(invoice_dict)
    
    # Run async transmission inside synchronous worker thread
    result = asyncio.run(CBMSClient.transmit_bill_to_ird(payload))
    return {
        "invoice_no": invoice_dict["invoice_no"],
        "sync_status": "SYNCED",
        "ird_receipt": result["ird_receipt_no"]
    }
