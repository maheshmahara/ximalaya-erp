#!/usr/bin/env python3
"""
Ximalaya Coffee ERP - PostGIS Micro-Terroir & Cadastral Plot Seeder
Populates authentic coffee-growing parcels across Gulmi, Palpa, Nuwakot, 
and Kavre with high-precision PostGIS geometries for EUDR DDS compliance.
"""

import os
import re
import sys
import uuid
import psycopg2
from psycopg2.extras import execute_values

RAW_DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://xcc_admin:xcc_dev_pass_2083@postgres:5432/ximalaya_erp"
)
DB_URL = re.sub(r"^postgresql\+[a-zA-Z0-9_-]+://", "postgresql://", RAW_DB_URL)

SEED_PARCELS = [
    {
        "farmer_name": "Sita Gurung",
        "supplier_code": "SUP-GUL-001",
        "contact_phone": "+977-9847000101",
        "district": "Gulmi",
        "municipality": "Ruru Kshetra Rural Municipality",
        "plot_label": "GUL-RURU-042",
        "area_hectares": 0.45,
        "altitude_masl": 1450,
        "lon": 83.4385,
        "lat": 27.9840,
        # Multi-vertex polygon enclosure
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
        "contact_phone": "+977-9847000102",
        "district": "Palpa",
        "municipality": "Tansen Municipality",
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
        "contact_phone": "+977-9847000103",
        "district": "Kavrepalanchok",
        "municipality": "Panauti Municipality",
        "plot_label": "KAV-PAN-105",
        "area_hectares": 0.38,
        "altitude_masl": 1520,
        "lon": 85.5180,
        "lat": 27.5840,
        "polygon": [
            (83.5177, 27.5837),
            (83.5184, 27.5838),
            (83.5183, 27.5843),
            (83.5176, 27.5842),
            (83.5177, 27.5837)
        ],
        "is_eudr_verified": True
    },
    {
        "farmer_name": "Ram Kumar Tamang",
        "supplier_code": "SUP-NUW-004",
        "contact_phone": "+977-9847000104",
        "district": "Nuwakot",
        "municipality": "Bidur Municipality",
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
        "contact_phone": "+977-9847000105",
        "district": "Kaski",
        "municipality": "Machhapuchhre Rural Municipality",
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
        # Check suppliers table schema
        cur.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'suppliers' AND table_schema = 'public';
        """)
        supplier_cols = {row[0] for row in cur.fetchall()}
        
        seeded_plots = 0
        for parcel in SEED_PARCELS:
            # Upsert / Find Supplier
            supplier_id = None
            if "supplier_code" in supplier_cols:
                cur.execute(
                    "SELECT id FROM suppliers WHERE supplier_code = %s LIMIT 1;", 
                    (parcel["supplier_code"],)
                )
                row = cur.fetchone()
                if row:
                    supplier_id = row[0]
            
            if not supplier_id:
                supplier_id = str(uuid.uuid4())
                col_names = ["id"]
                vals = [supplier_id]
                
                if "supplier_code" in supplier_cols:
                    col_names.append("supplier_code")
                    vals.append(parcel["supplier_code"])
                if "full_name" in supplier_cols:
                    col_names.append("full_name")
                    vals.append(parcel["farmer_name"])
                elif "name" in supplier_cols:
                    col_names.append("name")
                    vals.append(parcel["farmer_name"])
                if "contact_phone" in supplier_cols:
                    col_names.append("contact_phone")
                    vals.append(parcel["contact_phone"])
                if "district" in supplier_cols:
                    col_names.append("district")
                    vals.append(parcel["district"])
                if "municipality" in supplier_cols:
                    col_names.append("municipality")
                    vals.append(parcel["municipality"])

                placeholders = ", ".join(["%s"] * len(vals))
                cur.execute(
                    f"INSERT INTO suppliers ({', '.join(col_names)}) VALUES ({placeholders});",
                    vals
                )

            # Check if plot already exists
            cur.execute("SELECT id FROM farm_plots WHERE plot_label = %s;", (parcel["plot_label"],))
            existing_plot = cur.fetchone()

            wkt_poly = make_wkt_polygon(parcel["polygon"])
            point_wkt = f"POINT({parcel['lon']} {parcel['lat']})"

            if not existing_plot:
                cur.execute("""
                    INSERT INTO farm_plots (
                        id, 
                        supplier_id, 
                        plot_label, 
                        area_hectares, 
                        altitude_masl, 
                        location_point, 
                        boundary_polygon, 
                        is_eudr_verified
                    )
                    VALUES (
                        %s, 
                        %s, 
                        %s, 
                        %s, 
                        %s, 
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
                seeded_plots += 1
            else:
                # Update geometry
                cur.execute("""
                    UPDATE farm_plots
                    SET 
                        altitude_masl = %s,
                        area_hectares = %s,
                        location_point = ST_SetSRID(ST_GeomFromText(%s), 4326),
                        boundary_polygon = ST_SetSRID(ST_GeomFromText(%s), 4326),
                        is_eudr_verified = %s
                    WHERE plot_label = %s;
                """, (
                    parcel["altitude_masl"],
                    parcel["area_hectares"],
                    point_wkt,
                    wkt_poly,
                    parcel["is_eudr_verified"],
                    parcel["plot_label"]
                ))

        conn.commit()
        print(f"[✓] Successfully seeded {len(SEED_PARCELS)} Himalayan micro-terroirs (New: {seeded_plots}).")

        # Output spatial verification
        cur.execute("""
            SELECT 
                fp.plot_label,
                fp.altitude_masl,
                fp.area_hectares,
                ST_AsText(fp.location_point) as centroid,
                ST_NPoints(fp.boundary_polygon) as polygon_vertices,
                fp.is_eudr_verified
            FROM farm_plots fp
            ORDER BY fp.created_at ASC;
        """)
        rows = cur.fetchall()
        print("\nRegistered Cadastral Plots in PostGIS:")
        print(f"{'Plot Label':<14} | {'Altitude':<9} | {'Area (ha)':<9} | {'Vertices':<8} | {'Centroid (Lon, Lat)'}")
        print("-" * 75)
        for r in rows:
            print(f"{r[0]:<14} | {r[1]} MASL  | {r[2]:<9} | {r[4]:<8} | {r[3]}")

    except Exception as e:
        conn.rollback()
        print(f"[!] Error during seeding: {e}")
        sys.exit(1)
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_database()
