from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from apps.api.src.modules.traceability.genealogy_service import BatchGenealogyService
from apps.api.src.modules.traceability.traces_service import TracesExportService

router = APIRouter(prefix="/traceability", tags=["Batch Genealogy & Traceability"])

@router.get("/batches/{batch_code}/genealogy")
async def get_batch_genealogy(batch_code: str):
    data = BatchGenealogyService.get_genealogy_audit(batch_code)
    if not data:
        raise HTTPException(status_code=404, detail="Batch code not found")
    return data

@router.get("/eudr/traces-nt/{dds_reference}")
async def export_traces_nt_package(dds_reference: str):
    """
    Generates and downloads the official EUDR TRACES-NT declaration JSON package.
    """
    payload = TracesExportService.generate_traces_nt_payload(dds_reference=dds_reference)
    return JSONResponse(
        content=payload,
        headers={"Content-Disposition": f"attachment; filename=TRACES_NT_{dds_reference}.json"}
    )
