-- Idempotent migration for existing PostGIS volumes (T24)
CREATE TABLE IF NOT EXISTS plot_climate_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puc VARCHAR(50) NOT NULL REFERENCES plots(puc) ON DELETE CASCADE,
    temperature_c NUMERIC(5, 2) NOT NULL,
    humidity_pct NUMERIC(5, 2) NOT NULL,
    sensor_id VARCHAR(64),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plot_climate_readings_puc ON plot_climate_readings (puc);
CREATE INDEX IF NOT EXISTS idx_plot_climate_readings_recorded_at ON plot_climate_readings (recorded_at DESC);
