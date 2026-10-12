#!/usr/bin/env python3
"""
Seeds connected vertical lot lineages across PostGIS plots, suppliers,
intake_lots, fermentation_batches, parchment_lots, green_coffee_lots,
roast_batches, cupping_scoresheets, and pack_lots.
"""

import os
import re
import sys
import uuid
import psycopg2
from datetime import date, timedelta

RAW_DB_URL = os.getenv("DATABASE_URL", "postgresql://xcc_admin:xcc_dev_pass_2083@postgres:5432/ximalaya_erp")
DB_URL = re.sub(r"^postgresql\+[a-zA-Z0-9_-]+://", "postgresql://", RAW_DB_URL)

LOT_CONFIGS = [
    {
        "pack_code": "PK-2083-GUL-001",
        "plot_label": "GUL-RURU-042",
        "sku": "Specialty Drip Coffee Box (7 Pack)",
        "roast_code": "R-2083-0212",
        "green_code": "GC-2083-GUL-01",
        "parchment_code": "PL-2083-GUL-01",
        "ferm_code": "FB-2083-01",
        "master_lot": "IL-2083-GUL-01",
        "method": "Wet Washed",
        "cupping": {"fragrance": 8.5, "flavor": 8.5, "aftertaste": 8.0, "acidity": 8.5, "body": 8.0, "balance": 8.5, "overall": 8.5},
        "cherry_kg": 520.0,
        "rate_npr": 115.00
    },
    {
        "pack_code": "PK-2083-GUL-002",
        "plot_label": "PAL-TAN-018",
        "sku": "Single Origin Whole Bean (250g)",
        "roast_code": "R-2083-0214",
        "green_code": "GC-2083-PAL-02",
        "parchment_code": "PL-2083-PAL-02",
        "ferm_code": "FB-2083-02",
        "master_lot": "IL-2083-PAL-02",
        "method": "Natural Anaerobic",
        "cupping": {"fragrance": 8.5, "flavor": 8.75, "aftertaste": 8.25, "acidity": 8.25, "body": 8.5, "balance": 8.5, "overall": 8.5},
        "cherry_kg": 480.0,
        "rate_npr": 120.00
    },
    {
        "pack_code": "PK-2083-GUL-003",
        "plot_label": "KAV-PAN-105",
        "sku": "Reserve Micro-Lot Filter Roast (200g)",
        "roast_code": "R-2083-0218",
        "green_code": "GC-2083-KAV-03",
        "parchment_code": "PL-2083-KAV-03",
        "ferm_code": "FB-2083-03",
        "master_lot": "IL-2083-KAV-03",
        "method": "Yellow Honey",
        "cupping": {"fragrance": 8.75, "flavor": 8.75, "aftertaste": 8.5, "acidity": 8.5, "body": 8.5, "balance": 8.5, "overall": 8.5},
        "cherry_kg": 350.0,
        "rate_npr": 130.00
    },
    {
        "pack_code": "PK-2083-GUL-004",
        "plot_label": "NUW-BID-077",
        "sku": "Specialty Drip Coffee Box (7 Pack)",
        "roast_code": "R-2083-0220",
        "green_code": "GC-2083-NUW-04",
        "parchment_code": "PL-2083-NUW-04",
        "ferm_code": "FB-2083-04",
        "master_lot": "IL-2083-NUW-04",
        "method": "Washed Double Soak",
        "cupping": {"fragrance": 8.25, "flavor": 8.5, "aftertaste": 8.25, "acidity": 8.5, "body": 8.25, "balance": 8.5, "overall": 8.5},
        "cherry_kg": 600.0,
        "rate_npr": 118.00
    },
    {
        "pack_code": "PK-2083-GUL-005",
        "plot_label": "KAS-MAC-012",
        "sku": "Grand Cru Selection (150g Tin)",
        "roast_code": "R-2083-0222",
        "green_code": "GC-2083-KAS-05",
        "parchment_code": "PL-2083-KAS-05",
        "ferm_code": "FB-2083-05",
        "master_lot": "IL-2083-KAS-05",
        "method": "High-Altitude Extended Natural",
        "cupping": {"fragrance": 9.0, "flavor": 9.0, "aftertaste": 8.75, "acidity": 8.5, "body": 8.75, "balance": 9.0, "overall": 9.0},
        "cherry_kg": 300.0,
        "rate_npr": 150.00
    }
]

def seed():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()

    try:
        # Get entity ID
        cur.execute("SELECT id FROM operating_entities LIMIT 1;")
        entity_id = cur.fetchone()[0]

        for cfg in LOT_CONFIGS:
            # 1. Fetch plot and supplier
            cur.execute("""
                SELECT fp.id, fp.supplier_id 
                FROM farm_plots fp 
                WHERE fp.plot_label = %s LIMIT 1;
            """, (cfg["plot_label"],))
            plot_row = cur.fetchone()
            if not plot_row:
                print(f"[!] Plot {cfg['plot_label']} missing, skipping...")
                continue
            plot_id, supplier_id = plot_row

            # 2. Intake lot
            intake_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO intake_lots (
                    id, entity_id, supplier_id, plot_id, master_lot_code, 
                    cherry_weight_kg, assigned_grade, rate_per_kg_npr, payout_settled
                ) VALUES (%s, %s, %s, %s, %s, %s, 'GRADE_1', %s, true)
                ON CONFLICT (master_lot_code) DO UPDATE 
                SET cherry_weight_kg = EXCLUDED.cherry_weight_kg
                RETURNING id;
            """, (intake_id, entity_id, supplier_id, plot_id, cfg["master_lot"], cfg["cherry_kg"], cfg["rate_npr"]))
            intake_id = cur.fetchone()[0]

            # 3. Fermentation batch
            ferm_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO fermentation_batches (
                    id, intake_lot_id, batch_code, processing_method, tank_identifier, duration_hours
                ) VALUES (%s, %s, %s, %s, 'TANK-01', 36)
                ON CONFLICT (batch_code) DO UPDATE 
                SET processing_method = EXCLUDED.processing_method
                RETURNING id;
            """, (ferm_id, intake_id, cfg["ferm_code"], cfg["method"]))
            ferm_id = cur.fetchone()[0]

            # 4. Parchment lot
            parch_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO parchment_lots (
                    id, fermentation_batch_id, parchment_lot_code, final_moisture_pct, dry_weight_kg
                ) VALUES (%s, %s, %s, 10.8, %s)
                ON CONFLICT (parchment_lot_code) DO UPDATE 
                SET dry_weight_kg = EXCLUDED.dry_weight_kg
                RETURNING id;
            """, (parch_id, ferm_id, cfg["parchment_code"], cfg["cherry_kg"] * 0.20))
            parch_id = cur.fetchone()[0]

            # 5. Green coffee lot
            green_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO green_coffee_lots (
                    id, parchment_lot_id, green_lot_code, density_g_per_l, net_weight_kg
                ) VALUES (%s, %s, %s, 715.0, %s)
                ON CONFLICT (green_lot_code) DO UPDATE 
                SET net_weight_kg = EXCLUDED.net_weight_kg
                RETURNING id;
            """, (green_id, parch_id, cfg["green_code"], cfg["cherry_kg"] * 0.16))
            green_id = cur.fetchone()[0]

            # 6. Roast batch
            roast_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO roast_batches (
                    id, green_lot_id, roast_batch_code, drop_temp_celsius, 
                    roast_duration_seconds, agtron_color_score, batch_weight_kg
                ) VALUES (%s, %s, %s, 214.5, 685, 62.5, %s)
                ON CONFLICT (roast_batch_code) DO UPDATE 
                SET batch_weight_kg = EXCLUDED.batch_weight_kg
                RETURNING id;
            """, (roast_id, green_id, cfg["roast_code"], cfg["cherry_kg"] * 0.13))
            roast_id = cur.fetchone()[0]

            # 7. Cupping scoresheet
            c = cfg["cupping"]
            cur.execute("SELECT id FROM cupping_scoresheets WHERE roast_batch_id = %s LIMIT 1;", (roast_id,))
            if not cur.fetchone():
                cur.execute("""
                    INSERT INTO cupping_scoresheets (
                        id, roast_batch_id, fragrance_aroma, flavor, aftertaste,
                        acidity, body, balance, overall_score
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (str(uuid.uuid4()), roast_id, c["fragrance"], c["flavor"], c["aftertaste"], c["acidity"], c["body"], c["balance"], c["overall"]))

            # 8. Pack lot
            pack_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO pack_lots (
                    id, roast_batch_id, pack_lot_code, sku_type, units_packaged, best_before_date
                ) VALUES (%s, %s, %s, %s, 150, %s)
                ON CONFLICT (pack_lot_code) DO UPDATE 
                SET sku_type = EXCLUDED.sku_type;
            """, (pack_id, roast_id, cfg["pack_code"], cfg["sku"], date.today() + timedelta(days=365)))

        conn.commit()
        print("[✓] Successfully seeded full relational lineage graph for all 5 lots!")

    except Exception as e:
        conn.rollback()
        print(f"[!] Error: {e}")
        sys.exit(1)
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed()
