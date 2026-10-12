#!/usr/bin/env python3
"""
Ximalaya Coffee ERP - PostGIS Micro-Terroir & Cadastral Plot Seeder
Populates operating entity, suppliers, and farm plots with real PostGIS
geometries for authentic Himalayan specialty terroirs and EUDR compliance.
"""

import os
import re
import sys
import uuid
import psycopg2

RAW_DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://xcc_admin:xcc_dev_pass_2083@postgres:5432/ximalaya_erp"
)
DB_URL = re.sub(r"^postgresql\+[a-zA-Z0-9_-]+://", "postgresql://", RAW_DB_URL)

OPERATING_ENTITY = {
    "code": "XCC-HQ",
    "legal_name": "Ximalaya Specialty Coffee Producers Pvt. Ltd.",
    "vat_pan_number": "609823412",
    "base_currency": "NPR",
}

SEED_PARCELS = [
    {
        "farmer_name": "Sita Gurung",
        "supplier_code": "SUP-GUL-001",
        "phone_number": "+977-9847000101",
        "district": "Gulmi",
        "plot_label": "GUL-RURU-042",
        "area_hectares": 0.45,
        "altitude_masl": 1450,
        "lon": 83.4385,
        "lat": 27.9840,
        "polygon": [
            (83.4382, 27.9838),
            (83.4389, 27.9839),
            (83.4388, 27.9843),
            (83.4381, 27.9842),
            (83.4382, 27.9838)
        ],
        "is_eudr_verified": True
    },
    {
        "farmer_name": "Bhim Bahadur Thapa",
        "supplier_code": "SUP-PAL-002",
        "phone_number": "+977-9847000102",
        "district": "Palpa",
        "plot_label": "PAL-TAN-018",
        "area_hectares": 0.72,
        "altitude_masl": 1380,
        "lon": 83.5460,
        "lat": 27.8710,
        "polygon": [
            (83.5456, 27.8707),
            (83.5464, 27.8708),
            (83.5465, 27.8714),
            (83.5457, 27.8713),
            (83.5456, 27.8707)
        ],
        "is_eudr_verified": True
    },
    {
        "farmer_name": "Kamala Shrestha",
        "supplier_code": "SUP-KAV-003",
        "phone_number": "+977-9847000103",
        "district": "Kavrepalanchok",
        "plot_label": "KAV-PAN-105",
        "area_hectares": 0.38,
        "altitude_masl": 1520,
        "lon": 85.5180,
        "lat": 27.5840,
        "polygon": [
            (85.5177, 27.5837),
            (85.5184, 27.5838),
            (85.5183, 27.5843),
            (85.5176, 27.5842),
            (85.5177, 27.5837)
        ],
        "is_eudr_verified": True
    },
    {
        "farmer_name": "Ram Kumar Tamang",
        "supplier_code": "SUP-NUW-004",
        "phone_number": "+977-9847000104",
        "district": "Nuwakot",
        "plot_label": "NUW-BID-077",
        "area_hectares": 1.15,
        "altitude_masl": 1490,
        "lon": 85.1620,
        "lat": 27.9150,
        "polygon": [
            (85.1614, 27.9145),
            (85.1628, 27.9147),
            (85.1625, 27.9156),
            (85.1612, 27.9153),
            (85.1614, 27.9145)
        ],
        "is_eudr_verified": True
    },
    {
        "farmer_name": "Chitra Bahadur Pun",
        "supplier_code": "SUP-KAS-005",
        "phone_number": "+977-9847000105",
        "district": "Kaski",
        "plot_label": "KAS-MAC-012",
        "area_hectares": 0.55,
        "altitude_masl": 1610,
        "lon": 83.9210,
        "lat": 28.3420,
        "polygon": [
            (83.9205, 28.3416),
            (83.9215, 28.3417),
            (83.9214, 28.3424),
            (83.9204, 28.3422),
            (83.9205, 28.3416)
        ],
        "is_eudr_verified": True
    }
]

def make_wkt_polygon(coords):
    coord_strs = [f"{lon} {lat}" for lon, lat in coords]
    return f"POLYGON(({', '.join(coord_strs)}))"

def seed_database():
    print(f"[*] Connecting to PostGIS at {DB_URL.split('@')[-1]}...")
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()

    try:
        # 1. Ensure Operating Entity exists
        cur.execute("SELECT id FROM operating_entities WHERE code = %s LIMIT 1;", (OPERATING_ENTITY["code"],))
        entity_row = cur.fetchone()
        if not entity_row:
            entity_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO operating_entities (id, code, legal_name, vat_pan_number, base_currency, is_active)
                VALUES (%s, %s, %s, %s, %s, true);
            """, (
                entity_id,
                OPERATING_ENTITY["code"],
                OPERATING_ENTITY["legal_name"],
                OPERATING_ENTITY["vat_pan_number"],
                OPERATING_ENTITY["base_currency"]
            ))
            print(f"[✓] Created default operating entity: {OPERATING_ENTITY['legal_name']}")
        else:
            entity_id = entity_row[0]

        # 2. Upsert Suppliers and Farm Plots
        for parcel in SEED_PARCELS:
            # Supplier upsert
            cur.execute("SELECT id FROM suppliers WHERE supplier_code = %s LIMIT 1;", (parcel["supplier_code"],))
            sup_row = cur.fetchone()
            if not sup_row:
                supplier_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO suppliers (
                        id, entity_id, supplier_code, supplier_type, full_name,
                        phone_number, district, altitude_masl, payment_method_pref,
                        name_on_bag_consent
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (
                    supplier_id,
                    entity_id,
                    parcel["supplier_code"],
                    "SMALLHOLDER",
                    parcel["farmer_name"],
                    parcel["phone_number"],
                    parcel["district"],
                    parcel["altitude_masl"],
                    "BANK",
                    True
                ))
            else:
                supplier_id = sup_row[0]
                cur.execute("""
                    UPDATE suppliers
                    SET full_name = %s, phone_number = %s, district = %s, altitude_masl = %s
                    WHERE id = %s;
                """, (
                    parcel["farmer_name"],
                    parcel["phone_number"],
                    parcel["district"],
                    parcel["altitude_masl"],
                    supplier_id
                ))

            # Farm Plot upsert
            point_wkt = f"POINT({parcel['lon']} {parcel['lat']})"
            wkt_poly = make_wkt_polygon(parcel["polygon"])

            cur.execute("SELECT id FROM farm_plots WHERE plot_label = %s LIMIT 1;", (parcel["plot_label"],))
            plot_row = cur.fetchone()
            if not plot_row:
                cur.execute("""
                    INSERT INTO farm_plots (
                        id, supplier_id, plot_label, area_hectares, altitude_masl,
                        location_point, boundary_polygon, is_eudr_verified
                    ) VALUES (
                        %s, %s, %s, %s, %s,
                        ST_SetSRID(ST_GeomFromText(%s), 4326),
                        ST_SetSRID(ST_GeomFromText(%s), 4326),
                        %s
                    );
                """, (
                    str(uuid.uuid4()),
                    supplier_id,
                    parcel["plot_label"],
                    parcel["area_hectares"],
                    parcel["altitude_masl"],
                    point_wkt,
                    wkt_poly,
                    parcel["is_eudr_verified"]
                ))
            else:
                cur.execute("""
                    UPDATE farm_plots
                    SET 
                        supplier_id = %s,
                        area_hectares = %s,
                        altitude_masl = %s,
                        location_point = ST_SetSRID(ST_GeomFromText(%s), 4326),
                        boundary_polygon = ST_SetSRID(ST_GeomFromText(%s), 4326),
                        is_eudr_verified = %s
                    WHERE plot_label = %s;
                """, (
                    supplier_id,
                    parcel["area_hectares"],
                    parcel["altitude_masl"],
                    point_wkt,
                    wkt_poly,
                    parcel["is_eudr_verified"],
                    parcel["plot_label"]
                ))

        conn.commit()
        print(f"[✓] Successfully seeded {len(SEED_PARCELS)} Himalayan farm plots & suppliers.")

        # Verification table output
        cur.execute("""
            SELECT 
                fp.plot_label,
                s.full_name,
                s.district,
                fp.altitude_masl,
                fp.area_hectares,
                ST_NPoints(fp.boundary_polygon) as vertices,
                ST_AsText(fp.location_point) as centroid
            FROM farm_plots fp
            JOIN suppliers s ON fp.supplier_id = s.id
            ORDER BY fp.created_at ASC;
        """)
        rows = cur.fetchall()
        print("\nRegistered Cadastral Plots in PostGIS:")
        print(f"{'Plot':<13} | {'Farmer':<20} | {'District':<14} | {'Altitude':<9} | {'Area':<6} | {'Centroid'}")
        print("-" * 95)
        for r in rows:
            print(f"{r[0]:<13} | {r[1]:<20} | {r[2]:<14} | {r[3]} MASL  | {r[4]} ha | {r[6]}")

    except Exception as e:
        conn.rollback()
        print(f"[!] Error during seeding: {e}")
        sys.exit(1)
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_database()
