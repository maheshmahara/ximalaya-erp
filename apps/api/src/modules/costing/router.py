from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from apps.api.src.core.database import get_db_session
from apps.api.src.modules.costing.schemas import PackagingRunRequest, PackagingRunResponse
from apps.api.src.modules.costing.service import PackagingService

router = APIRouter(prefix="/costing", tags=["Costing & Packaging BOM"])

@router.post("/packaging-run", response_model=PackagingRunResponse, status_code=status.HTTP_201_CREATED)
async def create_packaging_run(
    payload: PackagingRunRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Executes a finished goods packaging run:
    - Deducts bill of materials (boxes, bags, stickers, bulk coffee)
    - Computes landed unit CP (Rs 508.00 base for Drip Box)
    - Generates GS1 Digital Link serialized pack lot (PK-YYYY-####)
    - Calculates multi-channel price floors
    """
    engine = PackagingService(db)
    return await engine.execute_packaging_run(payload)
