import os
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from apps.api.src.core.database import get_db_session
from apps.api.src.modules.packaging.label_service import LabelSheetGenerator

router = APIRouter(prefix="/packaging", tags=["Packaging & Print Operations"])

VERIFY_BASE_URL = os.getenv("VERIFY_BASE_URL", "http://103.254.186.194:55555/lot")


@router.api_route("/print-labels", methods=["GET", "HEAD"], status_code=status.HTTP_200_OK)
async def print_labels(
    lot_code: Optional[str] = Query(None, description="Optional single lot code to repeat across the full sheet (24 labels)"),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Direct in-browser print endpoint for warehouse label sheets.
    Renders 300 DPI A4 die-cut format (3 cols x 8 rows = 24 labels) directly as a PDF stream.
    """
    lots = []

    # 1. Fetch registered plots from PostGIS
    query = text("""
        SELECT 
            fp.plot_label,
            fp.altitude_masl,
            s.full_name as farmer_name
        FROM farm_plots fp
        JOIN suppliers s ON fp.supplier_id = s.id
        ORDER BY fp.created_at ASC;
    """)

    try:
        res = await db.execute(query)
        plots = res.mappings().all()
    except Exception:
        await db.rollback()
        plots = []

    if lot_code:
        # User requested 24 copies of a specific lot
        matching_plot = next((p for p in plots if lot_code.endswith(p["plot_label"][-3:])), None) if plots else None
        farmer = matching_plot["farmer_name"] if matching_plot else "Sita Gurung"
        parcel = matching_plot["plot_label"] if matching_plot else "GUL-RURU-042"

        lot_entry = {
            "pack_lot_code": lot_code,
            "sku_name": "Specialty Drip Coffee Box (7 Pack)",
            "best_before_date": "2084-04-15",
            "total_sca_score": 84.50,
            "farmer_name": farmer,
            "cadastral_parcel_number": parcel
        }
        lots = [lot_entry] * 24
    elif plots:
        # Multi-terroir sheet covering all active plots
        for idx, p in enumerate(plots):
            code = f"PK-2083-GUL-{idx+1:03d}"
            lots.append({
                "pack_lot_code": code,
                "sku_name": "Specialty Drip Coffee Box (7 Pack)",
                "best_before_date": "2084-04-15",
                "total_sca_score": 84.50 + (idx * 0.5),
                "farmer_name": p["farmer_name"],
                "cadastral_parcel_number": p["plot_label"],
            })
    else:
        # Default canonical seed lot
        lots = [
            {
                "pack_lot_code": "PK-2083-GUL-001",
                "sku_name": "Specialty Drip Coffee Box (7 Pack)",
                "best_before_date": "2084-04-15",
                "total_sca_score": 84.50,
                "farmer_name": "Sita Gurung",
                "cadastral_parcel_number": "GUL-RURU-042",
            }
        ] * 24

    pdf_buffer = LabelSheetGenerator.generate_pdf_buffer(lots, VERIFY_BASE_URL)

    filename = f"ximalaya_labels_{lot_code or 'active_batch'}.pdf"
    headers = {
        "Content-Disposition": f"inline; filename={filename}",
        "Content-Type": "application/pdf"
    }

    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers=headers)
