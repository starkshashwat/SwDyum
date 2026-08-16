-- 008_shipping_tables.sql
-- Tables for Velocity Shipping integration
-- Idempotent: safe to re-run if some tables already exist

BEGIN;

CREATE TABLE IF NOT EXISTS shipping_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipping_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES shipping_providers(id) ON DELETE CASCADE,
    encrypted_api_key TEXT NOT NULL,
    key_last_four VARCHAR(4) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    last_tested_at TIMESTAMPTZ,
    test_status VARCHAR(50),  -- 'connected' | 'invalid_key' | 'not_tested'
    created_by_admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by_admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(provider_id, active) -- only one active credential per provider
);

CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES shipping_providers(id) ON DELETE CASCADE,
    velocity_warehouse_id VARCHAR(255),
    pickup_location VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS package_dimension_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label VARCHAR(100) NOT NULL,
    min_weight_kg NUMERIC(10,3) NOT NULL DEFAULT 0,
    max_weight_kg NUMERIC(10,3) NOT NULL,
    length_cm NUMERIC(10,2) NOT NULL,
    breadth_cm NUMERIC(10,2) NOT NULL,
    height_cm NUMERIC(10,2) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES shipping_providers(id),
    warehouse_id UUID REFERENCES warehouses(id),
    velocity_order_id VARCHAR(255),
    velocity_shipment_id VARCHAR(255),
    awb_code VARCHAR(100),
    courier_company_id VARCHAR(100),
    courier_name VARCHAR(255),
    payment_method VARCHAR(50),
    cod_collectible NUMERIC(12,2),
    sub_total NUMERIC(12,2),
    length_cm NUMERIC(10,2),
    breadth_cm NUMERIC(10,2),
    height_cm NUMERIC(10,2),
    weight_kg NUMERIC(10,3),
    label_url TEXT,
    manifest_url TEXT,
    velocity_status VARCHAR(100),
    internal_status VARCHAR(100),
    customer_visible_status VARCHAR(100),
    charges_json JSONB,
    last_synced_at TIMESTAMPTZ,
    created_by_admin_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(order_id, provider_id)
);

CREATE TABLE IF NOT EXISTS shipment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    provider_event_id VARCHAR(255),
    velocity_status VARCHAR(100),
    internal_status VARCHAR(100),
    location VARCHAR(255),
    message TEXT,
    event_time TIMESTAMPTZ,
    raw_payload_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipping_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    request_json JSONB,
    response_json JSONB,
    status_code INT,
    success BOOLEAN,
    error_message TEXT,
    created_by_admin_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES shipping_providers(id) ON DELETE CASCADE,
    event_type VARCHAR(100),
    awb_code VARCHAR(100),
    velocity_shipment_id VARCHAR(255),
    raw_payload_json JSONB,
    processed BOOLEAN NOT NULL DEFAULT false,
    processing_error TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- Seed data (skip if already exists)
INSERT INTO shipping_providers (name, code, active)
VALUES ('Velocity', 'velocity', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO package_dimension_presets (label, min_weight_kg, max_weight_kg, length_cm, breadth_cm, height_cm, sort_order, is_default) VALUES
    ('0 to 0.5 kg',  0,   0.5, 15, 10, 8,  1, true),
    ('0.5 to 1 kg',  0.5, 1,   20, 15, 10, 2, false),
    ('1 to 2 kg',    1,   2,   25, 20, 12, 3, false),
    ('2 to 5 kg',    2,   5,   30, 25, 15, 4, false)
ON CONFLICT DO NOTHING;

COMMIT;

