import copy
from apps.api.src.scripts.seed_demo_data import run_seed, DEMO_PLOTS
from apps.api.src.modules.logistics.inventory_service import WarehouseInventoryService

def test_idempotent_demo_seeder():
    # Preserve original in-memory state before seeding
    original_state = copy.deepcopy(WarehouseInventoryService.INVENTORY)
    
    try:
        run_seed()
        
        assert len(DEMO_PLOTS) >= 3
        assert "SKU-DRIP-GUL-7X10G" in WarehouseInventoryService.INVENTORY
        assert "SKU-WB-GUL-250G" in WarehouseInventoryService.INVENTORY
        
        drip_item = WarehouseInventoryService.INVENTORY["SKU-DRIP-GUL-7X10G"]
        assert drip_item["on_hand"] == 250
        assert drip_item["allocated"] == 25
    finally:
        # Restore state so subsequent test modules remain isolated
        WarehouseInventoryService.INVENTORY.clear()
        WarehouseInventoryService.INVENTORY.update(original_state)
