import asyncio
from decimal import Decimal
from datetime import datetime, timezone, timedelta

def run_simulation():
    print("=" * 70)
    print("XIMALAYA COFFEE GROUP — FULL VERTICAL PIPELINE EXECUTION")
    print("Target Lot: PK-2083-0459 | Origin: Gulmi, Lumbini Province")
    print("=" * 70)

    # STAGE 1: FARM INTAKE & 8-HOUR CUTOFF CHECK
    harvest_time = datetime.now(timezone.utc) - timedelta(hours=3, minutes=15)
    intake_time = datetime.now(timezone.utc)
    elapsed_hours = (intake_time - harvest_time).total_seconds() / 3600.0

    gross_wt = Decimal("250.0")
    tare_wt = Decimal("10.0")
    net_cherry_kg = gross_wt - tare_wt

    brix = Decimal("22.5")
    floaters_pct = Decimal("1.4")
    base_rate = Decimal("100.00")
    bonus = Decimal("8.00") if (brix >= Decimal("21.0") and floaters_pct <= Decimal("2.0")) else Decimal("0.00")
    unit_rate = base_rate + bonus
    farmer_payout = (net_cherry_kg * unit_rate).quantize(Decimal("0.01"))

    print("\n[STAGE 1: FARM-GATE INTAKE]")
    print(f"  • Farmer: Sita Gurung (Ruru Sahakari, Plot: PLOT-GUL-042)")
    print(f"  • Elapsed Harvest Time: {elapsed_hours:.2f} hrs (Deadline: 8.0 hrs) -> PASSED")
    print(f"  • Cherry Net Weight: {net_cherry_kg} kg (Gross: {gross_wt} kg, Tare: {tare_wt} kg)")
    print(f"  • Quality: {brix}° Brix, {floaters_pct}% Floaters -> Grade A Bonus (+Rs {bonus})")
    print(f"  • Total Farmer Payout: Rs {farmer_payout:,.2f} (@ Rs {unit_rate}/kg)")

    # STAGE 2: BIOPROCESSING & DRYING
    parchment_yield_pct = Decimal("0.20")
    dry_parchment_kg = (net_cherry_kg * parchment_yield_pct).quantize(Decimal("0.01"))
    
    print("\n[STAGE 2: PRECISION WET MILL & DRYING]")
    print(f"  • Fermentation: 36 hrs Controlled Anaerobic (End pH: 4.02)")
    print(f"  • Drying Bed: Raised African Bed #04 (Target Moisture: 11.2%)")
    print(f"  • Dried Parchment Yield: {dry_parchment_kg} kg")

    # STAGE 3: DRY MILLING & MASS-BALANCE CHECK (0.5% Threshold)
    green_beans_kg = Decimal("38.40")
    husks_and_defects_kg = Decimal("9.60")
    total_milled_output = green_beans_kg + husks_and_defects_kg
    mass_diff_pct = (abs(dry_parchment_kg - total_milled_output) / dry_parchment_kg) * Decimal("100.00")

    print("\n[STAGE 3: DRY MILLING & POSTGIS LOT TRACE]")
    print(f"  • Input Parchment: {dry_parchment_kg} kg")
    print(f"  • Green Beans (Screen 16+): {green_beans_kg} kg")
    print(f"  • Husks / Defects: {husks_and_defects_kg} kg")
    print(f"  • Mass-Balance Variance: {mass_diff_pct:.2f}% (Limit: 0.50%) -> AUDIT PASS")

    # STAGE 4: ROASTING & SENSORY CUPPING
    green_charged_kg = green_beans_kg
    roasted_dropped_kg = Decimal("32.64")
    shrinkage_pct = ((green_charged_kg - roasted_dropped_kg) / green_charged_kg) * Decimal("100.00")
    is_corridor_valid = Decimal("13.50") <= shrinkage_pct <= Decimal("17.00")

    sca_scores = {
        "Fragrance": Decimal("8.50"), "Flavor": Decimal("8.50"), "Aftertaste": Decimal("8.25"),
        "Acidity": Decimal("8.50"), "Body": Decimal("8.25"), "Balance": Decimal("8.50"),
        "Uniformity": Decimal("10.00"), "Clean Cup": Decimal("10.00"), "Sweetness": Decimal("10.00"),
        "Overall": Decimal("8.50")
    }
    total_sca = sum(sca_scores.values())

    print("\n[STAGE 4: ROASTING & SENSORY CUPPING]")
    print(f"  • Charged: {green_charged_kg} kg | Dropped: {roasted_dropped_kg} kg")
    print(f"  • Roasting Shrinkage: {shrinkage_pct:.2f}% (Corridor: 13.5% - 17.0%) -> {'VALID' if is_corridor_valid else 'FAIL'}")
    print(f"  • SCA Total Cupping Score: {total_sca:.2f} / 100 -> SPECIALTY GRADE 1")
    print(f"  • Tasting Notes: Wild Honey, Red Plum, Jasmine, Himalayan Citrus")

    # STAGE 5: SERIALIZED PACKAGING
    coffee_per_box_kg = Decimal("0.105")
    total_boxes = int(roasted_dropped_kg // coffee_per_box_kg)
    leftover_g = (roasted_dropped_kg % coffee_per_box_kg) * Decimal("1000")

    print("\n[STAGE 5: SERIALIZED PACKAGING]")
    print(f"  • SKU: Specialty Drip Box (7x15g Sachets)")
    print(f"  • Units Packaged: {total_boxes} Retail Boxes (Residual: {leftover_g:.1f}g)")
    print(f"  • GS1 Serialized Range: PK-2083-0459-0001 through PK-2083-0459-0310")

    # STAGE 6: SALES & NEPAL IRD FISCAL INVOICE
    order_qty = Decimal("25")
    unit_price = Decimal("750.00")
    subtotal = order_qty * unit_price
    discount_pct = Decimal("5.00")
    discount_amt = (subtotal * (discount_pct / Decimal("100.00"))).quantize(Decimal("0.01"))
    taxable_amt = subtotal - discount_amt
    vat_amt = (taxable_amt * Decimal("0.13")).quantize(Decimal("0.01"))
    grand_total = taxable_amt + vat_amt

    print("\n[STAGE 6: COMMERCIAL BILLING & NEPAL IRD FISCALIZATION]")
    print(f"  • Invoice No: INV-2083/84-0104")
    print(f"  • Customer: Himalayan Summit Resort, Pokhara (PAN: 302948571)")
    print(f"  • Items: {order_qty} x Drip Boxes @ Rs {unit_price:,.2f} = Rs {subtotal:,.2f}")
    print(f"  • Trade Discount (5%): -Rs {discount_amt:,.2f}")
    print(f"  • Taxable Base: Rs {taxable_amt:,.2f}")
    print(f"  • Nepal VAT (13%): +Rs {vat_amt:,.2f}")
    print(f"  • Grand Total: Rs {grand_total:,.2f}")
    print(f"  • IRD Fiscal Sync: ACTIVE | Status: Synchronized (CBMS Portal)")
    print("=" * 70)

if __name__ == "__main__":
    run_simulation()
