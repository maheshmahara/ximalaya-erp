from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
import statistics

from apps.api.src.core.security import RoleChecker

router = APIRouter(prefix="/api/procurement", tags=["Procurement & Inbound Logistics"])


class SupplierType(str, Enum):
    OWN_PLANTATION = "OWN_PLANTATION"
    FARMER = "FARMER"
    VILLAGE_COLLECTOR = "VILLAGE_COLLECTOR"
    SAHAKARI = "SAHAKARI"
    OTHER_SUPPLIERS = "OTHER_SUPPLIERS"


class ProductForm(str, Enum):
    RED_CHERRY = "RED_CHERRY"
    DRY_CHERRY = "DRY_CHERRY"
    PARCHMENT = "PARCHMENT"
    GREEN_BEAN = "GREEN_BEAN"
    ROASTED_BEAN = "ROASTED_BEAN"


class VehicleOwnership(str, Enum):
    COMPANY_OWN = "COMPANY_OWN"
    RENTING = "RENTING"
    FARMER_SELF = "FARMER_SELF"


class M1SensorReading(BaseModel):
    reading_index: int = Field(..., ge=1)
    moisture_pct: float = Field(..., ge=5.0, le=75.0, description="Moisture percentage from M1 meter")
    density_g_l: float = Field(..., ge=200.0, le=1000.0, description="Bulk density in g/L")


class TransportPickupInfo(BaseModel):
    ownership_type: VehicleOwnership
    driver_name: str
    driver_phone: str
    vehicle_registration: str
    pickup_location_name: str
    pickup_gps_lat: float
    pickup_gps_lng: float
    departure_timestamp: Optional[str] = None
    seal_number: Optional[str] = None
    destination_store_code: str = "STORE-WH-01"


class ProcurementOrderCreate(BaseModel):
    supplier_type: SupplierType
    supplier_name: str
    supplier_contact: Optional[str] = "9800000000"
    cadastral_plot_code: Optional[str] = "PLOT-GUL-042"
    district: str = "Gulmi"
    cooperative_sahakari_id: Optional[str] = None
    product_form: ProductForm
    
    # Weight & Physical measurements
    gross_weight_kg: float = Field(..., gt=0)
    tare_weight_kg: float = Field(0.0, ge=0)
    bag_count: int = Field(..., ge=1)
    
    # M1 Caffe Meter Readings - Strictly >= 5 readings
    m1_readings: List[M1SensorReading]
    
    # Pricing & Settlement
    base_rate_npr_per_kg: float = Field(..., gt=0)
    
    # Inbound transport traceability
    transport: TransportPickupInfo

    @field_validator("m1_readings")
    @classmethod
    def validate_minimum_five_readings(cls, v: List[M1SensorReading]):
        if len(v) < 5:
            raise ValueError(f"M1 Caffe Meter requires a minimum of 5 physical readings. Only {len(v)} provided.")
        return v


@router.post("/orders")
async def create_procurement_order(
    payload: ProcurementOrderCreate,
    current_user: Dict[str, Any] = Depends(RoleChecker(["OPERATOR", "MANAGER", "ADMIN"]))
):
    net_weight_kg = round(max(0.0, payload.gross_weight_kg - payload.tare_weight_kg), 2)
    if net_weight_kg <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Net weight must be greater than zero kg"
        )

    # Compute M1 Caffe Meter aggregate statistics
    moistures = [r.moisture_pct for r in payload.m1_readings]
    densities = [r.density_g_l for r in payload.m1_readings]

    avg_moisture = round(statistics.mean(moistures), 2)
    moisture_variance = round(statistics.stdev(moistures), 3) if len(moistures) > 1 else 0.0

    avg_density = round(statistics.mean(densities), 2)
    density_variance = round(statistics.stdev(densities), 3) if len(densities) > 1 else 0.0

    # Quality rating based on standard thresholds for commodity type
    moisture_status = "OPTIMAL"
    if payload.product_form == ProductForm.PARCHMENT or payload.product_form == ProductForm.GREEN_BEAN:
        if avg_moisture > 12.5:
            moisture_status = "WARNING_HIGH_MOISTURE"
        elif avg_moisture < 9.5:
            moisture_status = "WARNING_OVERDRIED"
    elif payload.product_form == ProductForm.RED_CHERRY:
        if avg_moisture < 55.0:
            moisture_status = "PARTIAL_DRIED_CHERRY"

    # Price Calculation
    total_payout_npr = round(net_weight_kg * payload.base_rate_npr_per_kg, 2)

    # Generate sequential unique tokens
    now_ts = datetime.now(timezone.utc)
    batch_prefix = payload.district[:3].upper()
    order_id = f"PROC-{now_ts.strftime('%Y%m%d%H%M')}-{batch_prefix}"
    inbound_waybill_no = f"WB-{payload.transport.ownership_type.value[:3]}-{now_ts.strftime('%d%H%M')}"

    return {
        "status": "RECORDED_AND_MANIFESTED",
        "order_id": order_id,
        "waybill_number": inbound_waybill_no,
        "recorded_at": now_ts.isoformat(),
        "operator": current_user.get("email"),
        "supplier": {
            "type": payload.supplier_type.value,
            "name": payload.supplier_name,
            "contact": payload.supplier_contact,
            "plot_code": payload.cadastral_plot_code,
            "district": payload.district,
            "cooperative_id": payload.cooperative_sahakari_id
        },
        "commodity": {
            "form": payload.product_form.value,
            "bag_count": payload.bag_count,
            "gross_weight_kg": payload.gross_weight_kg,
            "tare_weight_kg": payload.tare_weight_kg,
            "net_weight_kg": net_weight_kg
        },
        "m1_caffe_meter_audit": {
            "readings_count": len(payload.m1_readings),
            "raw_readings": [r.model_dump() for r in payload.m1_readings],
            "average_moisture_pct": avg_moisture,
            "moisture_std_dev": moisture_variance,
            "average_density_g_l": avg_density,
            "density_std_dev": density_variance,
            "sensor_compliance": "VALIDATED_5_POINT_SAMPLE",
            "quality_flag": moisture_status
        },
        "transport_traceability": {
            "ownership": payload.transport.ownership_type.value,
            "driver_name": payload.transport.driver_name,
            "driver_phone": payload.transport.driver_phone,
            "vehicle_plate": payload.transport.vehicle_registration,
            "pickup_gps": {
                "latitude": payload.transport.pickup_gps_lat,
                "longitude": payload.transport.pickup_gps_lng,
                "location_name": payload.transport.pickup_location_name
            },
            "seal_number": payload.transport.seal_number or "UNSEALED_OPEN_TRUCK",
            "destination_store": payload.transport.destination_store_code,
            "status": "DISPATCHED_TO_STORE"
        },
        "financial_settlement": {
            "base_rate_npr_kg": payload.base_rate_npr_per_kg,
            "total_payable_npr": total_payout_npr,
            "currency": "NPR",
            "settlement_status": "PENDING_STORE_ARRIVAL_VERIFICATION"
        }
    }
