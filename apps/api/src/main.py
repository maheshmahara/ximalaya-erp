from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.api.src.modules.procurement.spatial_router import router as spatial_router
from apps.api.src.modules.sales.router import router as sales_router
from apps.api.src.modules.traceability.router import router as traceability_router
from apps.api.src.modules.analytics.router import router as analytics_router
from apps.api.src.modules.logistics.router import router as logistics_router
from apps.api.src.core.auth_router import router as auth_router
from apps.api.src.modules.roasting.ws_router import ws_router
from apps.api.src.modules.roasting.router import router as roasting_router

app = FastAPI(
    title="Ximalaya Coffee ERP API",
    version="1.0.0",
    description="Enterprise Vertical Integration Platform for Himalayan Coffee"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz", tags=["System"])
async def healthz():
    return {"status": "ok", "service": "ximalaya_api", "system": "operational"}

# Include all module routers
app.include_router(spatial_router)
app.include_router(sales_router)
app.include_router(traceability_router)
app.include_router(analytics_router)
app.include_router(logistics_router)
app.include_router(auth_router)
app.include_router(ws_router)
app.include_router(roasting_router)
