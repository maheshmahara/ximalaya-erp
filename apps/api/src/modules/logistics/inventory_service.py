from typing import Dict, Any, List

class WarehouseInventoryService:
    # In-memory mock store for finished goods stock
    INVENTORY: Dict[str, Dict[str, Any]] = {
        "SKU-DRIP-GUL-7X10G": {
            "sku": "SKU-DRIP-GUL-7X10G",
            "name": "Single-Serve Drip Box (7 x 10g) - Gulmi Honey",
            "gtin": "08901234567890",
            "on_hand": 140,
            "allocated": 20,
            "bin_location": "BIN-KTM-WH1-R04",
            "cost_npr_per_unit": 650.0,
            "retail_npr_per_unit": 1250.0
        }
    }

    @classmethod
    def get_stock(cls, sku: str) -> Dict[str, Any]:
        if sku not in cls.INVENTORY:
            raise ValueError(f"SKU {sku} not found in warehouse registry")
        item = cls.INVENTORY[sku]
        atp = item["on_hand"] - item["allocated"]
        return {
            **item,
            "available_to_promise": atp
        }

    @classmethod
    def allocate_stock_for_order(cls, sku: str, quantity: int) -> Dict[str, Any]:
        if quantity <= 0:
            raise ValueError("Allocation quantity must be strictly positive")
        item = cls.get_stock(sku)
        if quantity > item["available_to_promise"]:
            raise ValueError(
                f"Insufficient stock for {sku}. Requested: {quantity}, ATP: {item['available_to_promise']}"
            )
        cls.INVENTORY[sku]["allocated"] += quantity
        return cls.get_stock(sku)

    @classmethod
    def dispatch_and_deplete_stock(cls, sku: str, quantity: int) -> Dict[str, Any]:
        item = cls.get_stock(sku)
        if quantity > item["allocated"]:
            raise ValueError(f"Cannot dispatch more than allocated stock ({item['allocated']})")
        cls.INVENTORY[sku]["allocated"] -= quantity
        cls.INVENTORY[sku]["on_hand"] -= quantity
        return cls.get_stock(sku)
