from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Any, List
import asyncio
from apps.api.src.modules.roasting.telemetry_service import RoastingTelemetryService

ws_router = APIRouter(prefix="/roasting", tags=["Roasting Live Telemetry & ESP32"])

ACTIVE_CURVES: Dict[str, List[Dict[str, Any]]] = {}

@ws_router.post("/artisan/hook")
async def artisan_ingest_telemetry(payload: Dict[str, Any]):
    batch_id = payload.get("batch_id", "LIVE-ESP32-BATCH")
    parsed = RoastingTelemetryService.parse_artisan_esp32_packet(payload)
    
    if batch_id not in ACTIVE_CURVES:
        ACTIVE_CURVES[batch_id] = []
    ACTIVE_CURVES[batch_id].append(parsed)

    return {"status": "recorded", "batch_id": batch_id, "data": parsed}

@ws_router.get("/batches/{batch_id}/curve")
async def get_batch_curve(batch_id: str):
    return ACTIVE_CURVES.get(batch_id, [])

@ws_router.websocket("/ws/{batch_id}")
async def roasting_live_stream(websocket: WebSocket, batch_id: str):
    await websocket.accept()
    try:
        second = 0
        while True:
            point = RoastingTelemetryService.generate_esp32_simulation_point(second)
            point["batch_id"] = batch_id
            await websocket.send_json(point)
            
            second = (second + 5) % 660  # Continuous loop through roast
            await asyncio.sleep(0.5)
    except (WebSocketDisconnect, RuntimeError):
        pass
    except Exception:
        await websocket.close()
