from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Any, List
import asyncio
from apps.api.src.modules.roasting.telemetry_service import RoastingTelemetryService

ws_router = APIRouter(prefix="/roasting", tags=["Roasting Live Telemetry & ESP32"])

# In-memory buffer for active batch curve
ACTIVE_CURVES: Dict[str, List[Dict[str, Any]]] = {}

@ws_router.post("/artisan/hook")
async def artisan_ingest_telemetry(payload: Dict[str, Any]):
    """
    Webhook receiving real-time data packets routed from Artisan / ESP32.
    """
    batch_id = payload.get("batch_id", "LIVE-ESP32-BATCH")
    parsed = RoastingTelemetryService.parse_artisan_esp32_packet(payload)
    
    if batch_id not in ACTIVE_CURVES:
        ACTIVE_CURVES[batch_id] = []
    ACTIVE_CURVES[batch_id].append(parsed)

    return {"status": "recorded", "batch_id": batch_id, "data": parsed}

@ws_router.get("/batches/{batch_id}/curve")
async def get_batch_curve(batch_id: str):
    """Retrieve recorded curve data points."""
    return ACTIVE_CURVES.get(batch_id, [])

@ws_router.websocket("/ws/{batch_id}")
async def roasting_live_stream(websocket: WebSocket, batch_id: str):
    """
    Streams 1Hz live telemetry ticks from the ESP32/Artisan feed.
    """
    await websocket.accept()
    try:
        # Send initial frame immediately
        initial_point = RoastingTelemetryService.generate_esp32_simulation_point(0)
        initial_point["batch_id"] = batch_id
        await websocket.send_json(initial_point)

        for second in range(10, 600, 10):
            await asyncio.sleep(0.1)
            point = RoastingTelemetryService.generate_esp32_simulation_point(second)
            point["batch_id"] = batch_id
            await websocket.send_json(point)
    except (WebSocketDisconnect, RuntimeError):
        pass
    except Exception:
        await websocket.close()
