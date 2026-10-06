from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from apps.api.src.core.database import get_db_session
from apps.api.src.modules.traceability.service import TraceabilityGraphEngine
from typing import Dict, Any

router = APIRouter(prefix="/trace", tags=["Traceability Engine"])

@router.get("/{pack_lot_code}")
async def get_pack_provenance(
    pack_lot_code: str,
    db: AsyncSession = Depends(get_db_session)
) -> Dict[str, Any]:
    engine = TraceabilityGraphEngine(db)
    return await engine.get_pack_lineage(pack_lot_code)

@router.get("/{pack_lot_code}/eudr.geojson")
async def get_eudr_geojson(
    pack_lot_code: str,
    db: AsyncSession = Depends(get_db_session)
) -> Dict[str, Any]:
    engine = TraceabilityGraphEngine(db)
    lineage = await engine.get_pack_lineage(pack_lot_code)
    return {
        "type": "FeatureCollection",
        "pack_lot_code": pack_lot_code,
        "features": [{
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": lineage["eudr"]["coordinates"]},
            "properties": lineage["eudr"]
        }]
    }
