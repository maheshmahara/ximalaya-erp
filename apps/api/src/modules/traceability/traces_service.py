from typing import Dict, Any, List
from datetime import datetime, timezone

class TracesExportService:
    @staticmethod
    def generate_traces_nt_payload(
        dds_reference: str,
        hs_code: str = "0901.11.00", # Harmonized System code for unroasted, non-decaf coffee
        operator_eori: str = "NP-EORI-9081234",
        country_of_production: str = "NPL"
    ) -> Dict[str, Any]:
        """
        Serializes cadastral plot geometries and batch references into the official
        EU TRACES-NT JSON format for customs clearance.
        """
        production_places = [
            {
                "producer_name": "Sita Gurung",
                "national_plot_id": "PLOT-GUL-042",
                "district": "Gulmi",
                "cooperative": "Ruru Eco-Station",
                "area_hectares": 0.42,
                "geometry_type": "Polygon",
                "coordinates": [
                    [83.432612, 27.987654],
                    [83.433215, 27.988123],
                    [83.433890, 27.987456],
                    [83.433120, 27.986987],
                    [83.432612, 27.987654] # Closed loop
                ],
                "deforestation_status": "DEFORESTATION_FREE_CERTIFIED",
                "cutoff_date": "2020-12-31"
            },
            {
                "producer_name": "Devi Prasad Sharma",
                "national_plot_id": "PLOT-PAL-101",
                "district": "Palpa",
                "cooperative": "Tansen Central Collection",
                "area_hectares": 0.58,
                "geometry_type": "Polygon",
                "coordinates": [
                    [83.541234, 27.865432],
                    [83.542109, 27.865987],
                    [83.542876, 27.865123],
                    [83.541987, 27.864789],
                    [83.541234, 27.865432] # Closed loop
                ],
                "deforestation_status": "DEFORESTATION_FREE_CERTIFIED",
                "cutoff_date": "2020-12-31"
            }
        ]

        total_declared_area = sum(p["area_hectares"] for p in production_places)

        return {
            "traces_nt_version": "2.0.4",
            "submission_timestamp": datetime.now(timezone.utc).isoformat(),
            "due_diligence_statement": {
                "dds_reference": dds_reference,
                "operator_eori": operator_eori,
                "country_of_production": country_of_production,
                "commodity": {
                    "hs_code": hs_code,
                    "commercial_name": "Himalayan Arabica Specialty Green Coffee",
                    "net_mass_kg": 900.0,
                    "botanical_name": "Coffea arabica"
                },
                "total_production_places": len(production_places),
                "total_declared_area_ha": round(total_declared_area, 2),
                "production_places": production_places,
                "declaration_statement": (
                    "The operator certifies that all coffee batches referenced herein were produced on land "
                    "that has not been subject to deforestation after December 31, 2020, and conforms with the "
                    "relevant legislation of the country of production in accordance with EUDR Article 9."
                )
            }
        }
