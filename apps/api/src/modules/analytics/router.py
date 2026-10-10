from fastapi import APIRouter
from apps.api.src.modules.analytics.service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Executive Analytics & Telemetry"])

@router.get("/dashboard")
async def get_dashboard_metrics():
    return AnalyticsService.get_executive_summary()
