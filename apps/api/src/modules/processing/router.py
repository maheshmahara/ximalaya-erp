from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from apps.api.src.core.database import get_db_session
from apps.api.src.modules.processing.schemas import DryMillingRunRequest, DryMillingAuditResponse
from apps.api.src.modules.processing.service import DryMillingEngine

router = APIRouter(prefix="/processing", tags=["Milling & Processing"])

@router.post("/dry-milling", response_model=DryMillingAuditResponse, status_code=status.HTTP_201_CREATED)
async def execute_dry_milling(
    payload: DryMillingRunRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Executes dry milling with calibrated moisture check (10-12%)
    and mass-balance audit (<= 0.5% variance limit).
    """
    engine = DryMillingEngine(db)
    return await engine.execute_milling_run(payload)
