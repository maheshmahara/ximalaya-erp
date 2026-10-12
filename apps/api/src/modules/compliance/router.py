from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.src.core.database import get_db_session
from apps.api.src.modules.compliance.service import EUDRComplianceService

router = APIRouter(prefix="/compliance/eudr", tags=["EUDR Due Diligence & Regulatory Compliance"])


@router.get("/statement", status_code=status.HTTP_200_OK)
async def get_due_diligence_statement(
    lot_code: Optional[str] = Query(None, description="Optional filter for specific lot code"),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Returns structured EUDR Article 4 Due Diligence Statement (DDS)
    for European customs and importing buyers.
    """
    service = EUDRComplianceService(db)
    statement = await service.generate_due_diligence_statement(lot_code=lot_code)
    return statement


@router.get("/geojson", status_code=status.HTTP_200_OK)
async def get_eudr_geojson_export(
    db: AsyncSession = Depends(get_db_session)
):
    """
    Exports clean WGS84 GeoJSON FeatureCollection formatted directly
    for upload into the official European Commission EU-IS portal.
    """
    service = EUDRComplianceService(db)
    geojson_data = await service.generate_eudr_geojson_feature_collection()
    return JSONResponse(
        content=geojson_data,
        headers={"Content-Disposition": 'attachment; filename="eudr_plots_nepal_export.geojson"'}
    )
