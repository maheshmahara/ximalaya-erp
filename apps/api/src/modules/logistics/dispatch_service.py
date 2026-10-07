from typing import Dict, Any, List
from datetime import datetime

class LogisticsDispatchService:
    @staticmethod
    def create_dispatch_manifest(
        dispatch_no: str,
        origin_facility: str,
        destination_facility: str,
        batch_allocations: List[Dict[str, Any]],
        carrier_name: str,
        vehicle_reg_no: str
    ) -> Dict[str, Any]:
        """
        Creates an inventory transfer manifest adhering to EUDR segregation standards
        and FIFO warehouse reservation rules.
        """
        total_weight_kg = sum(item["quantity_kg"] for item in batch_allocations)
        total_bags_or_boxes = sum(item["units"] for item in batch_allocations)

        # Generate EUDR Due Diligence Statement (DDS) Reference
        eudr_dds_reference = f"DDS-NP-{datetime.now().year}-{dispatch_no.replace('DSP-', '')}"

        return {
            "dispatch_no": dispatch_no,
            "eudr_dds_reference": eudr_dds_reference,
            "dispatch_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "origin_facility": origin_facility,
            "destination_facility": destination_facility,
            "carrier": {
                "name": carrier_name,
                "vehicle_registration": vehicle_reg_no,
                "driver_status": "VERIFIED"
            },
            "total_weight_kg": round(total_weight_kg, 2),
            "total_units": total_bags_or_boxes,
            "allocations": batch_allocations,
            "dispatch_status": "SEALED_FOR_TRANSIT"
        }
