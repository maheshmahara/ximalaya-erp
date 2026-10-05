from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from apps.api.src.core.database import get_db_session
from apps.api.src.modules.procurement.schemas import IntakeCreateRequest, IntakeRecordResponse, SupplierResponse
from apps.api.src.modules.procurement.service import ProcurementEngine

router = APIRouter(prefix="/procurement", tags=["Procurement & Inbound QC"])

@router.post("/intakes", response_model=IntakeRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_gate_intake(payload: IntakeCreateRequest, db: AsyncSession = Depends(get_db_session)):
    engine = ProcurementEngine(db)
    return await engine.register_cherry_intake(payload, operator_username="gate_operator_1")

@router.get("/suppliers", response_model=List[SupplierResponse])
async def list_registered_suppliers(district: str = Query(None), db: AsyncSession = Depends(get_db_session)):
    query_str = "SELECT id, supplier_code, full_name, supplier_type, district, altitude_masl, payment_method_pref, name_on_bag_consent FROM suppliers"
    params = {}
    if district:
        query_str += " WHERE district = :district"
        params["district"] = district
    result = await db.execute(query_str, params)
    return result.mappings().all()
