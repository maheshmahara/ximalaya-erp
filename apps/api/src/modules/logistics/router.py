from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any
from apps.api.src.modules.logistics.inventory_service import WarehouseInventoryService

router = APIRouter(prefix="/logistics", tags=["Warehouse & Logistics"])

class StockAllocationRequest(BaseModel):
    sku: str
    quantity: int = Field(..., gt=0)

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
