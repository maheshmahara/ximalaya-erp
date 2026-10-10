CREATE EXTENSION IF NOT EXISTS postgis;

-- Ensure table has required PostGIS geometry and compliant columns
CREATE TABLE IF NOT EXISTS farm_plots_cadastral (
    id SERIAL PRIMARY KEY,
    plot_ref VARCHAR(64) UNIQUE NOT NULL,
    farmer_name VARCHAR(128) NOT NULL,
    cooperative VARCHAR(128) NOT NULL,
    district VARCHAR(64) NOT NULL,
    elevation_masl INTEGER NOT NULL,
    area_hectares NUMERIC(6, 2) NOT NULL,
    deforestation_cutoff_date DATE NOT NULL DEFAULT '2020-12-31',
    is_eudr_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    geom GEOMETRY(Polygon, 4326) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_farm_plots_cadastral_geom ON farm_plots_cadastral USING GIST(geom);

INSERT INTO farm_plots_cadastral (plot_ref, farmer_name, cooperative, district, elevation_masl, area_hectares, geom)
VALUES 
(
    'PLOT-GUL-042',
    'Sita Gurung',
    'Ruru Coffee Sahakari',
    'Gulmi',
    1450,
    0.40,
    ST_GeomFromText('POLYGON((83.4370 27.9825, 83.4400 27.9825, 83.4400 27.9855, 83.4370 27.9855, 83.4370 27.9825))', 4326)
),
(
    'PLOT-GUL-043',
    'Ram Bahadur Thapa',
    'Ruru Coffee Sahakari',
    'Gulmi',
    1520,
    0.65,
    ST_GeomFromText('POLYGON((83.4135 28.0110, 83.4165 28.0110, 83.4165 28.0140, 83.4135 28.0140, 83.4135 28.0110))', 4326)
),
(
    'PLOT-PAL-101',
    'Devi Prasad Sharma',
    'Madanpokhara Sahakari',
    'Palpa',
    1380,
    0.85,
    ST_GeomFromText('POLYGON((83.5395 27.8705, 83.5425 27.8705, 83.5425 27.8735, 83.5395 27.8735, 83.5395 27.8705))', 4326)
),
(
    'PLOT-PAL-102',
    'Sunita Magar',
    'Tansen Coffee Producer Union',
    'Palpa',
    1410,
    0.52,
    ST_GeomFromText('POLYGON((83.5165 27.8935, 83.5195 27.8935, 83.5195 27.8965, 83.5165 27.8965, 83.5165 27.8935))', 4326)
)
ON CONFLICT (plot_ref) DO UPDATE 
SET area_hectares = EXCLUDED.area_hectares,
    geom = EXCLUDED.geom;
