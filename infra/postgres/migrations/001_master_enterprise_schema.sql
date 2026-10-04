CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE operating_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) UNIQUE NOT NULL,
    legal_name VARCHAR(128) NOT NULL,
    vat_pan_number VARCHAR(32) NOT NULL,
    base_currency VARCHAR(3) DEFAULT 'NPR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES operating_entities(id),
    supplier_code VARCHAR(32) UNIQUE NOT NULL,
    supplier_type VARCHAR(32) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    phone_number VARCHAR(16) NOT NULL,
    pan_number VARCHAR(32),
    district VARCHAR(64) NOT NULL,
    altitude_masl INT NOT NULL,
    payment_method_pref VARCHAR(32) DEFAULT 'BANK',
    name_on_bag_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE farm_plots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    plot_label VARCHAR(64) NOT NULL,
    area_hectares NUMERIC(8, 4) NOT NULL,
    altitude_masl INT NOT NULL,
    location_point GEOMETRY(Point, 4326),
    boundary_polygon GEOMETRY(Polygon, 4326),
    is_eudr_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE intake_lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_lot_code VARCHAR(64) UNIQUE NOT NULL,
    entity_id UUID NOT NULL REFERENCES operating_entities(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    plot_id UUID REFERENCES farm_plots(id),
    raw_variety VARCHAR(32) NOT NULL,
    harvest_timestamp TIMESTAMPTZ NOT NULL,
    intake_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    gross_weight_kg NUMERIC(12, 3) NOT NULL,
    tare_weight_kg NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    net_weight_kg NUMERIC(12, 3) GENERATED ALWAYS AS (gross_weight_kg - tare_weight_kg) STORED,
    brix_reading NUMERIC(4, 1) NOT NULL,
    floaters_pct NUMERIC(5, 2) NOT NULL,
    defect_pct NUMERIC(5, 2) NOT NULL,
    assigned_grade VARCHAR(8) NOT NULL,
    rate_per_kg_npr NUMERIC(14, 2) NOT NULL,
    total_payout_npr NUMERIC(14, 2) GENERATED ALWAYS AS ((gross_weight_kg - tare_weight_kg) * rate_per_kg_npr) STORED,
    pulp_by_deadline TIMESTAMPTZ GENERATED ALWAYS AS (harvest_timestamp + INTERVAL '8 hours') STORED,
    status VARCHAR(32) DEFAULT 'INTAKE_APPROVED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
