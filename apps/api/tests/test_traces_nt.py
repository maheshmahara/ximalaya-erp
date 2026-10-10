import pytest
from apps.api.src.modules.traceability.traces_service import TracesExportService

def test_traces_nt_payload_compliance():
    dds_ref = "DDS-NP-2026-0042"
    pkg = TracesExportService.generate_traces_nt_payload(dds_reference=dds_ref)
    
    # 1. Structure and schema version
    assert pkg["traces_nt_version"] == "2.0.4"
    dds = pkg["due_diligence_statement"]
    assert dds["dds_reference"] == dds_ref
    assert dds["country_of_production"] == "NPL"
    assert dds["commodity"]["hs_code"] == "0901.11.00"
    
    # 2. Polygon geometry checks (Strict closed loop verification)
    places = dds["production_places"]
    assert len(places) == 2
    for p in places:
        coords = p["coordinates"]
        assert len(coords) >= 4  # Polygons require at least 4 points (3 vertices + closed loop point)
        assert coords[0] == coords[-1]  # First point must equal last point to be a valid closed loop
        assert p["deforestation_status"] == "DEFORESTATION_FREE_CERTIFIED"
        assert p["cutoff_date"] == "2020-12-31"

    # 3. Total declared area validation
    assert dds["total_declared_area_ha"] == 1.00
