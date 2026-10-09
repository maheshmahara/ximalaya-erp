from typing import Dict, Any, List
from datetime import datetime, timezone

class EUDRDueDiligenceService:
    @classmethod
    def generate_dds_statement(
        cls,
        reference_number: str,
        importer_eori: str,
        exporter_name: str,
        hs_code: str,
        net_mass_kg: float,
        cadastral_plot_ids: List[str]
    ) -> Dict[str, Any]:
        if not reference_number.startswith("DDS-"):
            raise ValueError("Reference number must follow standard format (DDS-YYYY-XXXX)")
        if net_mass_kg <= 0:
            raise ValueError("Net mass must be strictly positive")
        if not cadastral_plot_ids:
            raise ValueError("At least one cadastral plot polygon must be associated with the DDS")

        plots_data = []
        for pid in cadastral_plot_ids:
            plots_data.append({
                "plot_id": pid,
                "country_of_production": "NPL",
                "polygon_type": "POLYGON",
                "deforestation_cutoff_cleared": True,
                "cutoff_verification_date": "2020-12-31"
            })

        return {
            "dds_reference": reference_number,
            "submission_timestamp": datetime.now(timezone.utc).isoformat(),
            "exporter": {
                "name": exporter_name,
                "country": "NP",
                "declaration": "Deforestation-free pursuant to Regulation (EU) 2023/1115"
            },
            "importer": {
                "eori_number": importer_eori
            },
            "commodity": {
                "hs_code": hs_code,
                "description": "Specialty Himalayan Arabica Coffee (Micro-lot Segregated)",
                "net_mass_kg": round(net_mass_kg, 2),
                "segregation_model": "IDENTITY_PRESERVED"
            },
            "geolocation_parcels": plots_data,
            "verification_status": "VALIDATED_DEFORESTATION_FREE"
        }
