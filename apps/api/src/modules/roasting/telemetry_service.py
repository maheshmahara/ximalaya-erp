from typing import Dict, Any, Optional

class RoastingTelemetryService:
    @staticmethod
    def parse_artisan_esp32_packet(raw_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parses inbound telemetry packets from Artisan or an ESP32 bridge:
        Expected incoming keys:
          - bt: Bean Temperature (°C)
          - et: Environmental / Exhaust Temperature (°C)
          - ror: Rate of Rise (°C/min)
          - heater_duty: SSR PWM duty cycle (0-100%)
          - fan_pct: Fan speed (0-100%)
          - elapsed: Time in seconds
          - event: Optional Artisan marker (CHARGE, DRY, FC_START, FC_END, DROP)
        """
        bt = float(raw_payload.get("bt", 0.0))
        et = float(raw_payload.get("et", 0.0))
        ror = float(raw_payload.get("ror", 0.0))
        heater_duty = float(raw_payload.get("heater_duty", 0.0))
        fan_pct = float(raw_payload.get("fan_pct", 0.0))
        elapsed = int(raw_payload.get("elapsed", 0))
        event = raw_payload.get("event")

        phase = "DRYING"
        if bt >= 196.0 or event == "FC_START":
            phase = "DEVELOPMENT"
        elif bt >= 150.0 or event == "DRY":
            phase = "MAILLARD"

        return {
            "source": "ESP32_ARTISAN",
            "elapsed_seconds": elapsed,
            "phase": phase,
            "bean_temp_c": round(bt, 2),
            "env_temp_c": round(et, 2),
            "rate_of_rise": round(ror, 2),
            "heater_duty_pct": round(heater_duty, 1),
            "fan_pct": round(fan_pct, 1),
            "artisan_event": event
        }

    @staticmethod
    def generate_esp32_simulation_point(second: int) -> Dict[str, Any]:
        """Simulation curve matching electric roaster thermal inertia."""
        if second < 75:
            # Turning point curve for electric drum
            bt = 195.0 - (95.0 * (second / 75.0))
            ror = -30.0 + (30.0 * (second / 75.0))
            heater = 100.0  # Full power early
        else:
            t = (second - 75) / (600 - 75)
            bt = 100.0 + (105.0 * (t ** 0.78))
            ror = max(3.5, 16.0 * (1.0 - (t * 0.7)))
            heater = max(20.0, 90.0 * (1.0 - (t * 0.6)))

        et = bt + 16.0
        return RoastingTelemetryService.parse_artisan_esp32_packet({
            "bt": bt,
            "et": et,
            "ror": ror,
            "heater_duty": heater,
            "fan_pct": 50.0 if second < 480 else 75.0,
            "elapsed": second,
            "event": "FC_START" if 480 <= second <= 485 else None
        })
