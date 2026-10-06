from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from apps.api.src.core.database import get_db_session

router = APIRouter(prefix="/spatial", tags=["EUDR Spatial Cadastral"])

@router.get("/plots")
async def get_cadastral_plots(db: AsyncSession = Depends(get_db_session)):
    query = text("""
        SELECT 
            plot_ref, 
            farmer_name, 
            cooperative, 
            district, 
            elevation_masl, 
            area_hectares, 
            is_eudr_compliant,
            ST_AsGeoJSON(geom)::json as geojson,
            ST_AsText(ST_Centroid(geom)) as centroid
        FROM farm_plots_cadastral
        ORDER BY plot_ref ASC;
    """)
    result = await db.execute(query)
    rows = result.mappings().all()
    
    features = []
    for r in rows:
        features.append({
            "type": "Feature",
            "geometry": r["geojson"],
            "properties": {
                "plot_ref": r["plot_ref"],
                "farmer_name": r["farmer_name"],
                "cooperative": r["cooperative"],
                "district": r["district"],
                "elevation_masl": r["elevation_masl"],
                "area_hectares": float(r["area_hectares"]),
                "is_eudr_compliant": r["is_eudr_compliant"],
                "centroid": r["centroid"]
            }
        })
        
    return {
        "type": "FeatureCollection",
        "features": features
    }
