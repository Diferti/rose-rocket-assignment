-- This file is automatically executed when Docker container starts
-- Same as schema.sql but for Docker initialization

-- Enable PostGIS extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    
    -- Origin location
    origin_city VARCHAR(100) NOT NULL,
    origin_postal_code VARCHAR(20), -- OPTIONAL but recommended for accurate distance calculation
    -- When provided: geocoding uses specific postal code location (more accurate)
    -- When omitted: geocoding uses city center (approximate quote)
    -- Both options are valid - use postal code for precise quotes, skip for quick estimates
    origin_state_province VARCHAR(50),
    origin_country VARCHAR(2) NOT NULL,
    origin_coordinates GEOGRAPHY(POINT, 4326), -- Geocoded from postal code (if provided) or city center (for approximate)
    
    -- Destination location
    destination_city VARCHAR(100) NOT NULL,
    destination_postal_code VARCHAR(20), -- OPTIONAL but recommended for accurate distance calculation
    -- When provided: geocoding uses specific postal code location (more accurate)
    -- When omitted: geocoding uses city center (approximate quote)
    -- Both options are valid - use postal code for precise quotes, skip for quick estimates
    destination_state_province VARCHAR(50),
    destination_country VARCHAR(2) NOT NULL,
    destination_coordinates GEOGRAPHY(POINT, 4326), -- Geocoded from postal code (if provided) or city center (for approximate)
    
    -- Lane
    lane VARCHAR(255),
    
    -- Shipment details
    equipment_type VARCHAR(20) NOT NULL CHECK (equipment_type IN ('dry_van', 'reefer', 'flatbed', 'step_deck', 'hotshot', 'straight_truck')),
    total_weight DECIMAL(10, 2),
    pickup_date DATE,
    
    -- Calculated fields
    distance_miles DECIMAL(10, 2),
    distance_kilometers DECIMAL(10, 2),
    quote_amount DECIMAL(10, 2) NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quotes_origin_city ON quotes(origin_city);
CREATE INDEX IF NOT EXISTS idx_quotes_destination_city ON quotes(destination_city);
CREATE INDEX IF NOT EXISTS idx_quotes_origin_postal_code ON quotes(origin_postal_code);
CREATE INDEX IF NOT EXISTS idx_quotes_destination_postal_code ON quotes(destination_postal_code);
CREATE INDEX IF NOT EXISTS idx_quotes_equipment_type ON quotes(equipment_type);
CREATE INDEX IF NOT EXISTS idx_quotes_pickup_date ON quotes(pickup_date);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_lane ON quotes(lane);

-- Spatial indexes
CREATE INDEX IF NOT EXISTS idx_quotes_origin_coordinates ON quotes USING GIST(origin_coordinates);
CREATE INDEX IF NOT EXISTS idx_quotes_destination_coordinates ON quotes USING GIST(destination_coordinates);

-- Function to update lane
CREATE OR REPLACE FUNCTION update_lane()
RETURNS TRIGGER AS $$
BEGIN
    NEW.lane := NEW.origin_city || ', ' || COALESCE(NEW.origin_state_province, '') || 
                ' → ' || 
                NEW.destination_city || ', ' || COALESCE(NEW.destination_state_province, '');
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_update_lane
    BEFORE INSERT OR UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_lane();

-- Function to calculate distance
CREATE OR REPLACE FUNCTION calculate_distance(
    origin_coord GEOGRAPHY,
    dest_coord GEOGRAPHY
)
RETURNS DECIMAL AS $$
BEGIN
    IF origin_coord IS NULL OR dest_coord IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN ST_Distance(origin_coord, dest_coord) / 1000.0;
END;
$$ LANGUAGE plpgsql;

