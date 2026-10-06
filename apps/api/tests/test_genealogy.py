import pytest
from apps.api.src.modules.traceability.genealogy_service import BatchGenealogyService

def test_batch_genealogy_chain_integrity():
    batch = BatchGenealogyService.get_genealogy_audit("PK-2083-0459")
    
    assert batch["batch_code"] == "PK-2083-0459"
    assert batch["origin_plot"] == "PLOT-GUL-042"
    assert len(batch["stages"]) == 5
    
    # Verify Cherry to Dry Parchment conversion (approx 18-20% ratio)
    cherry_in = batch["stages"][0]["input_weight_kg"]
    parchment_out = batch["stages"][1]["output_weight_kg"]
    assert 180.0 <= parchment_out <= 210.0
    
    # Verify Dry Parchment moisture is strictly between 10.5% and 11.5%
    moisture = batch["stages"][1]["moisture_pct"]
    assert 10.5 <= moisture <= 11.5
    
    # Verify Roasting shrinkage corridor (13.5% - 17.0%)
    roast_stage = batch["stages"][3]
    assert 13.5 <= roast_stage["loss_pct"] <= 17.0
    
    # Verify Identity Preserved status
    assert batch["eudr_segregation_mode"] == "IDENTITY_PRESERVED_MICRO_LOT"
