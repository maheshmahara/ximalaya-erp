from apps.api.src.modules.procurement_advanced_router import router as procurement_advanced_router
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
from apps.api.src.modules.packaging.router import router as packaging_router
from apps.api.src.modules.compliance.router import router as compliance_router

app = FastAPI(
    title="Ximalaya Coffee ERP API",
    version="1.0.0",
    description="Enterprise Vertical Integration Platform for Himalayan Coffee"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://103.254.186.194:55555",
        "http://192.168.5.109:3000",
        "http://192.168.5.109",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz", tags=["System"])
async def healthz():
    return {"status": "ok", "service": "ximalaya_api", "system": "operational"}

# Core Auth & WebSockets
app.include_router(auth_router)
app.include_router(auth_router)
app.include_router(ws_router)

# Mount all feature routers at root and under /api for full test & proxy compatibility
module_routers = [
    spatial_router,
    roasting_router,
    sales_router,
    traceability_router,
    analytics_router,
    logistics_router,
    packaging_router,
]

for r in module_routers:
    app.include_router(r)
    app.include_router(r, prefix="/api")
app.include_router(compliance_router, prefix="/api")

app.include_router(procurement_advanced_router)
