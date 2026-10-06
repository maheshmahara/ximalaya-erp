from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.api.src.modules.procurement.router import router as procurement_router
from apps.api.src.modules.procurement.spatial_router import router as spatial_router
from apps.api.src.modules.sales.router import router as sales_router
from apps.api.src.modules.procurement.spatial_router import router as spatial_router
from apps.api.src.modules.sales.router import router as sales_router
from apps.api.src.modules.procurement.spatial_router import router as spatial_router
from apps.api.src.modules.sales.router import router as sales_router
from apps.api.src.modules.procurement.spatial_router import router as spatial_router
from apps.api.src.modules.sales.router import router as sales_router
from apps.api.src.modules.processing.router import router as processing_router
from apps.api.src.modules.roasting.webhook import router as roasting_router
from apps.api.src.modules.costing.router import router as costing_router
from apps.api.src.modules.traceability.router import router as trace_router

app = FastAPI(title="Ximalaya Coffee Group ERP API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(spatial_router)
app.include_router(sales_router)
app.include_router(spatial_router)
app.include_router(sales_router)
app.include_router(spatial_router)
app.include_router(sales_router)
app.include_router(spatial_router)
app.include_router(sales_router)
app.include_router(procurement_router, prefix="/api/v1")
app.include_router(processing_router, prefix="/api/v1")
app.include_router(roasting_router, prefix="/api/v1")
app.include_router(costing_router, prefix="/api/v1")
app.include_router(trace_router, prefix="/api/v1")

@app.get("/healthz", tags=["System Health"])
async def health_check():
    return {"status": "HEALTHY", "erp_version": "1.0.0", "entities": 4}
