from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
from apps.api.src.modules.logistics.inventory_service import WarehouseInventoryService
from apps.api.src.modules.logistics.dds_service import EUDRDueDiligenceService

router = APIRouter(prefix="/logistics", tags=["Warehouse & Logistics"])

class StockAllocationRequest(BaseModel):
    sku: str
    quantity: int = Field(..., gt=0)

class DDSGenerationRequest(BaseModel):
    reference_number: str
    importer_eori: str
    exporter_name: str = "Ximalaya Specialty Coffee Producers Pvt Ltd"
    hs_code: str = "0901.21"
    net_mass_kg: float = Field(..., gt=0)
    cadastral_plot_ids: List[str]

@router.get("/inventory/{sku}")
async def get_sku_inventory(sku: str):
    try:
        return WarehouseInventoryService.get_stock(sku)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/inventory/allocate")
async def allocate_inventory(req: StockAllocationRequest):
    try:
        return WarehouseInventoryService.allocate_stock_for_order(sku=req.sku, quantity=req.quantity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/inventory/deplete")
async def deplete_inventory(req: StockAllocationRequest):
    try:
        return WarehouseInventoryService.dispatch_and_deplete_stock(sku=req.sku, quantity=req.quantity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/export/dds")
async def generate_due_diligence_statement(req: DDSGenerationRequest):
    try:
        return EUDRDueDiligenceService.generate_dds_statement(
            reference_number=req.reference_number,
            importer_eori=req.importer_eori,
            exporter_name=req.exporter_name,
            hs_code=req.hs_code,
            net_mass_kg=req.net_mass_kg,
            cadastral_plot_ids=req.cadastral_plot_ids
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
