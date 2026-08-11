-- GIS Service spatial schema (BA §3.2)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS plots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puc VARCHAR(50) NOT NULL UNIQUE,
    farmer_id UUID NOT NULL,
    plot_name VARCHAR(100) NOT NULL,
    boundary GEOMETRY(Polygon, 4326) NOT NULL,
    area_m2 NUMERIC(12, 2) NOT NULL,
    crop_type VARCHAR(50) NOT NULL,
    growth_status VARCHAR(20) DEFAULT 'DANG_TRONG'
        CHECK (growth_status IN ('DANG_TRONG', 'PHAT_TRIEN', 'RA_HOA', 'THU_HOACH', 'NGHI_CANH')),
    risk_level INT DEFAULT 0 CHECK (risk_level IN (0, 1, 2)),
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plots_boundary ON plots USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_plots_farmer_id ON plots (farmer_id);
CREATE INDEX IF NOT EXISTS idx_plots_risk_level ON plots (risk_level);

CREATE TABLE IF NOT EXISTS shipping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puc VARCHAR(50) NOT NULL REFERENCES plots(puc) ON DELETE CASCADE,
    batch_code VARCHAR(100) NOT NULL UNIQUE,
    harvest_date DATE NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipping_logs_puc ON shipping_logs (puc);

CREATE TABLE IF NOT EXISTS plot_disease_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puc VARCHAR(50) NOT NULL REFERENCES plots(puc) ON DELETE CASCADE,
    disease_name VARCHAR(100) NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL,
    xai_overlay_url TEXT,
    alert_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'MOI_PHAT_HIEN'
        CHECK (status IN ('MOI_PHAT_HIEN', 'DANG_XU_LY', 'DA_KHAC_PHUC'))
);

CREATE INDEX IF NOT EXISTS idx_plot_disease_alerts_puc ON plot_disease_alerts (puc);

CREATE TABLE IF NOT EXISTS growth_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puc VARCHAR(50) NOT NULL REFERENCES plots(puc) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_growth_status_history_puc ON growth_status_history (puc);

-- Sequence for PUC serial numbers per year
CREATE TABLE IF NOT EXISTS puc_sequences (
    province_code VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    last_value INT NOT NULL DEFAULT 0,
    PRIMARY KEY (province_code, year)
);
