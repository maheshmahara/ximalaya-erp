CREATE TABLE IF NOT EXISTS intake_lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES operating_entities(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    plot_id UUID NOT NULL REFERENCES farm_plots(id),
    master_lot_code VARCHAR(32) UNIQUE NOT NULL,
    raw_variety VARCHAR(64) NOT NULL DEFAULT 'Bourbon/Typica',
    cherry_weight_kg NUMERIC(10,2) NOT NULL,
    assigned_grade VARCHAR(8) NOT NULL DEFAULT 'GRADE_1',
    rate_per_kg_npr NUMERIC(10,2) NOT NULL,
    payout_settled BOOLEAN NOT NULL DEFAULT false,
    harvest_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fermentation_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intake_lot_id UUID NOT NULL REFERENCES intake_lots(id),
    batch_code VARCHAR(32) UNIQUE NOT NULL,
    processing_method VARCHAR(32) NOT NULL DEFAULT 'WASHED',
    tank_identifier VARCHAR(16) NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 36,
    ph_reading NUMERIC(3,2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parchment_lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fermentation_batch_id UUID NOT NULL REFERENCES fermentation_batches(id),
    parchment_lot_code VARCHAR(32) UNIQUE NOT NULL,
    final_moisture_pct NUMERIC(4,2) NOT NULL DEFAULT 10.5,
    dry_weight_kg NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS green_coffee_lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parchment_lot_id UUID NOT NULL REFERENCES parchment_lots(id),
    green_lot_code VARCHAR(32) UNIQUE NOT NULL,
    density_g_per_l NUMERIC(6,2) NOT NULL DEFAULT 710.0,
    screen_size VARCHAR(16) NOT NULL DEFAULT '16-18',
    net_weight_kg NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roast_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    green_lot_id UUID NOT NULL REFERENCES green_coffee_lots(id),
    roast_batch_code VARCHAR(32) UNIQUE NOT NULL,
    drop_temp_celsius NUMERIC(5,2) NOT NULL DEFAULT 214.5,
    roast_duration_seconds INTEGER NOT NULL DEFAULT 685,
    agtron_color_score NUMERIC(4,1) NOT NULL DEFAULT 62.5,
    batch_weight_kg NUMERIC(8,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cupping_scoresheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roast_batch_id UUID NOT NULL REFERENCES roast_batches(id),
    fragrance_aroma NUMERIC(3,1) NOT NULL DEFAULT 8.0,
    flavor NUMERIC(3,1) NOT NULL DEFAULT 8.0,
    aftertaste NUMERIC(3,1) NOT NULL DEFAULT 8.0,
    acidity NUMERIC(3,1) NOT NULL DEFAULT 8.0,
    body NUMERIC(3,1) NOT NULL DEFAULT 8.0,
    balance NUMERIC(3,1) NOT NULL DEFAULT 8.0,
    overall_score NUMERIC(3,1) NOT NULL DEFAULT 8.5,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pack_lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roast_batch_id UUID NOT NULL REFERENCES roast_batches(id),
    pack_lot_code VARCHAR(32) UNIQUE NOT NULL,
    sku_type VARCHAR(64) NOT NULL DEFAULT 'Specialty Drip Box (7 Pack)',
    units_packaged INTEGER NOT NULL,
    best_before_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
