from fastapi import APIRouter, HTTPException
from apps.api.src.modules.traceability.genealogy_service import BatchGenealogyService

router = APIRouter(prefix="/batches", tags=["Batch Genealogy & Traceability"])

@router.get("/{batch_code}/genealogy")
async def get_batch_genealogy(batch_code: str):
    data = BatchGenealogyService.get_genealogy_audit(batch_code)
    if not data:
        raise HTTPException(status_code=404, detail="Batch code not found")
    return data
