from decimal import Decimal, ROUND_UP
from typing import Dict, Any

class DripBoxBOM:
    def __init__(
        self,
        bags_per_box: int = 7,
        vat_rate: Decimal = Decimal("0.13"),
        filter_paper_cost: Decimal = Decimal("30.00"),
        sticker_cost: Decimal = Decimal("4.00"),
        box_cost: Decimal = Decimal("18.00"),
        coffee_grams_per_bag: Decimal = Decimal("12.00"),
        roasted_coffee_rate_per_g: Decimal = Decimal("3.00")
    ):
        self.bags_per_box = bags_per_box
        self.vat_rate = vat_rate
        self.filter_paper_cost = filter_paper_cost
        self.sticker_cost = sticker_cost
        self.box_cost = box_cost
        self.coffee_grams_per_bag = coffee_grams_per_bag
        self.roasted_coffee_rate_per_g = roasted_coffee_rate_per_g

    def get_unit_cost_price(self) -> Dict[str, Decimal]:
        coffee_per_bag = self.coffee_grams_per_bag * self.roasted_coffee_rate_per_g
        bag_material = self.filter_paper_cost + self.sticker_cost + coffee_per_bag
        cp_box = (bag_material * Decimal(self.bags_per_box)) + self.box_cost
        cp_bag = (cp_box / Decimal(self.bags_per_box)).quantize(Decimal("0.01"))
        return {"cp_per_box": cp_box, "cp_per_bag": cp_bag}

    def compute_channel_quote(self, target_margin: Decimal, commission: Decimal = Decimal("0.00"), delivery_per_box: Decimal = Decimal("0.00")) -> Dict[str, Any]:
        cp = self.get_unit_cost_price()["cp_per_box"]
        full_cost = cp + delivery_per_box
        divisor = Decimal("1.00") - (target_margin + commission)
        suggested_net = full_cost / divisor
        unrounded_mrp = suggested_net * (Decimal("1.00") + self.vat_rate)
        final_mrp = (unrounded_mrp / Decimal("10")).quantize(Decimal("1"), rounding=ROUND_UP) * Decimal("10")
        actual_net = (final_mrp / (Decimal("1.00") + self.vat_rate)).quantize(Decimal("0.01"))
        vat_amount = final_mrp - actual_net
        commission_amt = (actual_net * commission).quantize(Decimal("0.01"))
        profit_per_box = actual_net - full_cost - commission_amt
        actual_margin = ((profit_per_box / actual_net) * Decimal("100.00")).quantize(Decimal("0.01"))
        return {
            "full_cost_npr": full_cost,
            "final_mrp_incl_vat": final_mrp,
            "net_price_ex_vat": actual_net,
            "vat_13_pct": vat_amount,
            "profit_per_box": profit_per_box,
            "actual_margin_pct": f"{actual_margin}%"
        }
